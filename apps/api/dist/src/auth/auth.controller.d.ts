import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    oauthCallback(body: {
        code: string;
    }): Promise<{
        token: string;
        user: any;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
