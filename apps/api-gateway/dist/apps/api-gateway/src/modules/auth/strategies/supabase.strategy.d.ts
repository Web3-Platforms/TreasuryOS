import { Strategy } from 'passport-jwt';
import { UsersRepository } from '../users.repository.js';
declare const SupabaseStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class SupabaseStrategy extends SupabaseStrategy_base {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        roles: import("@treasuryos/types").UserRole[];
    }>;
}
export {};
