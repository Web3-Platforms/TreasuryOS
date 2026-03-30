import { z } from 'zod';
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_GATEWAY_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long'),
    JWT_EXPIRES_IN: z.string().default('1h'),
    NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
});
export function loadApiGatewayEnv(env = process.env) {
    return envSchema.parse(env);
}
//# sourceMappingURL=env.js.map