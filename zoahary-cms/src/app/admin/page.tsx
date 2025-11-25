"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState([
    { name: "Produits", count: "...", href: "/admin/products", color: "bg-blue-500 dark:bg-blue-600", visible: true },
    { name: "Articles", count: "...", href: "/admin/blog", color: "bg-green-500 dark:bg-green-600", visible: true },
    { name: "Utilisateurs", count: "...", href: "/admin/users", color: "bg-purple-500 dark:bg-purple-600", visible: false },
  ]);
  const [dbInfo, setDbInfo] = useState<{
    type: string;
    host: string;
    port: string;
    database: string;
    isLocal: boolean;
    isNeon: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

        // Récupérer les produits et articles
        const [productsRes, blogRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/blog"),
        ]);

        const products = await productsRes.json();
        const blog = await blogRes.json();

        const newStats = [
          { name: "Produits", count: String(products.length || 0), href: "/admin/products", color: "bg-blue-500 dark:bg-blue-600", visible: true },
          { name: "Articles", count: String(blog.length || 0), href: "/admin/blog", color: "bg-green-500 dark:bg-green-600", visible: true },
        ];

        // Ajouter la carte Utilisateurs uniquement pour SUPER_ADMIN
        if (isSuperAdmin) {
          try {
            const usersRes = await fetch("/api/users");
            if (usersRes.ok) {
              const users = await usersRes.json();
              newStats.push({
                name: "Utilisateurs",
                count: String(users.length || 0),
                href: "/admin/users",
                color: "bg-purple-500 dark:bg-purple-600",
                visible: true
              });
            }
          } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs:", error);
          }
        }

        setStats(newStats);
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      }
    };

    const fetchDbInfo = async () => {
      try {
        const res = await fetch("/api/db-info");
        if (res.ok) {
          const data = await res.json();
          setDbInfo(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des infos DB:", error);
      }
    };

    if (session) {
      fetchStats();
      fetchDbInfo();
    }
  }, [session]);

  return (
    <div className="space-y-6">
      {/* Bienvenue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenue, {session?.user?.name || session?.user?.email}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Tableau de bord d&apos;administration de Zoahary Baobab CMS
        </p>
      </div>

      {/* Statistiques */}
      <div className={`grid grid-cols-1 gap-5 ${stats.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {stats.filter(stat => stat.visible).map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {stat.count}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Ajouter un produit
          </Link>
          <Link
            href="/admin/pricing"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Gérer tarification
          </Link>
          <Link
            href="/admin/blog"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Créer un article
          </Link>
          <Link
            href="/admin/api"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            📚 Documentation API
          </Link>
          <Link
            href="/admin/2fa"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Configurer 2FA
          </Link>
        </div>
      </div>

      {/* Info base de données */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400 dark:text-blue-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {dbInfo ? (
                dbInfo.isNeon ? "Base de données Neon PostgreSQL" :
                  dbInfo.isLocal ? "Base de données PostgreSQL locale" :
                    "Base de données PostgreSQL distante"
              ) : "Chargement..."}
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              {dbInfo ? (
                <>
                  <p>Hôte : {dbInfo.host}:{dbInfo.port}</p>
                  <p>Base : {dbInfo.database}</p>
                </>
              ) : (
                <p>Récupération des informations...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
