'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, RefreshCw, Menu, Zap } from 'lucide-react'
import { MessageContent } from './MessageContent'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIModel {
  id: string
  name: string
  description?: string
  pricing?: {
    prompt: string
    completion: string
  }
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [models, setModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [moduleGenerationMode, setModuleGenerationMode] = useState(false)
  const [showModuleInfo, setShowModuleInfo] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Charger les modèles au démarrage
  useEffect(() => {
    if (isOpen && models.length === 0) {
      loadModels()
    }
  }, [isOpen])

  // Scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadModels = async () => {
    try {
      setIsLoadingModels(true)
      setApiKeyError(null)
      const response = await fetch('/api/ai/models')
      const data = await response.json()

      if (data.models && Array.isArray(data.models)) {
        setModels(data.models)
        if (data.models.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0].id)
        }
        
        // Afficher un avertissement s'il n'y a que les modèles par défaut
        if (data.warning) {
          setApiKeyError(data.warning)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error)
      setApiKeyError('Erreur lors du chargement des modèles')
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleRefreshModels = async () => {
    setModels([])
    await loadModels()
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedModel) return

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          temperature: moduleGenerationMode ? 0.3 : 0.7, // Plus déterministe en mode génération
          maxTokens: moduleGenerationMode ? 3000 : 2048,
          systemPrompt: moduleGenerationMode, // Utiliser le prompt système si mode génération
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Désolé, je n\'ai pas pu générer une réponse.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        aria-label="Ouvrir le chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-40 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg">Assistant IA</h3>
                <p className="text-sm text-blue-100">Connecté via OpenRouter</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModuleInfo(!showModuleInfo)}
                  className={`p-2 rounded-lg transition-colors ${
                    moduleGenerationMode ? 'bg-blue-500/50' : 'hover:bg-blue-500/50'
                  }`}
                  aria-label="Mode génération de modules"
                  title="Activer le mode génération de modules"
                >
                  <Zap size={18} />
                </button>
                <button
                  onClick={handleRefreshModels}
                  disabled={isLoadingModels}
                  className="p-2 hover:bg-blue-500/50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Actualiser les modèles"
                  title="Actualiser les modèles IA"
                >
                  <RefreshCw size={18} className={isLoadingModels ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            
            {/* Mode Génération Info */}
            {showModuleInfo && (
              <div className="mt-3 p-3 bg-blue-500/20 rounded-lg text-sm border border-blue-300/30">
                <p className="font-semibold mb-2">🚀 Mode Génération de Modules</p>
                <p className="text-xs text-blue-50 mb-2">
                  Demandez à l'IA de créer des modules de données avec schémas, validations et routes API.
                </p>
                <p className="text-xs text-blue-50/80">
                  ✓ Vous pouvez : créer schémas, relations, validations, routes API<br />
                  ✗ L'IA ne peut pas : UI, logique métier, intégrations externes
                </p>
              </div>
            )}
          </div>

          {/* Sélecteur de modèle */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 space-y-3">
            {apiKeyError && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️</span>
                <div className="text-sm text-yellow-800 dark:text-yellow-400">
                  <p className="font-medium">{apiKeyError}</p>
                  <p className="text-xs mt-1">
                    <a href="/admin/security" className="underline hover:no-underline font-medium">
                      Configurer la clé API OpenRouter →
                    </a>
                  </p>
                </div>
              </div>
            )}
            
            {/* Mode Génération Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleGenerationMode}
                  onChange={(e) => setModuleGenerationMode(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mode Génération IA
                </span>
              </label>
              {moduleGenerationMode && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  <Zap size={12} className="inline mr-1" />
                  Actif
                </span>
              )}
            </div>
            
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Modèle IA {isLoadingModels && '(Chargement...)'}
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoadingModels}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              {models.length === 0 && !isLoadingModels && (
                <option value="">Charger les modèles...</option>
              )}
              {isLoadingModels && (
                <option value="">Chargement des modèles...</option>
              )}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            {models.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {models.length} modèles gratuits disponibles
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
                <div>
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Bonjour! Comment puis-je vous aider?</p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  ) : (
                    <MessageContent content={message.content} />
                  )}
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre message..."
              disabled={isLoading || !selectedModel}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !selectedModel}
              className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg p-2 disabled:opacity-50 transition-all duration-200"
              aria-label="Envoyer"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
