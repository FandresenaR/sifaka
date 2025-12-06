# API Migration Guide

## Current Status

The NestJS API (`apps/api`) has been temporarily moved to `sifaka-api-backup/` during the monorepo migration.

## Future Setup: Separate Repository

The API will be configured as a separate repository later. Here's how to set it up:

### 1. Create New Repository

```bash
# Create a new directory for the API
mkdir sifaka-api
cd sifaka-api

# Initialize git
git init

# Copy the API files
cp -r ../sifaka/sifaka-api-backup/* .
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database Connection

The API will share the same Neon database as the web application.

**Environment Variables** (`.env`):
```env
# Neon Database (same as web app)
DATABASE_URL="your-neon-connection-string"

# API Configuration
PORT=3001
NODE_ENV=development

# CORS (allow web app)
CORS_ORIGIN=http://localhost:3000
```

### 4. Update Database Schema

If using Prisma in the API:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate dev
```

### 5. Start the API

```bash
npm run dev
```

The API should run on `http://localhost:3001`

## Connecting Web App to API

In the web application (`.env`):

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then in your Next.js code:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchFromAPI(endpoint: string) {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
}
```

## Database Sharing

Both applications can safely share the same Neon database:

- **Web App**: Uses Prisma Client for database access
- **API**: Uses Prisma Client for database access
- **Schema**: Keep schema in sync using Prisma migrations

**Important**: Run migrations from only one application to avoid conflicts.

## Deployment

### Web App (Vercel/Netlify)
- Deploy from `main` branch
- Set environment variables in platform dashboard
- Database URL points to Neon

### API (Railway/Render/Heroku)
- Deploy from separate API repository
- Set environment variables
- Database URL points to same Neon database

## Notes

- The API backup is located in `sifaka-api-backup/`
- You can set up the separate repository whenever ready
- Both apps will continue to use the same Neon database
