"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <main className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Zoahary Baobab CMS</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Système de gestion de contenu pour zoahary-baobab.mg
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/produits"
            className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">🛍️ Produits →</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Voir notre catalogue de produits bio
            </p>
          </Link>

          <Link
            href="/produits/tulear"
            className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-400 transition-colors bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">🌴 Tarifs Tuléar →</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Découvrez nos prix spéciaux pour Tuléar (-15%)
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Produits →</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Gérer les cartes produits du catalogue
            </p>
          </Link>

          <Link
            href="/admin/blog"
            className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Blog →</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Gérer les articles de blog
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Utilisateurs →</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Gérer les utilisateurs et permissions
            </p>
          </Link>

          <Link
            href="/auth/signin"
            className="p-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Connexion →</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Se connecter avec Google OAuth
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
