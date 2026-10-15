const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { parseMultipart, readBody } = require('./multipart');
const { processJob } = require('./processor');

const host = process.env.API_HOST || '127.0.0.1';
const port = Number(process.env.API_PORT || 8787);
const dataRoot = path.resolve(process.env.API_DATA_DIR || path.join(require('node:os').tmpdir(), 'amea-vectorcraft-api'));
const maxUploadBytes = Number(process.env.API_MAX_UPLOAD_BYTES || 100 * 1024 * 1024);
const vectorcraftCli = process.env.VECTORCRAFT_CLI || 'vectorcraft-cli';
const apiToken = process.env.API_TOKEN;
if (!['127.0.0.1', '::1', 'localhost'].includes(host) && !apiToken) {
    throw new Error('Set API_TOKEN before binding the API to a non-local host');
}
const jobs = new Map();
let queue = Promise.resolve();

async function persistJob(job) {
    const record = {
        id: job.id,
        root: job.root,
        inputDir: job.inputDir,
        outputDir: job.outputDir,
        workDir: job.workDir,
        files: job.files,
        rows: job.rows,
        status: job.status,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        progress: job.progress,
        outputs: job.outputs,
        error: job.error,
    };
    const filename = path.join(job.root, 'job.json');
    const temporary = `${filename}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(record), { mode: 0o600 });
    await fs.rename(temporary, filename);
}

async function restoreJobs() {
    await fs.mkdir(dataRoot, { recursive: true });
    for (const entry of await fs.readdir(dataRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const root = path.join(dataRoot, entry.name);
        try {
            const record = JSON.parse(await fs.readFile(path.join(root, 'job.json'), 'utf8'));
            if (record.id !== entry.name || !Array.isArray(record.files) || !Array.isArray(record.outputs)) continue;
            const job = { ...record };
            if (job.status === 'queued' || job.status === 'running') {
                job.status = 'failed';
                job.error = 'Job was interrupted when the API stopped';
                job.finishedAt = new Date().toISOString();
                await persistJob(job);
            }
            jobs.set(job.id, job);
        } catch (error) {
            if (error.code !== 'ENOENT') console.error(`Skipping unreadable job record in ${root}: ${error.message}`);
        }
    }
}

function send(response, status, value, headers = {}) {
    response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', ...headers });
    response.end(JSON.stringify(value));
}

function safeUploadName(name) {
    return path.basename(String(name || '').replace(/\\/g, '/')).replace(/[\x00-\x1f]/g, '_');
}

async function enqueue(job) {
    queue = queue.then(async () => {
        job.status = 'running';
        job.startedAt = new Date().toISOString();
        try {
            await persistJob(job);
            job.outputs = await processJob(job, { vectorcraftCli });
            job.status = 'complete';
        } catch (error) {
            job.status = 'failed';
            job.error = error.message || String(error);
        }
        job.finishedAt = new Date().toISOString();
        try {
            await persistJob(job);
        } catch (error) {
            console.error(`Could not persist job ${job.id}: ${error.message}`);
        }
    });
}

function jobSnapshot(job) {
    return {
        id: job.id,
        status: job.status,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        finishedAt: job.finishedAt,
        progress: job.progress,
        error: job.error,
        outputs: job.outputs.map(file => ({ name: file.name, url: `/jobs/${job.id}/outputs/${encodeURIComponent(file.name)}` })),
    };
}

async function handle(request, response) {
    if (request.method === 'OPTIONS') {
        response.writeHead(204, {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET, POST, OPTIONS',
            'access-control-allow-headers': 'content-type, authorization',
        });
        return response.end();
    }

    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (request.method === 'GET' && url.pathname === '/health') return send(response, 200, { status: 'ok' });
    if (apiToken) {
        const authorization = request.headers.authorization || '';
        const supplied = Buffer.from(authorization.startsWith('Bearer ') ? authorization.slice(7) : '');
        const expected = Buffer.from(apiToken);
        if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
            return send(response, 401, { error: 'Unauthorized' }, { 'www-authenticate': 'Bearer' });
        }
    }

    if (request.method === 'POST' && url.pathname === '/jobs') {
        const body = await readBody(request, maxUploadBytes);
        const parts = parseMultipart(request.headers['content-type'], body);
        const dataParts = parts.filter(part => !part.filename && part.name === 'data');
        if (dataParts.length > 1) throw Object.assign(new Error("Submit the 'data' JSON field only once"), { statusCode: 400 });
        if (!dataParts.length) {
            throw Object.assign(new Error("Submit a JSON array in the 'data' form field"), { statusCode: 400 });
        }
        if (parts.some(part => part.filename && path.extname(safeUploadName(part.filename)).toLowerCase() === '.xlsx')) {
            throw Object.assign(new Error('Excel workbook uploads are not supported; send the rows as JSON in the data field'), { statusCode: 400 });
        }
        let rows;
        try { rows = JSON.parse(dataParts[0].content.toString('utf8')); }
        catch { throw Object.assign(new Error("The 'data' field must contain valid JSON"), { statusCode: 400 }); }
        if (!Array.isArray(rows) || !rows.length) {
            throw Object.assign(new Error("The 'data' field must be a non-empty JSON array of row objects"), { statusCode: 400 });
        }
        const id = crypto.randomUUID();
        const root = path.join(dataRoot, id);
        const inputDir = path.join(root, 'input');
        const outputDir = path.join(root, 'outputs');
        const workDir = path.join(root, 'work');
        await Promise.all([fs.mkdir(inputDir, { recursive: true }), fs.mkdir(outputDir, { recursive: true }), fs.mkdir(workDir, { recursive: true })]);
        const files = [];
        const names = new Set();
        for (const part of parts) {
            if (!part.filename) continue;
            const originalName = safeUploadName(part.filename);
            if (!originalName) continue;
            const key = originalName.toLowerCase();
            if (names.has(key)) throw Object.assign(new Error(`Duplicate uploaded filename '${originalName}'`), { statusCode: 400 });
            names.add(key);
            const filePath = path.join(inputDir, originalName);
            await fs.writeFile(filePath, part.content, { flag: 'wx' });
            files.push({ originalName, path: filePath, size: part.content.length });
        }
        if (!files.some(file => ['.svg', '.pdf'].includes(path.extname(file.originalName).toLowerCase()))) {
            throw Object.assign(new Error('Upload the SVG or PDF template files referenced by the JSON rows'), { statusCode: 400 });
        }
        if (files.some(file => ['.ai', '.ait'].includes(path.extname(file.originalName).toLowerCase()))) {
            throw Object.assign(new Error('Illustrator .ai/.ait inputs are not supported. Convert templates and jigs to SVG or PDF.'), { statusCode: 400 });
        }
        const job = {
            id, root, inputDir, outputDir, workDir, files, rows,
            status: 'queued', createdAt: new Date().toISOString(), progress: { completed: 0, total: 0 },
            outputs: [], error: undefined,
        };
        jobs.set(id, job);
        await persistJob(job);
        await enqueue(job);
        return send(response, 202, jobSnapshot(job));
    }

    const outputMatch = /^\/jobs\/([^/]+)\/outputs\/([^/]+)$/.exec(url.pathname);
    if (request.method === 'GET' && outputMatch) {
        const job = jobs.get(outputMatch[1]);
        if (!job) return send(response, 404, { error: 'Job not found' });
        const filename = decodeURIComponent(outputMatch[2]);
        const output = job.outputs.find(file => file.name === filename);
        if (!output || job.status !== 'complete') return send(response, 404, { error: 'Output not found' });
        const extension = path.extname(filename).toLowerCase();
        const type = extension === '.svg' ? 'image/svg+xml' : 'application/pdf';
        response.writeHead(200, {
            'content-type': type,
            'content-disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
            'content-length': (await fs.stat(output.path)).size,
            'access-control-allow-origin': '*',
        });
        return fs.createReadStream(output.path).pipe(response);
    }

    const jobMatch = /^\/jobs\/([^/]+)(?:\/outputs)?$/.exec(url.pathname);
    if (request.method === 'GET' && jobMatch) {
        const job = jobs.get(jobMatch[1]);
        if (!job) return send(response, 404, { error: 'Job not found' });
        return send(response, 200, jobSnapshot(job));
    }

    return send(response, 404, { error: 'Route not found' });
}

const server = http.createServer((request, response) => {
    handle(request, response).catch(error => {
        if (response.headersSent) return response.destroy(error);
        send(response, error.statusCode || 500, { error: error.message || 'Internal server error' });
    });
});

restoreJobs().then(() => {
    server.listen(port, host, () => {
        console.log(`AMEA VectorCraft API listening at http://${host}:${port}`);
        console.log(`VectorCraft CLI: ${vectorcraftCli}`);
        console.log(`Restored ${jobs.size} job record(s)`);
    });
}).catch(error => {
    console.error(`Could not restore persisted jobs: ${error.message}`);
    process.exit(1);
});

function shutdown() {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
