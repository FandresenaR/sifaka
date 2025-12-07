"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import * as api from "@/lib/api-client"
import { Package, FileText, Users, FolderOpen, Activity, Shield, Edit, DollarSign, LogOut, Plus, Rocket } from "lucide-react"

interface Stats {
  users: number
  admins: number
  superAdmins: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats>({ users: 0, admins: 0, superAdmins: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  const user = session?.user
  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  useEffect(() => {
    // Ne rien faire pendant le chargement de session
    if (status === "loading") return

    // Si authentifié, charger les stats
    if (status === "authenticated" && session?.user) {
      fetchStats()
    } else {
      // Si pas authentifié, arrêter le chargement
      setStatsLoading(false)
    }
  }, [status, session])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      setError(null)

      // Essayer de charger depuis l'API
      try {
        const response = await api.get("/api/users")
        const users = Array.isArray(response) ? response : response.data || []

        const userCount = users.filter((u: any) => u.role === "USER").length
        const adminCount = users.filter((u: any) => u.role === "ADMIN").length
        const superAdminCount = users.filter((u: any) => u.role === "SUPER_ADMIN").length

        setStats({ users: userCount, admins: adminCount, superAdmins: superAdminCount })
      } catch (apiErr) {
        console.warn("API non disponible, utilisation des données de session:", apiErr)
        
        // Fallback: au minimum compter l'utilisateur actuel
        const currentUserRole = session?.user?.role
        setStats({
          users: currentUserRole === "USER" ? 1 : 0,
          admins: currentUserRole === "ADMIN" ? 1 : 0,
          superAdmins: currentUserRole === "SUPER_ADMIN" ? 1 : 0
        })
      }
    } catch (err) {
      console.error("Erreur chargement stats:", err)
      // Fallback silencieux avec l'utilisateur courant
      const currentUserRole = session?.user?.role
      setStats({
        users: currentUserRole === "USER" ? 1 : 0,
        admins: currentUserRole === "ADMIN" ? 1 : 0,
        superAdmins: currentUserRole === "SUPER_ADMIN" ? 1 : 0
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
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

  // Afficher le loader pendant le chargement
  if (status === "loading" || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  // Si pas de session après chargement, afficher un message (le middleware devrait rediriger)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Content Header with Action Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenue dans votre espace de gestion, {user.name}
          </p>
        </div>

        {/* Bouton Nouveau Projet */}
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nouveau Projet</span>
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

      {/* Modal Nouveau Projet */}
      {showNewProjectModal && (
        <NewProjectModal onClose={() => setShowNewProjectModal(false)} />
      )}
    </div>
  )
}

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const [projectName, setProjectName] = useState("")
  const [projectType, setProjectType] = useState("ecommerce")
  const [creating, setCreating] = useState(false)

  const projectTypes = [
    { id: "ecommerce", name: "E-commerce", description: "Boutique en ligne avec produits et paiements", icon: "🛒" },
    { id: "blog", name: "Blog / Magazine", description: "Articles, catégories et commentaires", icon: "📝" },
    { id: "portfolio", name: "Portfolio", description: "Présentation de projets et services", icon: "🎨" },
    { id: "landing", name: "Landing Page", description: "Page d'atterrissage marketing", icon: "🚀" },
    { id: "custom", name: "Personnalisé", description: "Configuration sur mesure", icon: "⚙️" },
  ]

  const handleCreate = async () => {
    if (!projectName.trim()) return
    
    setCreating(true)
    // TODO: Appel API pour créer le projet
    console.log("Création du projet:", { name: projectName, type: projectType })
    
    setTimeout(() => {
      setCreating(false)
      onClose()
      // TODO: Rediriger vers le nouveau projet
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nouveau Projet
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Créez un nouveau projet CMS
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nom du projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Mon super projet"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type de projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Type de projet
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setProjectType(type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    projectType === type.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{type.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!projectName.trim() || creating}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Créer le projet
              </>
            )}
          </button>
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
