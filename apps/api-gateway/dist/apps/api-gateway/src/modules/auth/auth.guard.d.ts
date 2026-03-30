import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersRepository } from './users.repository.js';
export declare class AuthenticationGuard implements CanActivate {
    private readonly reflector;
    private readonly usersRepository;
    private readonly env;
    constructor(reflector: Reflector, usersRepository: UsersRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractBearerToken;
}
