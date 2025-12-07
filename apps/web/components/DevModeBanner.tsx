"use client"

export function DevModeBanner() {
  // Vérifier si on est en mode bypass (côté client, on vérifie via une meta tag ou prop)
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-semibold">
      🔓 MODE DÉVELOPPEMENT - Authentication Bypass Activé
    </div>
  )
}
