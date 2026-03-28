import net from 'node:net';

import { Injectable, Logger } from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';

function encodeCommand(parts: string[]) {
  return `*${parts.length}\r\n${parts
    .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
    .join('')}`;
}

function parseReply(data: string) {
  if (data.length < 3) {
    return null;
  }

  const lineEnd = data.indexOf('\r\n');

  if (lineEnd === -1) {
    return null;
  }

  const prefix = data[0];
  const value = data.slice(1, lineEnd);

  if (prefix === '+') {
    return value;
  }

  if (prefix === ':') {
    return Number(value);
  }

  if (prefix === '-') {
    throw new Error(value);
  }

  throw new Error(`Unsupported Redis response prefix: ${prefix}`);
}

@Injectable()
export class RedisQueueService {
  private readonly env = loadApiGatewayEnv();
  private readonly logger = new Logger(RedisQueueService.name);
  private readonly redisUrl = new URL(this.env.REDIS_URL);
  private warnedOnAuth = false;
  private warnedOnUnavailable = false;

  async ping() {
    if (!this.env.REDIS_QUEUE_ENABLED) {
      return false;
    }

    try {
      const reply = await this.sendCommand(['PING']);
      this.warnedOnUnavailable = false;
      return reply === 'PONG';
    } catch (error) {
      this.warnUnavailable(error);
      return false;
    }
  }

  async enqueue(queueName: string, payload: Record<string, unknown>) {
    if (!this.env.REDIS_QUEUE_ENABLED) {
      return null;
    }

    try {
      const reply = await this.sendCommand([
        'LPUSH',
        queueName,
        JSON.stringify({
          ...payload,
          queuedAt: new Date().toISOString(),
        }),
      ]);

      this.warnedOnUnavailable = false;
      return typeof reply === 'number' ? reply : null;
    } catch (error) {
      this.warnUnavailable(error, queueName);
      return null;
    }
  }

  private warnUnavailable(error: unknown, queueName?: string) {
    if (this.warnedOnUnavailable) {
      return;
    }

    this.warnedOnUnavailable = true;
    this.logger.warn(
      queueName
        ? `Redis enqueue failed for queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`
        : `Redis queue is unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  private sendCommand(parts: string[]) {
    if (this.redisUrl.username || this.redisUrl.password) {
      if (!this.warnedOnAuth) {
        this.logger.warn('Redis URL authentication is not supported by the lightweight queue client yet.');
        this.warnedOnAuth = true;
      }

      return Promise.resolve(null);
    }

    const port = this.redisUrl.port ? Number(this.redisUrl.port) : 6379;
    const host = this.redisUrl.hostname || '127.0.0.1';

    return new Promise<string | number | null>((resolve, reject) => {
      const socket = net.createConnection({ host, port });
      let buffer = '';

      socket.setEncoding('utf8');

      socket.on('connect', () => {
        socket.write(encodeCommand(parts));
      });

      socket.on('data', (chunk) => {
        buffer += chunk;

        try {
          const parsed = parseReply(buffer);

          if (parsed === null) {
            return;
          }

          socket.end();
          resolve(parsed);
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });

      socket.on('error', (error) => {
        reject(error);
      });
    });
  }
}
