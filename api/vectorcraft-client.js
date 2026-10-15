const { spawn } = require('node:child_process');
const readline = require('node:readline');

function decodeToolResult(reply) {
    if (reply?.isError) {
        const detail = (reply.content || []).map(item => item.text || '').join('\n');
        throw new Error(detail || 'VectorCraft command failed');
    }
    if (reply?.structuredContent) return reply.structuredContent;
    const text = (reply?.content || []).filter(item => item.type === 'text').map(item => item.text).join('\n').trim();
    if (!text) return reply;
    try { return JSON.parse(text); } catch { return text; }
}

class VectorCraftClient {
    constructor({ executable, readRoot, writeRoot }) {
        this.executable = executable;
        this.readRoot = readRoot;
        this.writeRoot = writeRoot;
        this.nextId = 1;
        this.pending = new Map();
        this.stderr = '';
    }

    async start() {
        const args = ['mcp', '--headless', '--automation-read-root', this.readRoot, '--automation-write-root', this.writeRoot];
        this.child = spawn(this.executable, args, { stdio: ['pipe', 'pipe', 'pipe'] });
        this.child.stderr.setEncoding('utf8');
        this.child.stderr.on('data', chunk => { this.stderr = (this.stderr + chunk).slice(-8000); });
        this.child.on('error', error => this.rejectPending(new Error(`Could not start VectorCraft CLI: ${error.message}`)));
        this.child.on('exit', code => this.rejectPending(new Error(`VectorCraft CLI exited (${code}): ${this.stderr.trim()}`)));
        const lines = readline.createInterface({ input: this.child.stdout });
        lines.on('line', line => {
            let message;
            try { message = JSON.parse(line); } catch { return; }
            if (message.id === undefined) return;
            const pending = this.pending.get(message.id);
            if (!pending) return;
            this.pending.delete(message.id);
            if (message.error) pending.reject(new Error(message.error.message || 'VectorCraft MCP error'));
            else pending.resolve(message.result);
        });
        await this.rpc('initialize', {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: { name: 'amea-headless-api', version: '1.0.0' },
        });
        this.notify('notifications/initialized', {});
    }

    rpc(method, params) {
        const id = this.nextId++;
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(id);
                reject(new Error(`VectorCraft request timed out: ${method}`));
            }, 5 * 60 * 1000);
            this.pending.set(id, {
                resolve: value => { clearTimeout(timeout); resolve(value); },
                reject: error => { clearTimeout(timeout); reject(error); },
            });
            this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`, error => {
                if (!error) return;
                this.pending.delete(id);
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    notify(method, params) {
        if (this.child && !this.child.killed) this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
    }

    async callTool(name, args = {}) {
        return decodeToolResult(await this.rpc('tools/call', { name, arguments: args }));
    }

    command(command, params = {}) {
        return this.callTool('run_command', { command, params });
    }

    rejectPending(error) {
        for (const item of this.pending.values()) item.reject(error);
        this.pending.clear();
    }

    async close() {
        if (!this.child) return;
        this.child.stdin.end();
        if (this.child.exitCode === null) {
            await new Promise(resolve => {
                const timer = setTimeout(() => { this.child.kill(); resolve(); }, 1500);
                this.child.once('exit', () => { clearTimeout(timer); resolve(); });
            });
        }
    }
}

module.exports = { VectorCraftClient };
