"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "Il y a un problème de configuration OAuth. Vérifiez vos variables d'environnement.",
        AccessDenied: "Accès refusé. Vous n'avez pas la permission de vous connecter.",
        Verification: "Le token de vérification a expiré ou a déjà été utilisé.",
        Default: "Une erreur s'est produite lors de l'authentification.",
    };

    const errorMessage = errorMessages[error || "Default"] || errorMessages.Default;

    return (
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <span className="text-4xl">⚠️</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
                    Erreur d'authentification
                </h1>

                {/* Error Message */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 dark:text-red-200 text-center">
                        {errorMessage}
                    </p>
                    {error && (
                        <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2">
                            Code: {error}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/auth/signin"
                        className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center transition-colors"
                    >
                        Réessayer
                    </Link>
                    <Link
                        href="/"
                        className="block w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl text-center transition-colors"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 p-4">
            <Suspense fallback={
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            }>
                <AuthErrorContent />
            </Suspense>
        </div>
    );
}
