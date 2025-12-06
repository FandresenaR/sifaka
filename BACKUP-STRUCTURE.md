# Backup: Current Structure

## Date: 2025-12-04

## Current Directory Structure

```
sifaka/
├── .git/
├── .turbo/
├── apps/
│   ├── api/          (NestJS backend - to be separated later)
│   ├── web/          (Next.js frontend - extracting to root)
│   └── env.example
├── packages/
├── node_modules/
├── package.json      (monorepo config with Turbo)
├── package-lock.json
├── turbo.json
├── .gitignore
└── README.md
```

## Files Being Moved

### From `apps/web/` to root:
- `src/` → `src/`
- `public/` → `public/`
- `package.json` → `package.json` (replacing root)
- `next.config.ts` → `next.config.ts`
- `tailwind.config.ts` → `tailwind.config.ts`
- `tsconfig.json` → `tsconfig.json`
- `prisma/` → `prisma/`
- `.env` → `.env`
- `.env.local` → `.env.local` (if exists)
- `.eslintrc.json` → `.eslintrc.json` (if exists)
- `postcss.config.mjs` → `postcss.config.mjs` (if exists)

## Files Being Deleted

- `turbo.json`
- `.turbo/` directory
- `apps/` directory (after extraction)
- `packages/` directory
- Old root `package.json`

## API Separation

The `apps/api/` directory will be moved to a separate repository later.
For now, it will be temporarily preserved in a backup location.

## Rollback Instructions

If migration fails:
1. This backup file documents the original structure
2. Git history contains all original files
3. Use `git reset --hard HEAD` to revert (if committed)
4. Or restore from this documentation manually
