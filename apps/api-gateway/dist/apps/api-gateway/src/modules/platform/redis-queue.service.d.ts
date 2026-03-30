/**
 * Lightweight Redis queue client.
 *
 * Cloud (Upstash):  Uses the Upstash REST API via fetch() — no TCP sockets,
 *                   works in serverless and Docker without TLS complications.
 * Local dev:        Falls back to raw TCP when UPSTASH vars are not set.
 */
export declare class RedisQueueService {
    private readonly env;
    private readonly logger;
    private warnedOnUnavailable;
    /** True when Upstash REST credentials are configured */
    private get useUpstashRest();
    ping(): Promise<boolean>;
    enqueue(queueName: string, payload: Record<string, unknown>): Promise<number | null>;
    private upstashCommand;
    private tcpCommand;
    private warnUnavailable;
}
