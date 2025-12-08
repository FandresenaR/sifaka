# Changelog

## [Unreleased] - 2025-12-08

### Database & Prisma
- **Unified Connection**: Updated `apps/web/lib/prisma.ts` to use `@prisma/adapter-neon` with WebSockets by default. This resolves connection timeouts in environments where port 5432 is blocked (e.g., restricted corporate networks or specific cloud environments).
- **Configuration Alignment**: Fixed a mismatch where `apps/api` (NestJS) was connecting to a different database instance (`ep-patient-smoke...`) than `apps/web` (`ep-shy-fog...`). Both applications now share the correct database configuration.
- **Schema Sync**: Applied SQL migration to create the missing `Project` table and associated `ProjectType`/`ProjectStatus` enums using `scripts/apply-migration.ts` via WebSocket connection.

### Authentication (`apps/web/lib/auth.ts`)
- **Persisted Users**: Enabled the `PrismaAdapter` (previously commented out), ensuring that Google Auth logins properly create/update `User` records in the database.
- **Foreign Key Fix**: Resolved `Foreign key constraint violated` errors on project creation by fixing a User ID mismatch. The session now correctly uses the database's CUID (`user.id`) instead of the Google Profile ID (`profile.sub`).
- **User Sync**: Added manual upsert logic in `signIn` callback to ensure user data (email, name, image) is always synchronized with the database upon login.

### Scripts
- Added `apps/web/scripts/repro-error.ts` to reproduce Prisma query errors.
- Verified and utilized `apps/web/scripts/apply-migration.ts` for schema changes over WebSockets.
