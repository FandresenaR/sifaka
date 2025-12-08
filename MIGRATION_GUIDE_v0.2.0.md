# Migration Guide: v0.1.0 → v0.2.0

## Overview

Version 0.2.0 introduces **multi-tenant project architecture**, where all content (Products, Blog Posts, Media) must be associated with a Project. This is a **breaking change** that requires data migration.

## What Changed

### Database Schema

#### Before (v0.1.0)
```prisma
model Product {
  id      String @id
  titleFr String
  // ... no projectId
}

model BlogPost {
  id    String @id
  title String
  // ... no projectId
}
```

#### After (v0.2.0)
```prisma
model Product {
  id        String @id
  titleFr   String
  projectId String  // ✨ NEW - Required
  project   Project @relation(...)
}

model BlogPost {
  id        String @id
  title     String
  projectId String  // ✨ NEW - Required
  project   Project @relation(...)
}

model Media {
  id        String  @id
  projectId String?  // ✨ NEW - Optional (shared media)
  project   Project? @relation(...)
}

model Project {
  modules   Json?  // ✨ NEW - Feature configuration
  products  Product[]
  blogPosts BlogPost[]
  media     Media[]
}
```

## Migration Steps

### Step 1: Backup Your Database

```bash
# Export current data
npx prisma db pull
pg_dump $DATABASE_URL > backup_v0.1.0.sql
```

### Step 2: Update Code

```bash
git pull origin main
cd apps/web
npm install
npx prisma generate
```

### Step 3: Run Migrations

```bash
cd apps/web
npx prisma migrate deploy
```

This creates the `projectId` columns but leaves existing rows **NULL** (will fail constraints).

### Step 4: Migrate Existing Data

#### Option A: Automatic Script (Recommended)

Create a default project and assign all orphaned content:

```bash
cd apps/web
npx tsx scripts/migrate-to-projects.ts
```

This script will:
1. Check if you have existing projects
2. Create a "Legacy Content" project if none exist
3. Assign all products/posts without `projectId` to this project

#### Option B: Manual SQL

```sql
-- 1. Get your user ID (from session or database)
SELECT id, email FROM "User" WHERE email = 'your-email@example.com';

-- 2. Create default project (replace YOUR_USER_ID)
INSERT INTO "Project" (id, name, slug, type, status, "ownerId", "createdAt", "updatedAt")
VALUES (
  'legacy-project',
  'Legacy Content', 
  'legacy',
  'CUSTOM',
  'ACTIVE',
  'YOUR_USER_ID',
  NOW(),
  NOW()
);

-- 3. Assign orphaned products
UPDATE "Product" 
SET "projectId" = 'legacy-project' 
WHERE "projectId" IS NULL;

-- 4. Assign orphaned blog posts
UPDATE "BlogPost" 
SET "projectId" = 'legacy-project' 
WHERE "projectId" IS NULL;

-- 5. (Optional) Assign media to project or leave shared
UPDATE "Media" 
SET "projectId" = 'legacy-project' 
WHERE "projectId" IS NULL 
  AND type = 'product-image';  -- Only product images
```

### Step 5: Verify Migration

```bash
# Check for NULL projectIds
npx prisma studio

# Or via SQL
SELECT COUNT(*) FROM "Product" WHERE "projectId" IS NULL;
SELECT COUNT(*) FROM "BlogPost" WHERE "projectId" IS NULL;
```

Both should return `0`.

## Breaking Changes Checklist

- [ ] All `Product` records have a `projectId`
- [ ] All `BlogPost` records have a `projectId`
- [ ] At least one `Project` exists for each user
- [ ] APIs updated to filter by `projectId` (if custom)
- [ ] Frontend components pass `projectId` when creating content

## API Changes

### Before
```typescript
// Create product (v0.1.0)
POST /api/products
{
  "titleFr": "Mon produit",
  "price": 1000
}
```

### After
```typescript
// Create product (v0.2.0)
POST /api/products
{
  "titleFr": "Mon produit",
  "price": 1000,
  "projectId": "cm4abc123"  // ✨ Required
}
```

## Rollback Plan

If you need to revert:

```bash
# 1. Restore database backup
psql $DATABASE_URL < backup_v0.1.0.sql

# 2. Checkout previous version
git checkout v0.1.0
npm install
npx prisma generate
```

## FAQ

### Q: What happens to existing products/posts?
They remain in the database but **won't be accessible** until assigned to a project.

### Q: Can I have multiple projects?
Yes! Each user can create unlimited projects with isolated content.

### Q: Can media be shared across projects?
Yes! Set `projectId` to `null` for shared media, or assign to specific projects.

### Q: Do I need to update my code?
Only if you have custom API calls. All official routes now require `projectId`.

## Support

If you encounter issues:

1. Check migration logs: `apps/web/prisma/migrations/`
2. Review schema: `npx prisma studio`
3. Open an issue with error details

---

**Version**: 0.2.0  
**Date**: 2024-12-08  
**Migration Time**: ~2-5 minutes
