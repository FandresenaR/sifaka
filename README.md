# Sifaka - Next.js Web Application

A modern Next.js web application with Neon PostgreSQL database, NextAuth authentication, and AI chat features.

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
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
sifaka/
├── app/                  # Next.js App Router pages
├── components/           # React components
├── lib/                  # Utility functions and configurations
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── types/               # TypeScript type definitions
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
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
