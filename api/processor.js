const fs = require('node:fs/promises');
const path = require('node:path');
const { VectorCraftClient } = require('./vectorcraft-client');

const FLAGS = new Set(['mirror-horizontally', 'mirror-vertically', 'rotate-clockwise', 'rotate-counter-clockwise']);

function basenameKey(value) {
    return path.basename(String(value || '').replace(/\\/g, '/')).toLowerCase();
}

function normalizeRow(source, files, rowLabel) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
        throw new Error(`${rowLabel} must be an object`);
    }
    const row = { ...source };
    row['Output name'] = row['Output name'] ?? row.Name;
    row['Output type'] = String(row['Output type'] ?? row['Ouput type'] ?? 'pdf').toLowerCase();
    row.Template = row.Template && String(row.Template);
    row.Jig = row.Jig ? String(row.Jig) : undefined;
    row.Quantity = Number(row.Quantity);
    if (!row['Output name'] || !row.Template || !Number.isInteger(row.Quantity) || row.Quantity < 1) {
        throw new Error(`${rowLabel} requires Name/Output name, Template, and a positive integer Quantity`);
    }
    if (!['pdf', 'svg'].includes(row['Output type'])) {
        throw new Error(`${rowLabel} has unsupported output type '${row['Output type']}'. Use pdf or svg.`);
    }
    const template = files.get(basenameKey(row.Template));
    if (!template) throw new Error(`${rowLabel} references missing template '${row.Template}'`);
    if (!['.svg', '.pdf'].includes(path.extname(template.originalName).toLowerCase())) {
        throw new Error(`${rowLabel} template must be an SVG or PDF`);
    }
    row.TemplatePath = template.path;
    if (row.Flags && typeof row.Flags === 'string') {
        try { row.Flags = JSON.parse(row.Flags); } catch { throw new Error(`${rowLabel} Flags must be a JSON array`); }
    }
    row.Flags = row.Flags || [];
    if (!Array.isArray(row.Flags) || row.Flags.some(flag => !FLAGS.has(flag))) {
        throw new Error(`${rowLabel} contains an unknown template flag`);
    }
    return row;
}

function normalizeJsonRows(rows, files) {
    if (!Array.isArray(rows) || !rows.length) throw new Error('JSON data must be a non-empty array of row objects');
    return rows.map((row, index) => normalizeRow(row, files, `JSON row ${index + 1}`));
}

function parseToolValue(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return value;
    if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
    }
    return value;
}

function normalizeMatches(result) {
    const value = parseToolValue(result);
    if (Array.isArray(value)) return value;
    return value?.matches || value?.result?.matches || [];
}

function nodeBounds(node) {
    const value = parseToolValue(node);
    const bounds = value?.bounds || value?.geometry?.bounds || value?.position;
    if (Array.isArray(bounds) && bounds.length >= 4) {
        const [x1, y1, x2, y2] = bounds;
        return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
    }
    if (bounds && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(Number(bounds[key])))) {
        return { x: Number(bounds.x), y: Number(bounds.y), width: Number(bounds.width), height: Number(bounds.height) };
    }
    return undefined;
}

async function findNamed(client, name, kind) {
    const result = await client.command('document.find', { name, ...(kind ? { kind } : {}), limit: 1000 });
    return normalizeMatches(result).filter(match => String(match.name || '').toLowerCase() === name.toLowerCase());
}

