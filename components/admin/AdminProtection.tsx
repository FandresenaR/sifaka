/**
 * Composant de protection des routes admin
 * La protection serveur est gérée par proxy.ts
 * Ce composant gère juste l'affichage pendant le chargement côté client
 */

"use client";

import { useSession } from "next-auth/react";

export function AdminProtection({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  // Pendant le chargement, afficher un loader
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // La protection serveur (proxy.ts) a déjà vérifié l'auth
  // Si on arrive ici, c'est que l'utilisateur est autorisé
  return <>{children}</>;
}
