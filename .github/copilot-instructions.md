# Sifaka CMS - AI Coding Agent Instructions

## Project Overview

Sifaka is a **TurboRepo monorepo** containing two distinct applications:
- **`apps/api`**: NestJS backend API (CRM/project management system)
- **`apps/web`**: Next.js 16 frontend (Zoahary Baobab CMS - e-commerce/blog platform)

⚠️ **Critical**: These apps have **separate databases** and serve different purposes. Do not conflate them.

## Architecture

### Monorepo Structure
```
apps/
  api/          # NestJS CRM backend (port 3001)
  web/          # Next.js CMS frontend (port 3000)
packages/
  types/        # Shared TypeScript types
zoahary-cms/    # Legacy CMS (archived, reference only)
```

### Database Strategy
- **API (`apps/api`)**: PostgreSQL via Prisma, schema at `apps/api/prisma/schema.prisma`
  - Generated client: `apps/api/src/generated/client`
  - Focuses on: Projects, Tasks, Clients, Users (multi-tenant CRM)
- **Web (`apps/web`)**: PostgreSQL via Prisma, schema at `apps/web/prisma/schema.prisma`
  - Focuses on: Products, BlogPosts, Media, NextAuth sessions
  - **Never** run Prisma commands from repo root - always `cd apps/web` first

### Authentication Patterns
- **API**: Custom auth service (basic implementation in `apps/api/src/auth`)
- **Web**: NextAuth v5 with Google OAuth + database sessions
  - Super admin hardcoded: `fandresenar6@gmail.com`
  - Role hierarchy: `SUPER_ADMIN` > `ADMIN` > `EDITOR` > `USER`
  - 2FA system with TOTP + backup codes (see `zoahary-cms/docs/2FA_*.md`)

## Development Workflows

### Starting the Monorepo
```bash
# Root - starts both apps concurrently
npm run dev

# Individual apps
cd apps/api && npm run start:dev  # NestJS watch mode
cd apps/web && npm run dev         # Next.js dev server
```

### Database Migrations
```bash
# API database
cd apps/api
npx prisma migrate dev --name description
npx prisma generate  # Generates to src/generated/client

# Web database  
cd apps/web
npx prisma migrate dev --name description
npx prisma generate  # Default location
npx prisma studio    # GUI at localhost:5555
```

**Never** use `prisma db push` in production - only for rapid prototyping.

### Building for Production
```bash
# Root (TurboRepo pipeline)
npm run build  # Builds all apps in dependency order

# Individual
cd apps/web
npm run build  # Runs: prisma generate → prisma migrate deploy → next build
```

## Critical Conventions

### NestJS Backend (`apps/api`)
1. **Global PrismaModule**: Exported from `src/prisma/prisma.module.ts`, use `@Global()` decorator
2. **Generated Prisma client**: Import from `'../generated/client'` not `'@prisma/client'`
3. **Validation**: `ValidationPipe` enabled globally in `main.ts`
4. **Module structure**: Feature modules (projects, tasks, clients) follow standard NestJS patterns

### Next.js Frontend (`apps/web`)
1. **App Router only** - no pages directory
2. **Server actions**: Prefer over API routes for form submissions
3. **Prisma singleton**: Always use `import prisma from '@/lib/prisma'` (singleton pattern prevents connection exhaustion)
4. **RBAC checks**: Use functions from `lib/rbac.ts` (not present in API)
   - `requireSuperAdmin()`, `checkPermission(Permission.X)`, etc.
5. **Admin layout protection**: `app/admin/layout.tsx` enforces auth + 2FA checks

### Role-Based Access Control (Web Only)
- Permission enums defined in `lib/rbac.ts` (if exists, or infer from docs)
- Super admin email (`fandresenar6@gmail.com`) has immutable `SUPER_ADMIN` role
- Auth callbacks in `lib/auth.ts` auto-upgrade super admin on sign-in
- Use `session.user.role` from NextAuth for frontend checks
- Backend endpoints use `requireSuperAdmin()` or `checkPermission()`

