import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import ProjectSettingsForm from "@/components/admin/projects/ProjectSettingsForm"
import { ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{ tab?: string }>
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const { slug } = await params
  const { tab } = (await searchParams) || { tab: "settings" }

  // Charger le projet avec les modules installés
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      installedModules: {
        include: {
          module: true,
        },
        orderBy: {
          installedAt: "desc",
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Vérifier les permissions (seul le owner ou super admin peut accéder)
  const isSuperAdmin = session.user.role === "SUPER_ADMIN"
  const isOwner = project.ownerId === session.user.id

  if (!isOwner && !isSuperAdmin) {
    redirect("/admin/projects")
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux projets
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Paramètres et configuration du projet
            </p>
          </div>

          <span
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              project.status === "ACTIVE"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : project.status === "ARCHIVED"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-700">
        <Link
          href={`/admin/projects/${slug}?tab=settings`}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            tab === "settings" || !tab
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Paramètres
        </Link>
        <Link
          href={`/admin/projects/${slug}/modules`}
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
            tab === "modules"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          Modules IA ({project.installedModules.length})
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
        {/* Settings Tab */}
        {(tab === "settings" || !tab) && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Paramètres du projet</h2>
            <ProjectSettingsForm project={project} />

            {isSuperAdmin && !isOwner && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Super Admin :</strong> Vous modifiez un projet appartenant à{" "}
                  <strong>{project.owner.name || project.owner.email}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modules Tab - Quick Summary */}
        {tab === "modules" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Modules IA Installés</h2>

            {project.installedModules.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Aucun module installé pour ce projet
                </p>
                <Link
                  href={`/admin/projects/${slug}/modules`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter des modules
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {project.installedModules.map((installed) => (
                  <div
                    key={installed.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {installed.module.displayName || installed.module.moduleName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {installed.module.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>
                          {installed.enabled ? (
                            <span className="text-green-600 dark:text-green-400">✓ Activé</span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">○ Désactivé</span>
                          )}
                        </span>
                        <span>
                          Installé: {new Date(installed.installedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/projects/${slug}/modules`}
                      className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Gérer
                    </Link>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Conseil :</strong> Visitez la page complète des modules pour activer/désactiver les
                    modules et configurer les paramètres avancés.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
