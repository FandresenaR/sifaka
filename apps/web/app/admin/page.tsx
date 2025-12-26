"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import * as api from "@/lib/api-client"
import { Package, FileText, Users, FolderOpen, Activity, Shield, Edit, DollarSign, LogOut, Plus, Rocket, FolderKanban, Zap, Map } from "lucide-react"

interface Stats {
  users: number
  admins: number
  superAdmins: number
}

interface Project {
  id: string
  name: string
  slug: string
  type: string
  status: string
  createdAt: string
  owner?: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats>({ users: 0, admins: 0, superAdmins: 0 })
  const [projects, setProjects] = useState<Project[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  const user = session?.user
  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  useEffect(() => {
    // Ne rien faire pendant le chargement de session
    if (status === "loading") return

    // Si authentifié, charger les stats et projets
    if (status === "authenticated" && session?.user) {
      fetchStats()
      fetchProjects()
    } else {
      // Si pas authentifié, arrêter le chargement
      setStatsLoading(false)
      setProjectsLoading(false)
    }
  }, [status, session])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      setError(null)

      // Charger les utilisateurs depuis l'API
      const response = await fetch("/api/users")
      
      if (response.ok) {
        const data = await response.json()
        const users = data.users || []

        const userCount = users.filter((u: any) => u.role === "USER").length
        const adminCount = users.filter((u: any) => u.role === "ADMIN").length
        const superAdminCount = users.filter((u: any) => u.role === "SUPER_ADMIN").length

        setStats({ users: userCount, admins: adminCount, superAdmins: superAdminCount })
      } else {
        // Fallback: compter seulement l'utilisateur actuel
        const currentUserRole = session?.user?.role
        setStats({
          users: currentUserRole === "USER" ? 1 : 0,
          admins: currentUserRole === "ADMIN" ? 1 : 0,
          superAdmins: currentUserRole === "SUPER_ADMIN" ? 1 : 0,
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

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true)
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Erreur chargement projets:", err)
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
    setShowNewProjectModal(false)
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const modules = [
    {
      title: "Mes Projets",
      description: "Gérez vos projets CMS et configurations",
      icon: FolderKanban,
      href: "/admin/projects",
      color: "from-violet-500 to-purple-500",
      stats: `${projects.length} projet${projects.length > 1 ? 's' : ''}`
    },
    {
      title: "Gestion de Produits",
      description: "Catalogue, prix, inventaire et catégories",
      icon: Package,
      href: "/admin/products",
      color: "from-blue-500 to-cyan-500",
      stats: "0 produits"
    },
    {
      title: "Modules IA",
      description: "Modules générés dynamiquement par l'IA",
      icon: Zap,
      href: "/admin/modules",
      color: "from-amber-500 to-orange-500",
      stats: "Gérés via chat"
    },
    {
      title: "MAP Module - Shuffle Life",
      description: "Découvrez des activités aléatoires dans 200km",
      icon: Map,
      href: "/admin/map-module",
      color: "from-cyan-500 to-blue-500",
      stats: "Activé"
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
          title="Projets"
          value={projects.length.toString()}
          change="+0%"
        />
      </div>

      {/* Mes Projets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mes Projets
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {projects.length} projet{projects.length !== 1 ? "s" : ""}
          </span>
        </div>
        
        {projectsLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Chargement des projets...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun projet pour le moment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Créez votre premier projet pour commencer à gérer votre contenu
            </p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Créer un projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
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
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)} 
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (project: Project) => void }) {
  const [projectName, setProjectName] = useState("")
  const [projectType, setProjectType] = useState("ecommerce")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
    
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          type: projectType,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la création")
      }
      
      const newProject = await response.json()
      onCreated(newProject)
    } catch (err) {
      console.error("Erreur création projet:", err)
      setError(err instanceof Error ? err.message : "Erreur lors de la création du projet")
    } finally {
      setCreating(false)
    }
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300 text-sm">⚠️ {error}</p>
            </div>
          )}

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

function ProjectCard({ project }: { project: { id: string; name: string; slug: string; type: string; status: string; createdAt: string; owner?: { name: string | null; email: string | null; image: string | null } } }) {
  const typeIcons: Record<string, string> = {
    ECOMMERCE: "🛒",
    BLOG: "📝",
    PORTFOLIO: "🎨",
    LANDING: "🚀",
    CUSTOM: "⚙️",
  }

  const typeColors: Record<string, string> = {
    ECOMMERCE: "from-blue-500 to-cyan-500",
    BLOG: "from-purple-500 to-pink-500",
    PORTFOLIO: "from-orange-500 to-yellow-500",
    LANDING: "from-green-500 to-emerald-500",
    CUSTOM: "from-gray-500 to-slate-500",
  }

  const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Actif" },
    ARCHIVED: { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-700 dark:text-gray-400", label: "Archivé" },
    DRAFT: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Brouillon" },
  }

  const icon = typeIcons[project.type] || "📁"
  const color = typeColors[project.type] || "from-gray-500 to-slate-500"
  const status = statusBadges[project.status] || statusBadges.DRAFT
  const createdDate = new Date(project.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <Link
      href={`/admin/projects/${project.slug}`}
      className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
        {project.name}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Créé le {createdDate}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {project.type.toLowerCase()}
        </span>
        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Ouvrir →
        </span>
      </div>
    </Link>
  )
}
