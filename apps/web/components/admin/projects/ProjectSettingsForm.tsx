"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Trash2, Archive, CheckCircle } from "lucide-react"

interface ProjectSettingsFormProps {
  project: {
    id: string
    name: string
    slug: string
    type: string
    description: string | null
    status: string
    modules?: any | null // JSON type in Prisma - optionnel
  }
}

export default function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    type: project.type,
    status: project.status,
    modules: (project.modules as any) || {
      products: true,
      blog: true,
      media: true,
    },
  })

  const toggleModule = (module: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: !prev.modules[module],
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/projects/${project.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour")
      }

      setSuccess("Projet mis à jour avec succès !")

      // Si le slug a changé (nom modifié), rediriger
      if (data.project.slug !== project.slug) {
        setTimeout(() => {
          router.push(`/admin/projects/${data.project.slug}`)
        }, 1000)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/projects/${project.slug}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      router.push("/admin/projects")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nom du projet *
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Slug (lecture seule)
        </label>
        <input
          id="slug"
          type="text"
          disabled
          value={project.slug}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Le slug est généré automatiquement à partir du nom
        </p>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          Type de projet *
        </label>
        <select
          id="type"
          required
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
        >
          <option value="ECOMMERCE">🛍️ E-commerce</option>
          <option value="BLOG">📝 Blog</option>
          <option value="PORTFOLIO">💼 Portfolio</option>
          <option value="LANDING">🚀 Landing Page</option>
          <option value="CUSTOM">⚙️ Personnalisé</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-2">
          Statut *
        </label>
        <select
          id="status"
          required
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
        >
          <option value="ACTIVE">✅ Actif</option>
          <option value="DRAFT">📝 Brouillon</option>
          <option value="ARCHIVED">🗄️ Archivé</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          placeholder="Description optionnelle de votre projet..."
        />
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4">Modules du projet</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => toggleModule("products")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${formData.modules.products
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">E-commerce</span>
              {formData.modules.products && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestion de produits, catégories et commandes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => toggleModule("blog")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${formData.modules.blog
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Blog</span>
              {formData.modules.blog && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Articles, catégories et commentaires.
            </p>
          </button>

          <button
            type="button"
            onClick={() => toggleModule("media")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${formData.modules.media
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Média</span>
              {formData.modules.media && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestion de la bibliothèque multimédia.
            </p>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer le projet
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  )
}
