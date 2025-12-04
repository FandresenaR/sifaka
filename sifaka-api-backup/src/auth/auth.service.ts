import { Injectable } from '@nestjs/common';

export interface IAuthService {
    validateUser(token: string): Promise<any>;
}

@Injectable()
export class AuthService implements IAuthService {
    async validateUser(token: string): Promise<any> {
        // TODO: Implement actual validation logic (e.g., verify JWT, check Supabase)
        return { userId: 'test-user', token };
    }
}
