# Authentication Bypass for Development

This API now includes an authentication guard that automatically bypasses authentication when running in development mode.

## How It Works

The `AuthGuard` checks the `NODE_ENV` environment variable:
- **Development mode** (`NODE_ENV=development`): All routes are accessible without authentication
- **Production mode**: Authentication is enforced on all routes (except those marked with `@Public()`)

## Running in Development Mode

To run the API with authentication bypass:

```bash
# Set NODE_ENV to development
NODE_ENV=development npm run start:dev
```

Or add it to your `.env` file:
```
NODE_ENV=development
```

## Using the @Public Decorator

You can also mark specific routes as public (accessible without authentication in any environment):

```typescript
import { Public } from './auth/decorators/public.decorator';

@Controller('example')
export class ExampleController {
  @Public()
  @Get('public-route')
  getPublicData() {
    return { message: 'This route is always public' };
  }

  @Get('protected-route')
  getProtectedData() {
    // This route requires authentication in production
    return { message: 'This route is protected' };
  }
}
```

## Files Modified

- `apps/api/src/auth/auth.guard.ts` - Authentication guard with development bypass
- `apps/api/src/auth/decorators/public.decorator.ts` - Public route decorator
- `apps/api/src/auth/auth.module.ts` - Exports AuthGuard
- `apps/api/src/app.module.ts` - Registers AuthGuard globally
