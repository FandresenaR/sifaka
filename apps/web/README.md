# Sifaka CMS - Web Application

A modern, AI-powered Content Management System built with Next.js, TypeScript, and Neon PostgreSQL.

## Features

- 🚀 **Next.js 16** with App Router
- 🎯 **Multi-Tenant Projects** - Isolated data per project
- 🎨 **Tailwind CSS** for styling  
- 🗄️ **Neon PostgreSQL** serverless database
- 🔐 **NextAuth.js** for authentication
- 🤖 **AI Integration** with OpenAI
- 🌐 **i18n Support** with i18next
- ✅ **TypeScript** for type safety
- 📝 **Zod** for schema validation
- 🔧 **Prisma ORM** for database management

## Architecture

### Multi-Tenant Project System

Sifaka CMS uses a **project-based multi-tenant architecture** where each project has:

- **Isolated Data**: Products, Blog Posts, and Media are scoped to projects
- **Module Configuration**: Enable/disable features per project (Products, Blog, Media)
- **Ownership Model**: Projects belong to users with role-based access
- **Shared Resources**: Media can optionally be shared across projects

#### Data Model

```prisma
model Project {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  type      ProjectType  // ECOMMERCE, BLOG, PORTFOLIO, LANDING, CUSTOM
  status    ProjectStatus // ACTIVE, ARCHIVED, DRAFT
  modules   Json?    // { products: true, blog: true, media: true }
  ownerId   String
  
  // Relations
  owner     User      @relation(...)
  products  Product[]
  blogPosts BlogPost[]
  media     Media[]
}

model Product {
  projectId String  // Required - belongs to one project
  project   Project @relation(...)
  // ...
}

model BlogPost {
  projectId String  // Required - belongs to one project
  project   Project @relation(...)
  // ...
}

model Media {
  projectId String?  // Optional - can be shared across projects
  project   Project? @relation(...)
  // ...
}
```

#### API Filtering

All content APIs automatically filter by `projectId`:

```typescript
// GET /api/products?projectId=xxx
// GET /api/blog?projectId=xxx
// GET /api/media?projectId=xxx
```

### Project Management

- **Create Projects**: `/admin` dashboard
- **List Projects**: `/admin/projects`
- **Configure Project**: `/admin/projects/[slug]`
- **Delete Project**: Cascade deletes all associated content

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Database:** Neon PostgreSQL (serverless)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS v4
- **AI:** OpenAI API
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Neon database account
- OpenAI API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FandresenaR/sifaka.git
   cd sifaka/apps/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env` file:
   ```bash
   cp env.example .env
   ```
   
   Fill in your actual values:
   ```env
   DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Setup

This project uses **Neon PostgreSQL** with WebSocket connections. See [README_NEON.md](./README_NEON.md) for detailed database configuration.

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── providers/         # Context providers
│   └── admin/             # Admin components
├── lib/                   # Utilities & configs
│   ├── prisma.ts          # Prisma client (dev)
│   ├── prisma-neon.ts     # Prisma client (production)
│   ├── auth.ts            # NextAuth config
│   └── ai/                # AI integration
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma schema
├── scripts/               # Dev scripts
│   ├── db-query.ts        # SQL queries
│   ├── sync-schema.ts     # Schema sync
│   └── apply-migration.ts # Migrations
├── public/                # Static assets
└── .env                   # Environment variables
```

## Available Scripts

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database
```bash
npm run db:test          # Test database connection
npm run db:query "SQL"   # Execute SQL query
npm run db:sync          # Check schema
npm run db:migrate file  # Apply migration
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio
```

## Database Management

⚠️ **Important:** Prisma CLI commands (`migrate`, `db pull`, `db push`) don't work with Neon's WebSocket-only setup.

**Use instead:**
- SQL migrations via `npm run db:migrate`
- Direct queries via `npm run db:query`
- Schema management via Neon Console

See [README_NEON.md](./README_NEON.md) for details.

## Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Add environment variables:**
   - `DATABASE_URL` (Neon pooled connection)
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables

Production requires:
```env
DATABASE_URL=postgresql://...@...-pooler.neon.tech/db?sslmode=require
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions:
- Check [README_NEON.md](./README_NEON.md) for database issues
- Open an issue on GitHub
- Contact the maintainers
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for all required environment variables.

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### AI Configuration
- `OPENAI_API_KEY` - Your OpenAI API key (optional)

### Geolocation
- `IPINFO_API_KEY` - Your IPInfo API key (optional)

### App Configuration
- `NEXT_PUBLIC_APP_URL` - Your app URL (default: http://localhost:3000)
- `NODE_ENV` - Environment (development/production)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

