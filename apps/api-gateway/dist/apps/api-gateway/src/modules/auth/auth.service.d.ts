import type { AuthenticatedUser } from '@treasuryos/types';
import { AuditService } from '../audit/audit.service.js';
import { DatabaseService } from '../database/database.service.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { UsersRepository } from './users.repository.js';
import { LoginDto } from './dto/login.dto.js';
type RequestContext = {
    ipAddress?: string;
    userAgent?: string;
};
export declare class AuthService {
    private readonly usersRepository;
    private readonly databaseService;
    private readonly auditService;
    private readonly queueService;
    constructor(usersRepository: UsersRepository, databaseService: DatabaseService, auditService: AuditService, queueService: RedisQueueService);
    login(input: LoginDto, context: RequestContext): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
    private toAuthenticatedUser;
}
export {};
