
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

export default function AIConfigSection() {
    const [apiKey, setApiKey] = useState("");
    const [maskedKey, setMaskedKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/ai-config");
            if (response.ok) {
                const data = await response.json();
                setMaskedKey(data.maskedApiKey);
            }
        } catch (error) {
            console.error("Error fetching AI config:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!apiKey) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/admin/ai-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey }),
            });

            if (response.ok) {
                const data = await response.json();
                setMaskedKey(data.maskedApiKey);
                setApiKey(""); // Clear input
                addToast("success", "Configuration IA sauvegardée avec succès");
            } else {
                const error = await response.json();
                addToast("error", error.error || "Erreur lors de la sauvegarde");
            }
        } catch (error) {
            console.error("Error saving AI config:", error);
            addToast("error", "Erreur de connexion");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Configuration IA (OpenRouter)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gérez la clé API pour les fonctionnalités d&apos;intelligence artificielle.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Clé API OpenRouter
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                            type="password"
                            name="apiKey"
                            id="apiKey"
                            className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2"
                            placeholder={maskedKey || "sk-or-..."}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                    {maskedKey && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Clé configurée : {maskedKey}
                        </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        La clé est chiffrée avant d&apos;être stockée. Elle n&apos;est jamais exposée côté client.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!apiKey || isSaving}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${(!apiKey || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>
        </div>
    );
}
