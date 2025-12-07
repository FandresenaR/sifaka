"use client"

import { useState } from "react"
import { 
  Activity, 
  Users, 
  Eye,
  Clock,
  TrendingUp,
  Globe,
  Shield,
  AlertTriangle,
  RefreshCw
} from "lucide-react"

export default function MonitoringPage() {
  const [loading, setLoading] = useState(false)

  const stats = {
    visitors: 0,
    pageViews: 0,
    activeUsers: 0,
    avgSessionTime: "0m",
    bounceRate: "0%",
    blockedIPs: 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-yellow-500" />
            Monitoring & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Statistiques, performance et surveillance
          </p>
        </div>

        <button
          onClick={() => setLoading(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Visiteurs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.visitors}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Pages vues</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pageViews}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm">Actifs maintenant</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Temps moyen</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgSessionTime}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Taux de rebond</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.bounceRate}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">IPs bloquées</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.blockedIPs}</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Trafic des 7 derniers jours
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique à venir</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pages les plus visitées
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Eye className="w-12 h-12 mx-auto mb-2" />
              <p>Données à venir</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Alertes récentes
        </h3>
        <div className="text-center py-8 text-gray-500">
          Aucune alerte pour le moment
        </div>
      </div>
    </div>
  )
}
