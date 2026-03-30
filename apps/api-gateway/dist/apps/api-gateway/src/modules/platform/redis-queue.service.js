var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisQueueService_1;
import { Injectable, Logger } from '@nestjs/common';
import { loadApiGatewayEnv } from '../../config/env.js';
/**
 * Lightweight Redis queue client.
 *
 * Cloud (Upstash):  Uses the Upstash REST API via fetch() — no TCP sockets,
 *                   works in serverless and Docker without TLS complications.
 * Local dev:        Falls back to raw TCP when UPSTASH vars are not set.
 */
let RedisQueueService = RedisQueueService_1 = class RedisQueueService {
    env = loadApiGatewayEnv();
    logger = new Logger(RedisQueueService_1.name);
    warnedOnUnavailable = false;
    /** True when Upstash REST credentials are configured */
    get useUpstashRest() {
        return Boolean(this.env.UPSTASH_REDIS_REST_URL && this.env.UPSTASH_REDIS_REST_TOKEN);
    }
    async ping() {
        if (!this.env.REDIS_QUEUE_ENABLED) {
            return false;
        }
        try {
            if (this.useUpstashRest) {
                const result = await this.upstashCommand(['PING']);
                this.warnedOnUnavailable = false;
                return result === 'PONG';
            }
            const result = await this.tcpCommand(['PING']);
            this.warnedOnUnavailable = false;
            return result === 'PONG';
        }
        catch (error) {
            this.warnUnavailable(error);
            return false;
        }
    }
    async enqueue(queueName, payload) {
        if (!this.env.REDIS_QUEUE_ENABLED) {
            return null;
        }
        const message = JSON.stringify({
            ...payload,
            queuedAt: new Date().toISOString(),
        });
        try {
            let reply;
            if (this.useUpstashRest) {
                reply = await this.upstashCommand(['LPUSH', queueName, message]);
            }
            else {
                reply = await this.tcpCommand(['LPUSH', queueName, message]);
            }
            this.warnedOnUnavailable = false;
            return typeof reply === 'number' ? reply : null;
        }
        catch (error) {
            this.warnUnavailable(error, queueName);
            return null;
        }
    }
    // ── Upstash REST transport ─────────────────────────────────
    async upstashCommand(args) {
        const url = this.env.UPSTASH_REDIS_REST_URL;
        const token = this.env.UPSTASH_REDIS_REST_TOKEN;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(args),
        });
        if (!response.ok) {
            const text = await response.text().catch(() => 'unknown');
            throw new Error(`Upstash REST ${response.status}: ${text}`);
        }
        const data = (await response.json());
        return data.result;
    }
    // ── Local TCP fallback (supports plain redis:// and TLS rediss://) ─────
    tcpCommand(parts) {
        const redisUrl = new URL(this.env.REDIS_URL);
        const useTls = redisUrl.protocol === 'rediss:';
        if (useTls) {
            // Lazy-import tls for rediss:// (Upstash TLS) connections
            return import('node:tls').then(({ connect }) => new Promise((resolve, reject) => {
                const port = redisUrl.port ? Number(redisUrl.port) : 6380;
                const host = redisUrl.hostname || '127.0.0.1';
                const socket = connect({ host, port });
                let buffer = '';
                socket.setEncoding('utf8');
                socket.on('secureConnect', () => {
                    socket.write(encodeRespCommand(parts));
                });
                socket.on('data', (chunk) => {
                    buffer += chunk;
                    try {
                        const parsed = parseRespReply(buffer);
                        if (parsed === null)
                            return;
                        socket.end();
                        resolve(parsed);
                    }
                    catch (error) {
                        socket.destroy();
                        reject(error);
                    }
                });
                socket.on('error', (error) => reject(error));
            }));
        }
        // Lazy-import net to avoid bundling issues in serverless
        return import('node:net').then(({ createConnection }) => new Promise((resolve, reject) => {
            const port = redisUrl.port ? Number(redisUrl.port) : 6379;
            const host = redisUrl.hostname || '127.0.0.1';
            const socket = createConnection({ host, port });
            let buffer = '';
            socket.setEncoding('utf8');
            socket.on('connect', () => {
                socket.write(encodeRespCommand(parts));
            });
            socket.on('data', (chunk) => {
                buffer += chunk;
                try {
                    const parsed = parseRespReply(buffer);
                    if (parsed === null)
                        return;
                    socket.end();
                    resolve(parsed);
                }
                catch (error) {
                    socket.destroy();
                    reject(error);
                }
            });
            socket.on('error', (error) => reject(error));
        }));
    }
    warnUnavailable(error, queueName) {
        if (this.warnedOnUnavailable)
            return;
        this.warnedOnUnavailable = true;
        this.logger.warn(queueName
            ? `Redis enqueue failed for queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`
            : `Redis queue is unavailable: ${error instanceof Error ? error.message : String(error)}`);
    }
};
RedisQueueService = RedisQueueService_1 = __decorate([
    Injectable()
], RedisQueueService);
export { RedisQueueService };
// ── RESP protocol helpers (local dev only) ─────────────────
function encodeRespCommand(parts) {
    return `*${parts.length}\r\n${parts
        .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
        .join('')}`;
}
function parseRespReply(data) {
    if (data.length < 3)
        return null;
    const lineEnd = data.indexOf('\r\n');
    if (lineEnd === -1)
        return null;
    const prefix = data[0];
    const value = data.slice(1, lineEnd);
    if (prefix === '+')
        return value;
    if (prefix === ':')
        return Number(value);
    if (prefix === '-')
        throw new Error(value);
    throw new Error(`Unsupported Redis response prefix: ${prefix}`);
}
//# sourceMappingURL=redis-queue.service.js.map