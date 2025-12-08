import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ArrowLeft, Mail, Calendar, FolderKanban, Shield, Crown, User as UserIcon } from "lucide-react"
import Link from "next/link"

interface UserDetailPageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const { userId } = await params

  // Seul le SUPER_ADMIN ou l'utilisateur lui-même peut accéder
  const isSuperAdmin = session.user.role === "SUPER_ADMIN"
  const isSelf = session.user.id === userId

  if (!isSuperAdmin && !isSelf) {
    redirect("/admin/users")
  }

  // Charger l'utilisateur avec ses projets
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          status: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        }
      },
      _count: {
        select: {
          projects: true,
          accounts: true,
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case "SUPER_ADMIN":
        return <Crown className="w-5 h-5 text-yellow-500" />
      case "ADMIN":
        return <Shield className="w-5 h-5 text-blue-500" />
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleBadgeColor = () => {
    switch (user.role) {
      case "SUPER_ADMIN":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const typeIcons: Record<string, string> = {
    ECOMMERCE: "🛍️",
    BLOG: "📝",
    PORTFOLIO: "💼",
    LANDING: "🚀",
    CUSTOM: "⚙️",
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    ARCHIVED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux utilisateurs
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || ""}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {user.name || "Sans nom"}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                  {getRoleIcon()}
                  {user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Admin" : "Utilisateur"}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" />
                  {user._count.projects} projet{user._count.projects > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Projets de {user.name || "l'utilisateur"}
          </h2>
          {isSelf && (
            <Link
              href="/admin/projects"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Gérer mes projets →
            </Link>
          )}
        </div>

        {user.projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun projet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isSelf ? "Vous n'avez" : "Cet utilisateur n'a"} pas encore créé de projet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.projects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.slug}`}
                className="group block p-5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeIcons[project.type]}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        /{project.slug}
                      </p>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short"
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
