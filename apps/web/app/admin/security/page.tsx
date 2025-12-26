"use client"

import { useState, useEffect } from "react"
import { 
  Shield, 
  Key,
  Lock,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Settings,
  Bot,
  Zap,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Globe
} from "lucide-react"

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false)
  const [defaultModel, setDefaultModel] = useState("google/gemini-2b-flash-exp")
  const [copied, setCopied] = useState(false)
  
  // Web Search States
  const [tavilyApiKey, setTavilyApiKey] = useState("")
  const [showTavilyKey, setShowTavilyKey] = useState(false)
  const [tavilyKeySaved, setTavilyKeySaved] = useState(false)
  const [isLoadingTavilyKey, setIsLoadingTavilyKey] = useState(false)
  const [copiedTavily, setCopiedTavily] = useState(false)
  
  const [serpApiKey, setSerpApiKey] = useState("")
  const [showSerpApiKey, setShowSerpApiKey] = useState(false)
  const [serpApiKeySaved, setSerpApiKeySaved] = useState(false)
  const [isLoadingSerpApiKey, setIsLoadingSerpApiKey] = useState(false)
  const [copiedSerpApi, setCopiedSerpApi] = useState(false)
  
  const [webSearchProvider, setWebSearchProvider] = useState("tavily")

  // Charger la clé API au démarrage
  useEffect(() => {
    loadApiKey()
    loadWebSearchKeys()
  }, [])

  const loadApiKey = async () => {
    try {
      const response = await fetch("/api/settings/openrouter")
      if (response.ok) {
        const data = await response.json()
        if (data.hasKey) {
          setApiKeySaved(true)
          setApiKey("••••••••••••••••")
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la clé API:", error)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return

    setIsLoadingApiKey(true)
    try {
      const response = await fetch("/api/settings/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.startsWith("••") ? undefined : apiKey,
        }),
      })

      if (response.ok) {
        setApiKeySaved(true)
        setApiKey("••••••••••••••••")
        setTimeout(() => setApiKeySaved(false), 3000)
      } else {
        alert("Erreur lors de la sauvegarde de la clé API")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setIsLoadingApiKey(false)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Web Search API Functions
  const loadWebSearchKeys = async () => {
    try {
      const response = await fetch("/api/settings/websearch")
      if (response.ok) {
        const data = await response.json()
        if (data.hasTavilyKey) {
          setTavilyKeySaved(true)
          setTavilyApiKey("••••••••••••••••")
        }
        if (data.hasSerpApiKey) {
          setSerpApiKeySaved(true)
          setSerpApiKey("••••••••••••••••")
        }
        if (data.provider) {
          setWebSearchProvider(data.provider)
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des clés web search:", error)
    }
  }

  const handleSaveTavilyKey = async () => {
    if (!tavilyApiKey.trim()) return

    setIsLoadingTavilyKey(true)
    try {
      const response = await fetch("/api/settings/websearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tavilyApiKey: tavilyApiKey.startsWith("••") ? undefined : tavilyApiKey,
        }),
      })

      if (response.ok) {
        setTavilyKeySaved(true)
        setTavilyApiKey("••••••••••••••••")
        setTimeout(() => setTavilyKeySaved(false), 3000)
      } else {
        alert("Erreur lors de la sauvegarde de la clé Tavily")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setIsLoadingTavilyKey(false)
    }
  }

  const handleSaveSerpApiKey = async () => {
    if (!serpApiKey.trim()) return

    setIsLoadingSerpApiKey(true)
    try {
      const response = await fetch("/api/settings/websearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serpApiKey: serpApiKey.startsWith("••") ? undefined : serpApiKey,
        }),
      })

      if (response.ok) {
        setSerpApiKeySaved(true)
        setSerpApiKey("••••••••••••••••")
        setTimeout(() => setSerpApiKeySaved(false), 3000)
      } else {
        alert("Erreur lors de la sauvegarde de la clé SerpAPI")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setIsLoadingSerpApiKey(false)
    }
  }

  const handleCopyTavilyKey = () => {
    navigator.clipboard.writeText(tavilyApiKey)
    setCopiedTavily(true)
    setTimeout(() => setCopiedTavily(false), 2000)
  }

  const handleCopySerpApiKey = () => {
    navigator.clipboard.writeText(serpApiKey)
    setCopiedSerpApi(true)
    setTimeout(() => setCopiedSerpApi(false), 2000)
  }

  const handleChangeWebSearchProvider = async (provider: string) => {
    setWebSearchProvider(provider)
    try {
      await fetch("/api/settings/websearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })
    } catch (error) {
      console.error("Erreur lors du changement de provider:", error)
    }
  }

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
              Configuration OpenRouter
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configurez votre clé API OpenRouter pour utiliser les modèles IA gratuits
            </p>
          </div>
        </div>

        {apiKeySaved && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-400">
              ✅ Clé API OpenRouter sauvegardée avec succès!
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Clé API OpenRouter
              </div>
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {apiKey && !apiKey.startsWith("••") && (
                <button
                  type="button"
                  onClick={handleCopyApiKey}
                  className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Copier la clé"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              )}
              <button
                onClick={handleSaveApiKey}
                disabled={isLoadingApiKey || !apiKey.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium"
              >
                {isLoadingApiKey ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                📌 Obtenir une clé sur{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  openrouter.ai
                </a>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ℹ️ Les modèles gratuits incluent: Gemini 2.0 Flash, Mistral, Llama et autres
              </p>
            </div>
          </div>

          {/* Default Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Modèle par défaut
              </div>
            </label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <optgroup label="Gratuits - Recommandés">
                <option value="google/gemini-2b-flash-exp">⭐ Gemini 2.0 Flash Lite (Rapide & Gratuit)</option>
                <option value="mistralai/mistral-7b-instruct">Mistral 7B (Gratuit)</option>
                <option value="meta-llama/llama-2-70b-chat">Llama 2 70B (Gratuit)</option>
              </optgroup>
              <optgroup label="Autres modèles gratuits">
                <option value="google/gemini-pro">Gemini Pro</option>
                <option value="jondurbin/airoboros-l2-70b">Airoboros 70B</option>
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              ℹ️ Le modèle sélectionné sera utilisé par défaut dans le chat
            </p>
          </div>

          {/* API Status */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">État de la connexion</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Clé API configurée</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apiKeySaved
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>
                  {apiKeySaved ? "✓ Configurée" : "✗ Non configurée"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Chat IA actif</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apiKeySaved
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                }`}>
                  {apiKeySaved ? "✓ Disponible" : "⊝ Indisponible"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Web Search Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-cyan-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Configuration Recherche Web
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intégrez la recherche web pour enrichir les réponses IA
            </p>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sélectionnez votre provider de recherche
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handleChangeWebSearchProvider("tavily")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                webSearchProvider === "tavily"
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">Tavily AI</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Recherche web optimisée pour l'IA, gratuit jusqu'à 1000 requêtes/mois
              </p>
            </button>
            <button
              onClick={() => handleChangeWebSearchProvider("serpapi")}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                webSearchProvider === "serpapi"
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">SerpAPI</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Métamoteur universel, gratuit pour 100 requêtes/mois
              </p>
            </button>
          </div>
        </div>

        {/* Tavily Configuration */}
        {webSearchProvider === "tavily" && (
          <div className="space-y-6 mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4" />
              Configuration Tavily
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Clé API Tavily
                </div>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showTavilyKey ? "text" : "password"}
                    value={tavilyApiKey}
                    onChange={(e) => setTavilyApiKey(e.target.value)}
                    placeholder="tvly-..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTavilyKey(!showTavilyKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showTavilyKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {tavilyApiKey && !tavilyApiKey.startsWith("••") && (
                  <button
                    type="button"
                    onClick={handleCopyTavilyKey}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copier la clé"
                  >
                    {copiedTavily ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                )}
                <button
                  onClick={handleSaveTavilyKey}
                  disabled={isLoadingTavilyKey || !tavilyApiKey.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium"
                >
                  {isLoadingTavilyKey ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  📌 Obtenir une clé sur{" "}
                  <a
                    href="https://tavily.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    tavily.com
                  </a>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 Gratuit: 1000 requêtes/mois, optimisé pour l'IA
                </p>
              </div>
            </div>

            {tavilyKeySaved && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs text-green-800 dark:text-green-400">
                  ✅ Clé Tavily sauvegardée!
                </p>
              </div>
            )}
          </div>
        )}

        {/* SerpAPI Configuration */}
        {webSearchProvider === "serpapi" && (
          <div className="space-y-6 mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4" />
              Configuration SerpAPI
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Clé API SerpAPI
                </div>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showSerpApiKey ? "text" : "password"}
                    value={serpApiKey}
                    onChange={(e) => setSerpApiKey(e.target.value)}
                    placeholder="..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSerpApiKey(!showSerpApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showSerpApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {serpApiKey && !serpApiKey.startsWith("••") && (
                  <button
                    type="button"
                    onClick={handleCopySerpApiKey}
                    className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copier la clé"
                  >
                    {copiedSerpApi ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                )}
                <button
                  onClick={handleSaveSerpApiKey}
                  disabled={isLoadingSerpApiKey || !serpApiKey.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200 font-medium"
                >
                  {isLoadingSerpApiKey ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  📌 Obtenir une clé sur{" "}
                  <a
                    href="https://serpapi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                  >
                    serpapi.com
                  </a>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  💡 Gratuit: 100 requêtes/mois, métamoteur universel
                </p>
              </div>
            </div>

            {serpApiKeySaved && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs text-green-800 dark:text-green-400">
                  ✅ Clé SerpAPI sauvegardée!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
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
