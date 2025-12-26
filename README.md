# Sifaka CMS - TurboRepo Monorepo

A modern, multi-tenant Content Management System with NestJS API and Next.js frontend.

## 📦 Version 0.2.0

**Latest Release**: Multi-Tenant Project Architecture  
**Release Date**: December 8, 2024

See [CHANGELOG.md](./CHANGELOG.md) for full release notes.

## 🏗️ Architecture

This is a **TurboRepo monorepo** containing:

- **`apps/api`**: NestJS backend (CRM/Project Management) - Port 3001
- **`apps/web`**: Next.js 16 frontend (Zoahary Baobab CMS) - Port 3000
- **`packages/types`**: Shared TypeScript types

### Multi-Tenant System

Each **Project** has isolated:
- ✅ Products (e-commerce catalog)
- ✅ Blog Posts (content management)
- ✅ Media Library (with optional sharing)
- ✅ Module Configuration (enable/disable features)

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Neon PostgreSQL database account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sifaka
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` files in both apps:
   
   **apps/web/.env**:
   ```env
   DATABASE_URL=postgresql://user:pass@host.neon.tech/cms_db
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   ```
   
   **apps/api/.env**:
   ```env
   DATABASE_URL=postgresql://user:pass@host.neon.tech/crm_db
   NEON_HOST=host.neon.tech
   NEON_DATABASE=crm_db
   NEON_USER=user
   NEON_PASSWORD=password
   ```

4. **Set up databases**
   
   **Web (CMS)**:
   ```bash
   cd apps/web
   npx prisma generate
   npx prisma migrate deploy
   ```
   
   **API (CRM)**:
   ```bash
   cd apps/api
   npx prisma generate
   npx tsx scripts/deploy-schema.ts
   ```

5. **Start development**
   ```bash
   # From root - starts both apps
   npm run dev
   
   # Or individually
   cd apps/web && npm run dev   # Port 3000
   cd apps/api && npm run start:dev  # Port 3001
   ```

## 🔄 Migration from v0.1.x

If upgrading from version 0.1.x, see [MIGRATION_GUIDE_v0.2.0.md](./MIGRATION_GUIDE_v0.2.0.md) for detailed steps.

**Quick migration**:
```bash
cd apps/web
npx tsx scripts/migrate-to-projects.ts
```

## 📁 Project Structure

```
sifaka/
├── apps/
│   ├── api/                 # NestJS backend (CRM)
│   │   ├── src/
│   │   ├── prisma/          # API database schema
│   │   └── scripts/         # Database deployment scripts
│   └── web/                 # Next.js frontend (CMS)
│       ├── app/             # App Router pages
│       ├── components/      # React components
│       ├── lib/             # Utilities & configs
│       ├── prisma/          # Web database schema
│       └── scripts/         # Migration scripts
├── packages/
│   └── types/              # Shared TypeScript types
├── CHANGELOG.md            # Version history
├── MIGRATION_GUIDE_v0.2.0.md  # Upgrade instructions
└── turbo.json             # TurboRepo configuration
```

## 🛠️ Available Scripts

### Root (TurboRepo)
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run start` - Start all apps in production mode

### apps/web (CMS)
- `npm run dev` - Start Next.js dev server (port 3000)
- `npm run build` - Build for production
- `npm run prisma:generate` - Generate Prisma client
- `npx tsx scripts/migrate-to-projects.ts` - Migrate to v0.2.0

### apps/api (CRM)
- `npm run start:dev` - Start NestJS with watch mode (port 3001)
- `npm run build` - Build for production  
- `npx tsx scripts/deploy-schema.ts` - Deploy schema to Neon
- `npm run lint` - Run ESLint

## 🗄️ Database

This project uses [Neon](https://neon.tech) PostgreSQL with Prisma ORM.

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Pull schema from database
npx prisma db pull

# Push schema to database (dev only)
npx prisma db push
```

## 🔐 Authentication

Authentication is handled by NextAuth.js with support for:
- Google OAuth
- Email/Password (via Prisma adapter)

Configure providers in `lib/auth.ts`.

## 🎨 Styling

- **Framework**: Tailwind CSS v4
- **Components**: Custom components in `/components`
- **Icons**: Lucide React

## 🤖 AI Features

The application includes AI chat functionality powered by OpenAI.

Configure in your `.env`:
```env
OPENAI_API_KEY=your_openai_api_key
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

**Security Notes**:
- Never commit `.env` to version control
- Keep your `NEXTAUTH_SECRET` secure
- Protect your database credentials
- Use environment-specific variables for production

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Neon Documentation](https://neon.tech/docs)

## 🔧 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:
1. Verify your `DATABASE_URL` in `.env`
2. Check Neon dashboard for database status
3. Ensure your IP is allowed in Neon settings
4. Run `npx prisma db pull` to verify connection

### Build Errors

If the build fails:
1. Delete `node_modules` and `.next`
2. Run `npm install` again
3. Run `npx prisma generate`
4. Try `npm run build` again

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

---

## Migration Notes

This project was migrated from a Turborepo monorepo to a standalone Next.js application.

- **API**: The NestJS API has been moved to `sifaka-api-backup/`. See [API-MIGRATION.md](./API-MIGRATION.md) for setup instructions.
- **Backup**: Original structure documented in [BACKUP-STRUCTURE.md](./BACKUP-STRUCTURE.md)
