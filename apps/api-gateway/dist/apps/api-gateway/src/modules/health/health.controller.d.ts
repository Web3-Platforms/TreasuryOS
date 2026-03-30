import { DatabaseService } from '../database/database.service.js';
export declare class HealthController {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    getHealth(): Promise<{
        status: string;
        service: string;
        version: string;
        timestamp: string;
        scope: {
            customerProfile: string;
            institutionId: string;
            queueName: string;
        };
    }>;
}