async function fillNamedObjects(client, row, assetMap) {
    for (const [field, rawValue] of Object.entries(row)) {
        if (['Output name', 'Output type', 'Name', 'Ouput type', 'Template', 'TemplatePath', 'Jig', 'Flags', 'Quantity'].includes(field)) continue;
        const value = String(rawValue);
        const named = await findNamed(client, field);
        if (!named.length) continue;
        if (value === '') {
            for (const node of named) await client.command('object.setProps', { ids: [node.id], visible: false });
            continue;
        }
        const textNodes = named.filter(node => node.kind === 'Type');
        for (const node of textNodes) {
            await client.command('text.setText', { id: node.id, text: value });
        }
        const asset = assetMap.get(basenameKey(value));
        if (!asset) continue;
        const replaceNodes = named.filter(node => ['Image', 'Group', 'Clip Group', 'Path', 'Compound Path', 'Rectangle'].includes(node.kind));
        for (const node of replaceNodes) {
            const detail = await client.command('document.node', { id: node.id });
            const bounds = nodeBounds(detail);
            if (!bounds || bounds.width <= 0 || bounds.height <= 0) {
                throw new Error(`Cannot determine bounds of template field '${field}'`);
            }
            await client.command('edit.clear', { ids: [node.id] });
            await client.command('file.place', { path: asset.path, rect: [bounds.x, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height] });
        }
    }
}

