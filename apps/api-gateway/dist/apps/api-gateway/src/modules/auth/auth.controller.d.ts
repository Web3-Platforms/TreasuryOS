import type { ApiRequest } from '../../common/http-request.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto, request: ApiRequest): Promise<{
        accessToken: string;
        user: import("@treasuryos/types").AuthenticatedUser;
    }>;
    getMe(request: ApiRequest): {
        user: import("@treasuryos/types").AuthenticatedUser;
    };
    private extractContext;
}
