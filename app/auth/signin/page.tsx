"use client";

import { signIn } from "next-auth/react";
import { Chrome } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl">🚀</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Sifaka CMS
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Connectez-vous pour accéder au dashboard
                        </p>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/admin" })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-lg group"
                    >
                        <Chrome className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            Continuer avec Google
                        </span>
                    </button>

                    {/* Info */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                            🔒 Connexion sécurisée via Google OAuth
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            En vous connectant, vous acceptez nos conditions d'utilisation
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        ← Retour à l'accueil
                    </a>
                </div>
            </div>
        </div>
    );
}
