"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle
} from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  author: string
}

export default function BlogPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-purple-500" />
            Gestion du Blog
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Articles, révisions, SEO et publication
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nouvel Article
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Publiés</p>
              <p className="text-2xl font-bold text-green-600">{posts.filter(p => p.published).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Brouillons</p>
              <p className="text-2xl font-bold text-yellow-600">{posts.filter(p => !p.published).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {posts.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun article
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez par créer votre premier article de blog.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Créer un article
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nouvel Article
              </h2>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Titre de l'article"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="titre-de-larticle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Extrait
                </label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Résumé court de l'article"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contenu
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Contenu de l'article..."
                />
              </div>
            </form>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                Sauvegarder en brouillon
              </button>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Publier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
