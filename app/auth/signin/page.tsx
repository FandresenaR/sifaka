"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Chrome } from "lucide-react";
import { getGoogleAuthURL } from "@/lib/oauth";

export default function SignInPage() {
    const [googleAuthUrl, setGoogleAuthUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setGoogleAuthUrl(getGoogleAuthURL());
    }, []);

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        if (googleAuthUrl) {
            window.location.href = googleAuthUrl;
        }
    };

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
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || !googleAuthUrl}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Chrome className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {isLoading ? "Redirection..." : "Continuer avec Google"}
                        </span>
                    </button>

                    {/* Info */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                            🔒 Connexion sécurisée via Google OAuth 2.0
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
                        <p>En vous connectant, vous acceptez nos conditions d'utilisation</p>
                        <div className="flex gap-2 justify-center">
                            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                                Accueil
                            </Link>
                            <span>•</span>
                            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                                Assistance
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