### AI Integration (Web)
- OpenRouter API for free LLM models (see `zoahary-cms/docs/AI-INTEGRATION.md`)
- Chat component: `components/ChatWindow.tsx`
- Auto-retry with model fallback on rate limits (429) or unavailability (503)
- New models (< 2 months old) grouped separately with ⭐ badge

### i18n Support (Web)
- Products have `titleFr`, `titleEn`, `descriptionFr`, `descriptionEn` fields
- No active i18n library detected - manual field selection based on locale

## Common Tasks

### Adding a New Feature Module (API)
1. Generate: `nest g module feature-name`
2. Add PrismaService to module imports
3. Create service: `nest g service feature-name`
4. Create controller: `nest g controller feature-name`
5. Import module in `app.module.ts`

### Adding a New Page (Web)
1. Create in `app/` directory (App Router)
2. For admin pages: place in `app/admin/`
3. Check auth in component or use layout-level protection
4. Use server components by default, `"use client"` only when needed

### Modifying Database Schema
```bash
# API
cd apps/api
# Edit prisma/schema.prisma
npx prisma migrate dev --name add_field_name
# Commit migration files in prisma/migrations/

# Web
cd apps/web  
# Edit prisma/schema.prisma
npx prisma migrate dev --name add_field_name
```

### Adding Admin Features (Web)
1. Check role in layout: `await requireSuperAdmin()` or `await isAdmin()`
2. Add menu items to `app/admin/layout.tsx` with role checks
3. Create API route in `app/api/...` with permission validation
4. Remember: SUPER_ADMIN can't be deleted or demoted (enforce in code)

## Troubleshooting

### Prisma "Table does not exist"
```bash
cd apps/web  # or apps/api
npx prisma migrate deploy
npx prisma generate
```

### 2FA Verification Loop
- User must **complete** setup (verify initial code) before `twoFactorEnabled = true`
- After enabling 2FA, sign out → sign in to test
- Use backup codes if locked out (10 codes generated at setup)
- Disable endpoint: `POST /api/2fa/disable` (see `zoahary-cms/docs/2FA_FLOW.md`)

### TurboRepo Cache Issues
```bash
rm -rf .turbo node_modules
npm install
```

### NextAuth Session Not Updating
- Session callback in `lib/auth.ts` checks DB user role on each request
- Super admin auto-upgrade runs in `session` callback
- Clear browser cookies if role changes don't reflect

## Key Files Reference

- `turbo.json` - Monorepo build pipeline config
- `apps/api/src/app.module.ts` - NestJS root module
- `apps/api/prisma/schema.prisma` - CRM database schema
- `apps/web/lib/auth.ts` - NextAuth configuration + super admin logic
- `apps/web/lib/prisma.ts` - Prisma client singleton
- `apps/web/prisma/schema.prisma` - CMS database schema
- `apps/web/.env.example` - Required environment variables template
- `zoahary-cms/docs/` - Detailed feature documentation (2FA, AI, RBAC, etc.)

## Anti-Patterns to Avoid

❌ Running Prisma commands from repo root
❌ Using `@prisma/client` in API code (use `'../generated/client'`)
❌ Modifying super admin email or allowing role downgrade
❌ Using `db push` in production
❌ Exposing OpenRouter API key to client-side code
❌ Forgetting to `cd apps/web` before web-related commands
❌ Mixing API and Web database schemas/concerns

## Environment Variables

### API (`apps/api/.env`)
```
DATABASE_URL=postgresql://...
PORT=3001
```

### Web (`apps/web/.env.local`)
```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
OPENROUTER_API_KEY=sk-or-v1-...  # For AI chat
```

## Testing Philosophy

- E2E test config exists: `apps/api/test/jest-e2e.json`
- No comprehensive test suite detected
- When adding tests: use `jest` for API, prefer Playwright/Cypress for Web
- Test 2FA flow manually: setup → logout → login → verify → access admin

## Additional Resources

- NestJS docs: https://docs.nestjs.com
- Next.js App Router: https://nextjs.org/docs/app
- NextAuth v5: https://authjs.dev
- Prisma: https://www.prisma.io/docs
- TurboRepo: https://turbo.build/repo/docs

---

**When in doubt**: Check `zoahary-cms/docs/` for feature-specific flows (2FA, AI, Prisma, User Management).
