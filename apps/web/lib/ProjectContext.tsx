"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

interface ProjectContextType {
  currentProjectId: string | null
  currentProjectSlug: string | null
  setCurrentProject: (id: string, slug: string) => void
  clearCurrentProject: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentProjectSlug, setCurrentProjectSlug] = useState<string | null>(null)
  const pathname = usePathname()

  // Charger le projet depuis localStorage au démarrage
  useEffect(() => {
    const savedProjectId = localStorage.getItem("currentProjectId")
    const savedProjectSlug = localStorage.getItem("currentProjectSlug")
    if (savedProjectId && savedProjectSlug) {
      setCurrentProjectId(savedProjectId)
      setCurrentProjectSlug(savedProjectSlug)
    }
  }, [])

  // Détecter automatiquement le projet depuis l'URL
  useEffect(() => {
    const match = pathname?.match(/\/admin\/projects\/([^/]+)/)
    if (match) {
      const slug = match[1]
      // On pourrait fetch le project ID ici si nécessaire
      setCurrentProjectSlug(slug)
    }
  }, [pathname])

  const setCurrentProject = (id: string, slug: string) => {
    setCurrentProjectId(id)
    setCurrentProjectSlug(slug)
    localStorage.setItem("currentProjectId", id)
    localStorage.setItem("currentProjectSlug", slug)
  }

  const clearCurrentProject = () => {
    setCurrentProjectId(null)
    setCurrentProjectSlug(null)
    localStorage.removeItem("currentProjectId")
    localStorage.removeItem("currentProjectSlug")
  }

  return (
    <ProjectContext.Provider
      value={{
        currentProjectId,
        currentProjectSlug,
        setCurrentProject,
        clearCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
