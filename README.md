# Sifaka CMS (Monorepo)

A modern, AI-powered Content Management System built with a **NestJS** backend and **Next.js** frontend, managed as a Monorepo using **TurboRepo**.

## Architecture

This project is structured as a Monorepo:

- **`apps/api`**: Backend API built with **NestJS**.
  - **Database**: PostgreSQL (via Prisma ORM).
  - **Auth**: Abstracted Authentication Service.
  - **Modules**: Projects (Multi-tenancy), CMS (Dynamic Content).
- **`apps/web`**: Frontend application built with **Next.js 16** (App Router).
  - **Styling**: Tailwind CSS.
  - **State**: React Server Components & Client Hooks.

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL Database (Neon, Supabase, or Local)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

**Backend (`apps/api`)**
Copy `.env.example` to `.env` in `apps/api` and configure your database connection:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/sifaka_db?schema=public"
```

**Frontend (`apps/web`)**
Copy `.env.example` to `.env.local` in `apps/web` and configure your API URL:

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Run Database Migrations

```bash
cd apps/api
npx prisma migrate dev --name init
```

### 4. Start Development Server

Run both Frontend and Backend simultaneously using TurboRepo:

```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:3001](http://localhost:3001)

## Project Structure

```
sifaka/
├── apps/
│   ├── api/            # NestJS Backend
│   └── web/            # Next.js Frontend
├── packages/           # Shared libraries (UI, Types)
├── package.json        # Root configuration
└── turbo.json          # TurboRepo pipeline
```

## Features

- 🚀 **Monorepo**: Efficient build system with TurboRepo.
- 🛠 **Backend**: Robust NestJS architecture with Prisma & TypeORM support.
- 🎨 **Frontend**: Modern Next.js App Router with Tailwind CSS.
- 🌍 **Multi-Tenancy**: "Projects" module to manage multiple sites (e.g., Shuffle Life).
- 🔌 **Database Agnostic**: Connect to Neon, Supabase, or any Postgres DB.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
