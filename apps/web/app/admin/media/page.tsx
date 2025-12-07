"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Upload,
  Image,
  FileVideo,
  FileAudio,
  File,
  Grid,
  List,
  Trash2,
  Download,
  Eye,
  X
} from "lucide-react"

interface MediaItem {
  id: string
  filename: string
  url: string
  type: "image" | "video" | "audio" | "document"
  size: number
  createdAt: string
}

export default function MediaPage() {
  const { data: session } = useSession()
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    // TODO: Implémenter l'upload
    console.log("Files to upload:", files)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-8 h-8 text-green-500" />
      case "video":
        return <FileVideo className="w-8 h-8 text-purple-500" />
      case "audio":
        return <FileAudio className="w-8 h-8 text-blue-500" />
      default:
        return <File className="w-8 h-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-green-500" />
            Médiathèque
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload, organisation et optimisation des médias
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <Upload className="w-5 h-5" />
          Uploader des fichiers
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive 
            ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
            : "border-gray-300 dark:border-gray-700 hover:border-green-400"
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? "text-green-500" : "text-gray-400"}`} />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Glissez-déposez vos fichiers ici
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          ou cliquez sur le bouton ci-dessus pour sélectionner
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, GIF, PDF, MP4 jusqu'à 10MB
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un fichier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <option value="all">Tous les types</option>
            <option value="image">Images</option>
            <option value="video">Vidéos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>

          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-700"}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-700"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Fichiers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{media.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Images</p>
          <p className="text-2xl font-bold text-green-600">{media.filter(m => m.type === "image").length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Vidéos</p>
          <p className="text-2xl font-bold text-purple-600">{media.filter(m => m.type === "video").length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Espace utilisé</p>
          <p className="text-2xl font-bold text-blue-600">0 MB</p>
        </div>
      </div>

      {/* Empty State */}
      {media.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Médiathèque vide
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Commencez par uploader vos premiers fichiers.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            Uploader des fichiers
          </button>
        </div>
      )}
    </div>
  )
}
