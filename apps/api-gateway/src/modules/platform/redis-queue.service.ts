import { Injectable, Logger } from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';

/**
 * Lightweight Redis queue client.
 *
 * Cloud (Upstash):  Uses the Upstash REST API via fetch() — no TCP sockets,
 *                   works in serverless and Docker without TLS complications.
 * Local dev:        Falls back to raw TCP when UPSTASH vars are not set.
 */
@Injectable()
export class RedisQueueService {
  private readonly env = loadApiGatewayEnv();
  private readonly logger = new Logger(RedisQueueService.name);
  private warnedOnUnavailable = false;

  /** True when Upstash REST credentials are configured */
  private get useUpstashRest(): boolean {
    return Boolean(this.env.UPSTASH_REDIS_REST_URL && this.env.UPSTASH_REDIS_REST_TOKEN);
  }

  async ping(): Promise<boolean> {
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
    } catch (error) {
      this.warnUnavailable(error);
      return false;
    }
  }

  async enqueue(queueName: string, payload: Record<string, unknown>): Promise<number | null> {
    if (!this.env.REDIS_QUEUE_ENABLED) {
      return null;
    }

    const message = JSON.stringify({
      ...payload,
      queuedAt: new Date().toISOString(),
    });

    try {
      let reply: unknown;

      if (this.useUpstashRest) {
        reply = await this.upstashCommand(['LPUSH', queueName, message]);
      } else {
        reply = await this.tcpCommand(['LPUSH', queueName, message]);
      }

      this.warnedOnUnavailable = false;
      return typeof reply === 'number' ? reply : null;
    } catch (error) {
      this.warnUnavailable(error, queueName);
      return null;
    }
  }

  // ── Upstash REST transport ─────────────────────────────────

  private async upstashCommand(args: string[]): Promise<unknown> {
    const url = this.env.UPSTASH_REDIS_REST_URL!;
    const token = this.env.UPSTASH_REDIS_REST_TOKEN!;

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

    const data = (await response.json()) as { result: unknown };
    return data.result;
  }

  // ── Local TCP fallback (supports plain redis:// and TLS rediss://) ─────

  private tcpCommand(parts: string[]): Promise<string | number | null> {
    const redisUrl = new URL(this.env.REDIS_URL);
    const useTls = redisUrl.protocol === 'rediss:';

    if (useTls) {
      // Lazy-import tls for rediss:// (Upstash TLS) connections
      return import('node:tls').then(
        ({ connect }) =>
          new Promise<string | number | null>((resolve, reject) => {
            const port = redisUrl.port ? Number(redisUrl.port) : 6380;
            const host = redisUrl.hostname || '127.0.0.1';

            const socket = connect({ host, port });
            let buffer = '';

            socket.setEncoding('utf8');

            socket.on('secureConnect', () => {
              socket.write(encodeRespCommand(parts));
            });

            socket.on('data', (chunk: string) => {
              buffer += chunk;
              try {
                const parsed = parseRespReply(buffer);
                if (parsed === null) return;
                socket.end();
                resolve(parsed);
              } catch (error) {
                socket.destroy();
                reject(error);
              }
            });

            socket.on('error', (error: Error) => reject(error));
          }),
      );
    }

    // Lazy-import net to avoid bundling issues in serverless
    return import('node:net').then(
      ({ createConnection }) =>
        new Promise<string | number | null>((resolve, reject) => {
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
              if (parsed === null) return;
              socket.end();
              resolve(parsed);
            } catch (error) {
              socket.destroy();
              reject(error);
            }
          });

          socket.on('error', (error) => reject(error));
        }),
    );
  }

  private warnUnavailable(error: unknown, queueName?: string) {
    if (this.warnedOnUnavailable) return;
    this.warnedOnUnavailable = true;
    this.logger.warn(
      queueName
        ? `Redis enqueue failed for queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`
        : `Redis queue is unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

// ── RESP protocol helpers (local dev only) ─────────────────

function encodeRespCommand(parts: string[]) {
  return `*${parts.length}\r\n${parts
    .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
    .join('')}`;
}

function parseRespReply(data: string): string | number | null {
  if (data.length < 3) return null;
  const lineEnd = data.indexOf('\r\n');
  if (lineEnd === -1) return null;
  const prefix = data[0];
  const value = data.slice(1, lineEnd);
  if (prefix === '+') return value;
  if (prefix === ':') return Number(value);
  if (prefix === '-') throw new Error(value);
  throw new Error(`Unsupported Redis response prefix: ${prefix}`);
}
