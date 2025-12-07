"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { setToken, getToken } from "@/lib/oauth";

// Normalise l'URL de base en supprimant le slash final
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

export function TokenSync() {
    const { data: session } = useSession();
    const syncingRef = useRef(false);

    useEffect(() => {
        // Si pas de session ou pas d'ID token, on ne fait rien
        if (!session?.user?.id_token) return;

        // Si on a déjà un token dans le localStorage, on vérifie s'il faut le rafraîchir
        // Pour l'instant on garde ça simple : si token présent, on suppose qu'il est bon
        // TODO: Ajouter une vérification d'expiration si nécessaire
        if (getToken()) return;

        const syncToken = async () => {
            // Évite les doubles appels
            if (syncingRef.current) return;
            syncingRef.current = true;

            try {
                console.log("🔄 Syncing authentication with API...");

                // Appel à l'API pour échanger l'ID Token Google contre un JWT API
                const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        idToken: session.user.id_token,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Auth sync failed: ${response.statusText}`);
                }

                const data = await response.json();

                // Sauvegarde le token pour le client API
                if (data.accessToken) {
                    setToken(data.accessToken);
                    console.log("✅ API Authentication synced successfully");
                    // Recharger la page pour que les composants utilisent le nouveau token ?
                    // Pour l'instant non, les prochains appels API utiliseront le token via getToken()
                }
            } catch (error) {
                console.error("❌ Failed to sync auth token:", error);
            } finally {
                syncingRef.current = false;
            }
        };

        syncToken();
    }, [session]);

    return null; // Composant invisible
}
