# Changelog

## [0.2.0] - 2024-12-08

### Added - Multi-Tenant Project Architecture 🎯
- **Project-Scoped Data Management**: Each project now has isolated Products, Blog Posts, and Media
  - Added `projectId` foreign key to `Product`, `BlogPost` models (required)
  - Added `projectId` to `Media` model (optional - allows shared media)
  - Projects can configure enabled modules via `modules` JSON field
  - Cascade deletion: deleting a project removes all associated content
- **Project Management UI**
  - `/admin/projects` - List view with status indicators and type icons
  - `/admin/projects/[slug]` - Settings page with full CRUD operations
  - Project dashboard card in admin home
  - API routes: GET, POST, PATCH, DELETE for projects
- **Enhanced User Management**
  - Automatic user upsert on OAuth sign-in (fixes foreign key errors)
  - User records persisted to database with NextAuth PrismaAdapter
  - Super admin auto-upgrade for `fandresenar6@gmail.com`

### Changed
- **Breaking**: `Product.projectId` now **required** - all products must belong to a project
- **Breaking**: `BlogPost.projectId` now **required** - all blog posts must belong to a project
- `Media.projectId` is **optional** - media can be project-specific or shared
- Improved project deletion button visibility (red background with border)
- Updated migration workflow documentation for both API and Web apps

### Fixed
- Foreign key constraint violations on project creation (User records now created on sign-in)
- Missing columns in API database (`supabaseId`, `avatar`, `lastLoginAt`)
- Prisma schema deployment for Neon with driver adapters
- Connection timeouts in restricted network environments

### Technical
- **Migrations**: 
  - `20241207000001_add_project_model` - Initial project schema
  - `add_multi_tenant_support` - Multi-tenant foreign keys
- **API Schema**: Deploy via `npx tsx scripts/deploy-schema.ts` (Neon WebSocket)
- **Web Schema**: Standard Prisma migrations with `npx prisma migrate dev`

### Migration Guide
⚠️ **Existing Data**: Assign orphaned content to a project:

```sql
-- Create default project (update ownerId with your user ID)
INSERT INTO "Project" (id, name, slug, type, status, "ownerId", "createdAt", "updatedAt")
VALUES ('default-proj', 'Legacy Content', 'legacy', 'CUSTOM', 'ACTIVE', 'YOUR_USER_ID', NOW(), NOW());

-- Assign existing content
UPDATE "Product" SET "projectId" = 'default-proj' WHERE "projectId" IS NULL;
UPDATE "BlogPost" SET "projectId" = 'default-proj' WHERE "projectId" IS NULL;
```

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
