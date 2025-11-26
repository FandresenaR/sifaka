"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Sparkles, Blocks, Zap, Database, Shield, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sifaka CMS
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Content */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Powered by AI & Modularity
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Le CMS Modulaire
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Propulsé par l'IA
              </span>
            </h2>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Construisez votre système de gestion de contenu sur mesure avec des modules prêts à l'emploi.
              Database-agnostic, multi-tenant, et intelligent.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/admin"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Accéder au Dashboard
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-200"
              >
                Se connecter
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <FeatureCard
              icon={<Blocks className="w-8 h-8" />}
              title="Modulaire"
              description="Choisissez uniquement les modules dont vous avez besoin. Plug & play."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="IA Intégrée"
              description="Génération de contenu, recommandations intelligentes, et plus encore."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Database className="w-8 h-8" />}
              title="Database Agnostic"
              description="Compatible avec PostgreSQL, MySQL, MongoDB via Prisma."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Performance"
              description="Next.js 16, Turbopack, et optimisations automatiques."
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Sécurité"
              description="2FA, rate limiting, monitoring Cloudflare intégré."
              gradient="from-red-500 to-rose-500"
            />
            <FeatureCard
              icon={<Cpu className="w-8 h-8" />}
              title="Multi-Tenant"
              description="Gérez plusieurs projets depuis une seule installation."
              gradient="from-indigo-500 to-blue-500"
            />
          </div>

          {/* Modules Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Modules Prêts à l'Emploi
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ModuleCard title="📝 Gestion de Blog" description="Éditeur riche, révisions, SEO" />
              <ModuleCard title="🛍️ Gestion de Produits" description="Catalogue, prix, inventaire" />
              <ModuleCard title="📁 Médiathèque" description="Upload, organisation, optimisation" />
              <ModuleCard title="👥 Gestion Utilisateurs" description="Rôles, permissions, 2FA" />
              <ModuleCard title="🛡️ Monitoring Cloudflare" description="Analytics, IPs bloquées, WAF" />
              <ModuleCard title="🤖 Configuration IA" description="OpenAI, Claude, modèles custom" />
              <ModuleCard title="✏️ Éditeur de Texte" description="WYSIWYG, Markdown, HTML" />
              <ModuleCard title="💰 Gestion des Prix" description="Multi-devises, réductions" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
          <p>Sifaka CMS - Construit avec Next.js, NestJS & Prisma</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function ModuleCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h5>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
