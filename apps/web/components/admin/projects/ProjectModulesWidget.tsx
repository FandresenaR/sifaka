'use client'

import Link from 'next/link'
import { Zap, Plus, ArrowRight } from 'lucide-react'

interface ProjectModulesWidgetProps {
  projectSlug: string
  modulesCount: number
}

export function ProjectModulesWidget({ projectSlug, modulesCount }: ProjectModulesWidgetProps) {
  return (
    <Link
      href={`/admin/projects/${projectSlug}/modules`}
      className="group relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg border border-amber-200 dark:border-amber-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
          <Zap className="w-6 h-6" />
        </div>
        <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Modules IA
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Gérez les modules générés par IA pour ce projet
      </p>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          {modulesCount}
        </span>
        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium group-hover:translate-x-1 transition-transform">
          Ouvrir →
        </span>
      </div>
    </Link>
  )
}
