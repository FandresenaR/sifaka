"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import * as api from "@/lib/api-client"
import { Package, FileText, Users, FolderOpen, Activity, Shield, Edit, DollarSign, LogOut } from "lucide-react"

interface Stats {
  users: number
  admins: number
  superAdmins: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading, isLoggedIn, logout } = useAuth()
  const [stats, setStats] = useState<Stats>({ users: 0, admins: 0, superAdmins: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    // Redirection si pas authentifié
    if (!isLoggedIn || !user) {
      router.push("/auth/signin")
      return
    }

    // Charger les stats
    fetchStats()
  }, [isLoading, isLoggedIn, user, router])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      setError(null)
      
      // Appel API avec authentication automatique
      const response = await api.get("/users")
      const users = Array.isArray(response) ? response : response.data || []
      
      const userCount = users.filter((u: any) => u.role === "USER").length
      const adminCount = users.filter((u: any) => u.role === "ADMIN").length
      const superAdminCount = users.filter((u: any) => u.role === "SUPER_ADMIN").length
      
      setStats({ users: userCount, admins: adminCount, superAdmins: superAdminCount })
    } catch (err) {
      console.error("Erreur chargement stats:", err)
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des statistiques")
      setStatsLoading(false)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const modules = [
    {
      title: "Gestion de Produits",
      description: "Catalogue, prix, inventaire et catégories",
      icon: Package,
      href: "/admin/products",
      color: "from-blue-500 to-cyan-500",
      stats: "0 produits"
    },
    {
      title: "Gestion de Blog",
      description: "Articles, révisions, SEO et publication",
      icon: FileText,
      href: "/admin/blog",
      color: "from-purple-500 to-pink-500",
      stats: "0 articles"
    },
    {
      title: "Médiathèque",
      description: "Upload, organisation et optimisation",
      icon: FolderOpen,
      href: "/admin/media",
      color: "from-green-500 to-emerald-500",
      stats: "0 fichiers"
    },
    {
      title: "Utilisateurs",
      description: "Gestion des rôles et permissions",
      icon: Users,
      href: "/admin/users",
      color: "from-orange-500 to-red-500",
      stats: `${stats.users + stats.admins + stats.superAdmins} utilisateurs`,
      disabled: false
    },
    {
      title: "Monitoring",
      description: "Analytics, IPs bloquées, Cloudflare",
      icon: Activity,
      href: "/admin/monitoring",
      color: "from-yellow-500 to-orange-500",
      stats: "Actif"
    },
    {
      title: "Sécurité & IA",
      description: "Configuration 2FA, rate limiting, AI",
      icon: Shield,
      href: "/admin/security",
      color: "from-red-500 to-rose-500",
      stats: "Configuré"
    },
    {
      title: "Éditeur de Texte",
      description: "Test de l'éditeur WYSIWYG",
      icon: Edit,
      href: "/admin/editor-test",
      color: "from-indigo-500 to-purple-500",
      stats: "Disponible"
    },
    {
      title: "Gestion des Prix",
      description: "Multi-devises et réductions",
      icon: DollarSign,
      href: "/admin/pricing",
      color: "from-teal-500 to-cyan-500",
      stats: "0 règles"
    },
  ]

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Header avec Logout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenue {user.name} ({user.email})
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Utilisateurs" value={stats.users.toString()} change="+0%" />
        <StatCard title="Admins" value={stats.admins.toString()} change="+0%" />
        <StatCard title="Super Admins" value={stats.superAdmins.toString()} change="+0%" />
        <StatCard 
          title="Total" 
          value={(stats.users + stats.admins + stats.superAdmins).toString()} 
          change="+0%" 
        />
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Modules Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon
            const isDisabled = module.disabled || false
            
            if (isDisabled) {
              return (
                <div
                  key={module.title}
                  className="relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {module.stats}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">
                      Accès restreint
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={module.title}
                href={module.href}
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {module.stats}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Ouvrir →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
  const isPositive = change.startsWith("+")
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <span className={`text-sm font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {change}
        </span>
      </div>
    </div>
  )
}
