export declare class HealthController {
    getHealth(): {
        status: string;
        service: string;
        version: string;
        timestamp: string;
    };
}
