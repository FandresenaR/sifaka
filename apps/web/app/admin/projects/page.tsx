import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { PlusCircle, FolderKanban, Calendar, User } from "lucide-react"

export default async function ProjectsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"

  // Charger les projets de l'utilisateur (ou tous si super admin)
  const projects = await prisma.project.findMany({
    where: isSuperAdmin ? {} : { ownerId: session.user.id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    ARCHIVED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }

  const typeIcons: Record<string, string> = {
    ECOMMERCE: "🛍️",
    BLOG: "📝",
    PORTFOLIO: "💼",
    LANDING: "🚀",
    CUSTOM: "⚙️",
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes Projets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos projets CMS et leurs configurations
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Nouveau Projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Aucun projet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Créez votre premier projet pour commencer
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Créer un projet
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.slug}`}
              className="group block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{typeIcons[project.type]}</span>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      /{project.slug}
                    </p>
                  </div>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    statusColors[project.status] || statusColors.DRAFT
                  }`}
                >
                  {project.status}
                </span>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(project.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {project.owner.name || project.owner.email}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
