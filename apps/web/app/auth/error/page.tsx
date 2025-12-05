"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"

function AuthErrorContent() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setError(params.get("error"))
  }, [])

  const errorMessages: Record<string, { title: string; description: string; solution: string }> = {
    Configuration: {
      title: "Erreur de configuration OAuth",
      description: "La configuration Google OAuth n'est pas correcte.",
      solution: `Vérifiez que l'URI de redirection suivante est autorisée dans Google Cloud Console :
      
http://localhost:3000/api/auth/callback/google

Étapes :
1. Allez sur https://console.cloud.google.com/apis/credentials
2. Sélectionnez votre Client ID OAuth 2.0
3. Ajoutez l'URI ci-dessus dans "URIs de redirection autorisées"
4. Sauvegardez et réessayez`
    },
    AccessDenied: {
      title: "Accès refusé",
      description: "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
      solution: "Contactez l'administrateur pour obtenir les permissions nécessaires."
    },
    Verification: {
      title: "Erreur de vérification",
      description: "Le lien de vérification est invalide ou a expiré.",
      solution: "Demandez un nouveau lien de vérification."
    },
    Default: {
      title: "Erreur d'authentification",
      description: "Une erreur s'est produite lors de l'authentification.",
      solution: "Réessayez plus tard ou contactez le support."
    }
  }

  const currentError = errorMessages[error || "Default"] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentError.title}</h1>
              <p className="text-sm text-gray-500">Code d'erreur: {error || "Unknown"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{currentError.description}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Solution</h2>
              <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap">
{currentError.solution}
              </pre>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href="/auth/signin"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              Réessayer la connexion
            </Link>
            <Link
              href="/"
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors text-center font-medium"
            >
              Retour à l'accueil
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Astuce :</strong> Si le problème persiste, vérifiez que :
            </p>
            <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Les variables d'environnement sont correctement configurées</li>
              <li>Le GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sont valides</li>
              <li>Les URIs de redirection sont autorisées dans Google Cloud Console</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
