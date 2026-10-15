const path = require('node:path');

const DEFAULT_MAX_BYTES = 100 * 1024 * 1024;

async function readBody(request, maxBytes = DEFAULT_MAX_BYTES) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > maxBytes) {
            const error = new Error(`Upload exceeds the ${Math.floor(maxBytes / 1024 / 1024)} MB limit`);
            error.statusCode = 413;
            throw error;
        }
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

function parseMultipart(contentType, body) {
    const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
    if (!boundaryMatch) throw Object.assign(new Error('Expected multipart/form-data with a boundary'), { statusCode: 400 });
    const boundary = Buffer.from(`--${(boundaryMatch[1] || boundaryMatch[2]).trim()}`);
    const parts = [];
    let cursor = body.indexOf(boundary);
    while (cursor !== -1) {
        cursor += boundary.length;
        if (body[cursor] === 45 && body[cursor + 1] === 45) break;
        if (body[cursor] === 13 && body[cursor + 1] === 10) cursor += 2;
        const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), cursor);
        if (headerEnd === -1) break;
        const nextBoundary = body.indexOf(boundary, headerEnd + 4);
        if (nextBoundary === -1) break;
        let contentEnd = nextBoundary;
        if (body[contentEnd - 2] === 13 && body[contentEnd - 1] === 10) contentEnd -= 2;
        const headers = body.subarray(cursor, headerEnd).toString('utf8');
        const disposition = /content-disposition:\s*form-data;([^\r\n]+)/i.exec(headers)?.[1] || '';
        const fieldName = /(?:^|;)\s*name="([^"]*)"/i.exec(disposition)?.[1];
        const filenameRaw = /(?:^|;)\s*filename="([^"]*)"/i.exec(disposition)?.[1];
        if (fieldName) {
            const filename = filenameRaw ? path.basename(filenameRaw.replace(/\\/g, '/')) : undefined;
            parts.push({ name: fieldName, filename, content: body.subarray(headerEnd + 4, contentEnd) });
        }
        cursor = nextBoundary;
    }
    if (!parts.length) throw Object.assign(new Error('No multipart fields or files were submitted'), { statusCode: 400 });
    return parts;
}

module.exports = { parseMultipart, readBody };
