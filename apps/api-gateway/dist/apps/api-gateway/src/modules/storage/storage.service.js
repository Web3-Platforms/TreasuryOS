var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StorageService_1;
import { Injectable, Logger } from '@nestjs/common';
import https from 'node:https';
import { loadApiGatewayEnv } from '../../config/env.js';
/**
 * Supabase Storage service for compliance documents and artifacts.
 *
 * Uses the Supabase Storage REST API directly (no SDK dependency) so the
 * service stays lightweight and compatible with serverless runtimes.
 *
 * Required environment variables:
 *   SUPABASE_URL           – e.g. https://<ref>.supabase.co
 *   SUPABASE_SERVICE_KEY   – service_role key (server-side only, never public)
 *   SUPABASE_STORAGE_BUCKET – target bucket name (default: "compliance-docs")
 */
let StorageService = StorageService_1 = class StorageService {
    logger = new Logger(StorageService_1.name);
    supabaseUrl;
    serviceKey;
    bucket = 'compliance-docs';
    enabled = false;
    onModuleInit() {
        const env = loadApiGatewayEnv();
        this.supabaseUrl = env.SUPABASE_URL;
        this.serviceKey = env.SUPABASE_SERVICE_KEY;
        this.bucket = env.SUPABASE_STORAGE_BUCKET ?? 'compliance-docs';
        if (this.supabaseUrl && this.serviceKey) {
            this.enabled = true;
            this.logger.log(`Supabase Storage enabled. Bucket: ${this.bucket}`);
        }
        else {
            this.logger.warn('Supabase Storage is disabled — SUPABASE_URL or SUPABASE_SERVICE_KEY is not set.');
        }
    }
    isEnabled() {
        return this.enabled;
    }
    /**
     * Uploads a file to Supabase Storage.
     *
     * @param key       – object key / path inside the bucket (e.g. "kyc/entity-123/passport.pdf")
     * @param content   – raw file contents as Buffer or string
     * @param mimeType  – MIME type of the file (e.g. "application/pdf")
     */
    async upload(key, content, mimeType) {
        if (!this.enabled) {
            throw new Error('Supabase Storage is not configured.');
        }
        const body = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
        const endpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`;
        await this.request('POST', endpoint, body, {
            'Content-Type': mimeType,
            'x-upsert': 'true',
        });
        return {
            key,
            bucket: this.bucket,
            url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`,
        };
    }
    /**
     * Creates a short-lived signed URL for private-bucket object access.
     *
     * @param key       – object key inside the bucket
     * @param expiresIn – validity in seconds (default: 3600)
     */
    async createSignedUrl(key, expiresIn = 3600) {
        if (!this.enabled) {
            throw new Error('Supabase Storage is not configured.');
        }
        const endpoint = `${this.supabaseUrl}/storage/v1/object/sign/${this.bucket}/${key}`;
        const response = await this.request('POST', endpoint, Buffer.from(JSON.stringify({ expiresIn }), 'utf8'), { 'Content-Type': 'application/json' });
        return `${this.supabaseUrl}${response.signedURL}`;
    }
    /**
     * Deletes an object from Supabase Storage.
     */
    async delete(key) {
        if (!this.enabled) {
            throw new Error('Supabase Storage is not configured.');
        }
        const endpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`;
        await this.request('DELETE', endpoint, undefined, {});
    }
    // ────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────────────────────
    request(method, url, body, extraHeaders = {}) {
        return new Promise((resolve, reject) => {
            const parsed = new URL(url);
            const options = {
                hostname: parsed.hostname,
                port: parsed.port || 443,
                path: parsed.pathname + parsed.search,
                method,
                headers: {
                    Authorization: `Bearer ${this.serviceKey}`,
                    apikey: this.serviceKey,
                    ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
                    ...extraHeaders,
                },
            };
            const req = https.request(options, (res) => {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    const raw = Buffer.concat(chunks).toString('utf8');
                    if (res.statusCode && res.statusCode >= 400) {
                        reject(new Error(`Supabase Storage ${method} ${url} failed [${res.statusCode}]: ${raw}`));
                        return;
                    }
                    try {
                        resolve(raw ? JSON.parse(raw) : undefined);
                    }
                    catch {
                        resolve(undefined);
                    }
                });
            });
            req.on('error', reject);
            if (body) {
                req.write(body);
            }
            req.end();
        });
    }
};
StorageService = StorageService_1 = __decorate([
    Injectable()
], StorageService);
export { StorageService };
//# sourceMappingURL=storage.service.js.map