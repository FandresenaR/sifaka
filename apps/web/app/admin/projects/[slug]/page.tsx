import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import ProjectSettingsForm from "@/components/admin/projects/ProjectSettingsForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProjectPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const { slug } = await params

  // Charger le projet
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

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ProjectSettingsForm project={project} />
      </div>

      {isSuperAdmin && !isOwner && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Super Admin :</strong> Vous modifiez un projet appartenant à{" "}
            <strong>{project.owner.name || project.owner.email}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
