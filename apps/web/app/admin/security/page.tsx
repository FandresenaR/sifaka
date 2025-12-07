"use client"

import { useState } from "react"
import { 
  Shield, 
  Key,
  Lock,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Settings,
  Bot,
  Zap
} from "lucide-react"

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true)

  const securityChecks = [
    { name: "Authentification Google OAuth", status: true, description: "Connexion sécurisée via Google" },
    { name: "Sessions JWT", status: true, description: "Tokens signés avec expiration" },
    { name: "HTTPS forcé", status: true, description: "Toutes les connexions sont chiffrées" },
    { name: "2FA activé", status: twoFactorEnabled, description: "Authentification à deux facteurs" },
    { name: "Rate Limiting", status: rateLimitEnabled, description: "Protection contre les abus" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="w-7 h-7 text-red-500" />
          Sécurité & Configuration IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          2FA, rate limiting, configuration API IA
        </p>
      </div>

      {/* Security Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          État de la sécurité
        </h3>
        <div className="space-y-4">
          {securityChecks.map((check) => (
            <div key={check.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {check.status ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{check.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{check.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                check.status 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}>
                {check.status ? "Actif" : "Inactif"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2FA Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Authentification à deux facteurs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ajoutez une couche de sécurité supplémentaire
              </p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {!twoFactorEnabled && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              ⚠️ La 2FA n'est pas activée. Nous recommandons de l'activer pour protéger votre compte.
            </p>
          </div>
        )}
      </div>

      {/* AI Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bot className="w-6 h-6 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuration IA
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Paramètres pour l'assistant IA et la génération de contenu
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Clé API OpenRouter
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-or-v1-..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Sauvegarder
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Obtenir une clé sur <a href="https://openrouter.ai" target="_blank" className="text-purple-500 hover:underline">openrouter.ai</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Modèle par défaut
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
              <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Rapide)</option>
              <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (Équilibré)</option>
              <option value="openai/gpt-4o-mini">GPT-4o Mini (Économique)</option>
              <option value="google/gemini-pro">Gemini Pro (Gratuit)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rate Limiting
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Limite le nombre de requêtes par IP
              </p>
            </div>
          </div>
          <button
            onClick={() => setRateLimitEnabled(!rateLimitEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              rateLimitEnabled ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                rateLimitEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requêtes max/minute
            </label>
            <input
              type="number"
              defaultValue={60}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Requêtes max/heure
            </label>
            <input
              type="number"
              defaultValue={1000}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durée de ban (minutes)
            </label>
            <input
              type="number"
              defaultValue={15}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
