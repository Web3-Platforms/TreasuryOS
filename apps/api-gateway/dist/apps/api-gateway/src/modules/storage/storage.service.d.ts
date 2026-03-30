import { OnModuleInit } from '@nestjs/common';
export interface StorageUploadResult {
    key: string;
    bucket: string;
    url: string;
}
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
export declare class StorageService implements OnModuleInit {
    private readonly logger;
    private supabaseUrl;
    private serviceKey;
    private bucket;
    private enabled;
    onModuleInit(): void;
    isEnabled(): boolean;
    /**
     * Uploads a file to Supabase Storage.
     *
     * @param key       – object key / path inside the bucket (e.g. "kyc/entity-123/passport.pdf")
     * @param content   – raw file contents as Buffer or string
     * @param mimeType  – MIME type of the file (e.g. "application/pdf")
     */
    upload(key: string, content: Buffer | string, mimeType: string): Promise<StorageUploadResult>;
    /**
     * Creates a short-lived signed URL for private-bucket object access.
     *
     * @param key       – object key inside the bucket
     * @param expiresIn – validity in seconds (default: 3600)
     */
    createSignedUrl(key: string, expiresIn?: number): Promise<string>;
    /**
     * Deletes an object from Supabase Storage.
     */
    delete(key: string): Promise<void>;
    private request;
}
