import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * Endpoint OAuth callback
     * POST /auth/oauth/callback
     * Body: { code: string }
     */
    @Post('oauth/callback')
    @Public()
    async oauthCallback(@Body() body: { code: string }) {
        if (!body.code) {
            throw new HttpException(
                'Authorization code is required',
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            return await this.authService.exchangeGoogleCode(body.code);
        } catch (error) {
            throw new HttpException(
                error instanceof HttpException
                    ? error.message
                    : 'OAuth exchange failed',
                error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Endpoint de logout
     * POST /auth/logout
     */
    @Post('logout')
    async logout() {
        // Token est invalidé côté client en supprimant le localStorage
        return { message: 'Logged out successfully' };
    }
}
