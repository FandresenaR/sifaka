"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Verify2FA() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  useEffect(() => {
    // Si pas de session, rediriger vers login
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    // Si 2FA pas activé ou déjà vérifié, rediriger vers admin
    if (status === "authenticated") {
      if (!session?.user?.twoFactorEnabled || session?.user?.twoFactorVerified) {
        router.push("/admin");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour la session pour marquer 2FA comme vérifié
        await update({ twoFactorVerified: true });
        
        // Ne pas rediriger ici - laisser le useEffect gérer la redirection
        // une fois que la session est mise à jour
      } else {
        setError(data.error || "Code invalide");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error verifying 2FA:", err);
      setError("Erreur lors de la vérification");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vérification 2FA
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {useBackupCode 
              ? "Entrez un code de récupération" 
              : "Entrez le code de votre application d'authentification"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="code" className="sr-only">
              {useBackupCode ? "Code de récupération" : "Code de vérification"}
            </label>
            <input
              id="code"
              type="text"
              inputMode={useBackupCode ? "text" : "numeric"}
              pattern={useBackupCode ? undefined : "[0-9]*"}
              maxLength={useBackupCode ? 8 : 6}
              value={code}
              onChange={(e) => {
                const value = e.target.value;
                if (useBackupCode) {
                  // Accepter uniquement A-F, 0-9 pour les codes backup (hex)
                  setCode(value.toUpperCase().replace(/[^A-F0-9]/g, ""));
                } else {
                  // Uniquement des chiffres pour TOTP
                  setCode(value.replace(/\D/g, ""));
                }
              }}
              placeholder={useBackupCode ? "A1B2C3D4" : "000000"}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white text-center text-2xl tracking-widest font-mono uppercase"
              required
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || code.length < (useBackupCode ? 8 : 6)}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Vérification..." : "Vérifier"}
            </button>
          </div>

          {useBackupCode && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>Les codes de récupération sont composés de 8 caractères (A-F, 0-9)</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Vous ne pouvez pas accéder à votre code ?</p>
            <button
              type="button"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode("");
                setError("");
              }}
            >
              {useBackupCode 
                ? "Utiliser un code d'authentification" 
                : "Utiliser un code de secours"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
