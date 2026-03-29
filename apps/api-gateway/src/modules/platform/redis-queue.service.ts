import net from 'node:net';
import tls from 'node:tls';

import { Injectable, Logger } from '@nestjs/common';

import { loadApiGatewayEnv } from '../../config/env.js';

function encodeCommand(parts: string[]) {
  return `*${parts.length}\r\n${parts
    .map((part) => `$${Buffer.byteLength(part)}\r\n${part}\r\n`)
    .join('')}`;
}

/**
 * Parses a single RESP (Redis Serialization Protocol) reply from the buffer.
 * Returns null when the buffer contains an incomplete response.
 */
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

/**
 * Lightweight Redis queue client supporting plain TCP, TLS, and password auth.
 *
 * Compatible with:
 *  - Local Redis:  redis://localhost:6379
 *  - Upstash:      rediss://default:<token>@<host>.upstash.io:6380
 *  - Any password-protected Redis: redis://:password@host:port
 */
@Injectable()
export class RedisQueueService {
  private readonly env = loadApiGatewayEnv();
  private readonly logger = new Logger(RedisQueueService.name);
  private readonly redisUrl = new URL(this.env.REDIS_URL);
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

  /**
   * Sends a RESP command to Redis over a fresh TCP or TLS connection.
   *
   * Supports Upstash's rediss:// scheme (TLS) and password authentication.
   * The connection is closed after each command to stay stateless and safe
   * for serverless environments (Vercel / Railway).
   */
  private sendCommand(parts: string[]) {
    const port = this.redisUrl.port ? Number(this.redisUrl.port) : 6379;
    const host = this.redisUrl.hostname || '127.0.0.1';
    const useTls = this.redisUrl.protocol === 'rediss:';
    // Upstash uses `rediss://default:<TOKEN>@host` — password is in the URL
    const password = this.redisUrl.password
      ? decodeURIComponent(this.redisUrl.password)
      : null;

    return new Promise<string | number | null>((resolve, reject) => {
      const socket: net.Socket = useTls
        ? tls.connect({ host, port, rejectUnauthorized: true })
        : net.createConnection({ host, port });

      let buffer = '';
      // Track whether we are still waiting for the AUTH reply before the real command
      let awaitingAuth = !!password;

      socket.setEncoding('utf8');

      socket.on('connect', () => {
        if (password) {
          // AUTH reply comes first, then we send the real command
          socket.write(encodeCommand(['AUTH', password]));
        } else {
          socket.write(encodeCommand(parts));
        }
      });

      socket.on('secureConnect', () => {
        // For TLS sockets the 'connect' event fires before the handshake
        // completes, so we rely on 'secureConnect' instead.
        if (password) {
          socket.write(encodeCommand(['AUTH', password]));
        } else {
          socket.write(encodeCommand(parts));
        }
      });

      socket.on('data', (chunk) => {
        buffer += chunk;

        try {
          const parsed = parseReply(buffer);

          if (parsed === null) {
            return;
          }

          if (awaitingAuth) {
            // AUTH reply received — clear buffer and send the actual command
            awaitingAuth = false;
            buffer = '';
            socket.write(encodeCommand(parts));
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