async function applyColors(client, row) {
    const swatchResult = await client.command('swatch.list');
    const value = parseToolValue(swatchResult);
    const swatches = Array.isArray(value) ? value : (value?.swatches || value?.items || []);
    const variables = new Set();
    for (const swatch of swatches) {
        const match = /^AMEA-COLOR=(.+)$/.exec(swatch.name || '');
        if (!match) continue;
        variables.add(match[1]);
        const color = row[match[1]];
        if (!color) throw new Error(`Missing color value for template variable '${match[1]}'`);
        if (!/^#?[0-9a-f]{6}$/i.test(String(color))) throw new Error(`Color '${match[1]}' must be a six-digit hex value`);
        await client.command('swatch.edit', { name: swatch.name, color: String(color).startsWith('#') ? color : `#${color}` });
    }
    return variables;
}

async function applyFlags(client, flags) {
    if (!flags.length) return;
    await client.command('select.all');
    for (const flag of flags) {
        if (flag === 'mirror-horizontally') await client.callTool('transform', { scaleX: -1 });
        if (flag === 'mirror-vertically') await client.callTool('transform', { scaleY: -1 });
        if (flag === 'rotate-clockwise') await client.callTool('transform', { rotate: -90 });
        if (flag === 'rotate-counter-clockwise') await client.callTool('transform', { rotate: 90 });
    }
}

async function exportTemplate(client, row, outputPath) {
    await client.callTool('open_file', { path: row.TemplatePath });
    const colorVariables = await applyColors(client, row);
    await fillNamedObjects(client, row, row.assetMap);
    for (const [field, rawValue] of Object.entries(row)) {
        if (['Output name', 'Output type', 'Name', 'Ouput type', 'Template', 'TemplatePath', 'Jig', 'Flags', 'Quantity'].includes(field)) continue;
        if (rawValue !== '' && colorVariables.has(field) && !(await findNamed(client, field)).length) continue;
        if (rawValue !== '' && !(await findNamed(client, field)).length) {
            throw new Error(`Template field '${field}' was not found in '${path.basename(row.TemplatePath)}'`);
        }
    }
    await applyFlags(client, row.Flags);
    await client.callTool('export', { path: outputPath, format: row['Output type'] });
}

async function packJig(client, jigPath, sourceFiles, jigName, outputDir, reservedNames) {
    const results = [];
    const getSlots = async () => {
        const slotNodes = (await findNamed(client, 'slot')).filter(node => ['Path', 'Compound Path', 'Rectangle'].includes(node.kind));
        const slots = [];
        for (const slot of slotNodes) {
            const bounds = nodeBounds(await client.command('document.node', { id: slot.id }));
            if (bounds && bounds.width > 0 && bounds.height > 0) slots.push({ id: slot.id, bounds });
        }
        if (!slots.length) throw new Error(`Jig '${jigName}' has no named slot objects with readable bounds`);
        return slots;
    };
    await client.callTool('open_file', { path: jigPath });
    const slotCount = (await getSlots()).length;
    for (let offset = 0, page = 1; offset < sourceFiles.length; offset += slotCount, page++) {
        if (offset > 0) await client.callTool('open_file', { path: jigPath });
        const currentSlots = await getSlots();
        await client.command('edit.clear', { ids: currentSlots.map(slot => slot.id) });
        const pageFiles = sourceFiles.slice(offset, offset + currentSlots.length);
        for (let index = 0; index < pageFiles.length; index++) {
            const bounds = currentSlots[index].bounds;
            await client.command('file.place', { path: pageFiles[index], at: [bounds.x + bounds.width / 2, bounds.y + bounds.height / 2] });
        }
        const allocated = uniquePath(outputDir, `${safeFileName(path.parse(jigName).name)}-${page}.pdf`, reservedNames);
        const outputName = allocated.name;
        const outputPath = allocated.path;
        await client.callTool('export', { path: outputPath, format: 'pdf' });
        results.push({ name: outputName, path: outputPath });
    }
    return results;
}

function safeFileName(name) {
    const value = String(name).replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').replace(/^\.+$/, '_').trim();
    return value || 'output';
}

function uniquePath(directory, requestedName, reserved) {
    const parsed = path.parse(requestedName);
    let candidate = requestedName;
    let suffix = 2;
    while (reserved.has(candidate.toLowerCase())) {
        candidate = `${parsed.name}-${suffix++}${parsed.ext}`;
    }
    reserved.add(candidate.toLowerCase());
    return { name: candidate, path: path.join(directory, candidate) };
}

async function processJob(job, options) {
    const files = new Map(job.files.map(file => [basenameKey(file.originalName), file]));
    const rows = normalizeJsonRows(job.rows, files);
    const client = new VectorCraftClient({
        executable: options.vectorcraftCli,
        readRoot: job.root,
        writeRoot: job.root,
    });
    await client.start();
    const outputFiles = [];
    const generatedDir = path.join(job.workDir, 'generated');
    await fs.mkdir(generatedDir, { recursive: true });
    const jigGroups = new Map();
    const reservedNames = new Set();
    job.totalOutputs = rows.reduce((sum, item) => sum + item.Quantity, 0);
    try {
        let rowNumber = 0;
        for (const row of rows) {
            row.assetMap = files;
            for (let quantity = 1; quantity <= row.Quantity; quantity++) {
                rowNumber++;
                job.progress = { completed: rowNumber - 1, total: job.totalOutputs };
                const desiredName = `${safeFileName(row['Output name'])}${row.Quantity > 1 ? ` ${quantity}` : ''}.${row['Output type']}`;
                const allocated = uniquePath(generatedDir, desiredName, reservedNames);
                const outputName = allocated.name;
                const outputPath = allocated.path;
                await exportTemplate(client, row, outputPath);
                if (row.Jig) {
                    const jigPath = files.get(basenameKey(row.Jig));
                    if (!jigPath) throw new Error(`Row ${rowNumber + 1} references missing jig '${row.Jig}'`);
                    if (!['.svg', '.pdf'].includes(path.extname(jigPath.originalName).toLowerCase())) {
                        throw new Error(`Jig '${row.Jig}' must be an SVG or PDF`);
                    }
                    const group = jigGroups.get(row.Jig) || { jigPath: jigPath.path, sourceFiles: [] };
                    group.sourceFiles.push(outputPath);
                    jigGroups.set(row.Jig, group);
                } else {
                    const finalPath = path.join(job.outputDir, outputName);
                    await fs.copyFile(outputPath, finalPath);
                    outputFiles.push({ name: outputName, path: finalPath });
                }
            }
        }
        for (const [jigName, group] of jigGroups) {
            outputFiles.push(...await packJig(client, group.jigPath, group.sourceFiles, jigName, job.outputDir, reservedNames));
        }
    } finally {
        await client.close();
    }
    job.progress = { completed: job.totalOutputs, total: job.totalOutputs };
    return outputFiles;
}

module.exports = { processJob };
