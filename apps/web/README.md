# Sifaka CMS

A modern, AI-powered Content Management System built with Next.js, TypeScript, and Supabase.

## Features

- 🚀 **Next.js 16** with App Router
- 🎨 **Tailwind CSS** for styling
- 🔐 **Supabase** for authentication and database
- 🤖 **AI Integration** with OpenAI
- 🌍 **Geolocation Tracking** with IPInfo
- 🌐 **i18n Support** with i18next
- ✅ **TypeScript** for type safety
- 📝 **Zod** for schema validation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- OpenAI API key (optional)
- IPInfo API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FandresenaR/sifaka.git
   cd sifaka
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Then fill in your actual values in `.env.local`:
   - Supabase credentials (from your Supabase dashboard)
   - OpenAI API key (if using AI features)
   - IPInfo API key (if using geolocation)

4. **Set up Supabase**
   
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and keys to `.env.local`
   - Run database migrations (coming soon)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
sifaka/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client setup
│   ├── ai/               # AI integration
│   └── i18n/             # Internationalization
├── public/               # Static assets
├── .env.example          # Environment variables template
└── .env.local            # Your local environment variables (not committed)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
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

