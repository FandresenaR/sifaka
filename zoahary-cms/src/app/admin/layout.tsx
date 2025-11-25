"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user) {
      // Si 2FA est activé et pas vérifié, rediriger vers vérification
      // Exception : permettre l'accès à /admin/2fa pour la configuration
      if (session.user.twoFactorEnabled &&
        !session.user.twoFactorVerified &&
        pathname !== "/admin/2fa") {
        router.push("/auth/verify-2fa");
      }
    }
  }, [status, session, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a
                href="/admin"
                className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-300 dark:hover:to-purple-300 transition-all duration-300"
              >
                <span className="text-2xl">🌴</span>
                <span className="hidden md:inline">Zoahary Baobab</span>
                <span className="md:hidden">Zoahary</span>
              </a>
            </div>

            {/* Menu desktop */}
            <div className="hidden md:flex items-center space-x-1">
              <a
                href="/admin/products"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === "/admin/products"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span>🛍️</span>
                  <span>Produits</span>
                </span>
              </a>
              <a
                href="/admin/pricing"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === "/admin/pricing"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span>💰</span>
                  <span>Tarification</span>
                </span>
              </a>
              <a
                href="/admin/blog"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === "/admin/blog"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span>📝</span>
                  <span>Blog</span>
                </span>
              </a>
              <a
                href="/admin/media"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === "/admin/media"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span>📸</span>
                  <span>Médias</span>
                </span>
              </a>
              {session?.user?.role === "SUPER_ADMIN" && (
                <>
                  <a
                    href="/admin/users"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === "/admin/users"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>👥</span>
                      <span>Utilisateurs</span>
                    </span>
                  </a>
                  <a
                    href="/admin/monitoring"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname?.startsWith("/admin/monitoring")
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🛡️</span>
                      <span>Monitoring</span>
                    </span>
                  </a>
                </>
              )}
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Menu utilisateur dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white dark:ring-gray-800">
                    {session.user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {session.user?.name || "Utilisateur"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    {/* Overlay invisible pour fermer au clic extérieur */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    ></div>

                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                            {session.user?.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {session.user?.name || "Utilisateur"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        {session.user?.role === "SUPER_ADMIN" && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50">
                              ⭐ Super Admin
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="py-1">
                        <a
                          href="/admin/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <span className="text-lg">👤</span>
                          <span>Mon Profil</span>
                        </a>
                        <a
                          href="/admin/security"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <span className="text-lg">🔒</span>
                          <span>Sécurité</span>
                        </a>
                        <a
                          href="/admin/changelog"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <span className="text-lg">📋</span>
                          <span>Historique (Changelog)</span>
                        </a>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700/50 mt-1 pt-1">
                        <button
                          onClick={() => router.push("/api/auth/signout")}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span className="text-lg">🚪</span>
                          <span className="font-medium">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bouton hamburger mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-expanded={mobileMenuOpen}
                aria-label="Menu"
              >
                {!mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Tableau de bord
              </a>
              <a
                href="/admin/products"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📦 Produits
              </a>
              <a
                href="/admin/pricing"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                💰 Tarification
              </a>
              <a
                href="/admin/blog"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📝 Blog
              </a>
              <a
                href="/admin/media"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📸 Médias
              </a>
              {session?.user?.role === "SUPER_ADMIN" && (
                <>
                  <a
                    href="/admin/users"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👥 Utilisateurs
                  </a>
                  <a
                    href="/admin/monitoring"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🛡️ Monitoring
                  </a>
                </>
              )}
            </div>

            {/* Profil utilisateur mobile */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {session.user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {session.user?.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {session.user?.role === "SUPER_ADMIN" ? "Super Admin" : "Administrateur"}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <a
                  href="/admin/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Mon Profil
                </a>
                <a
                  href="/admin/security"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔒 Sécurité
                </a>
                <a
                  href="/admin/changelog"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📋 Historique
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/api/auth/signout");
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="py-4 px-3 sm:py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
