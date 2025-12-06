"use client";

import { useState } from "react";
import { Shield, Sparkles, Save, Check, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SecurityPage() {
    const { data: session } = useSession();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sécurité & IA
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configuration de la sécurité et des services IA
                </p>
            </div>

            {!isSuperAdmin && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="w-5 h-5" />
                    <p>Seul le Super Admin peut modifier ces paramètres.</p>
                </div>
            )}

            {/* Security Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Paramètres de Sécurité
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Rate limiting, 2FA et protection
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingCard
                        title="Authentification 2FA"
                        description="Activer la double authentification"
                        enabled={false}
                        disabled={!isSuperAdmin}
                    />
                    <SettingCard
                        title="Rate Limiting"
                        description="Protection contre les abus"
                        enabled={true}
                        disabled={!isSuperAdmin}
                    />
                    <SettingCard
                        title="Cloudflare WAF"
                        description="Web Application Firewall"
                        enabled={false}
                        disabled={!isSuperAdmin}
                    />
                    <SettingCard
                        title="IP Whitelisting"
                        description="Liste blanche d'IPs"
                        enabled={false}
                        disabled={!isSuperAdmin}
                    />
                </div>
            </div>

            {/* AI Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Configuration IA
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            OpenAI, Claude et modèles personnalisés
                        </p>
                    </div>
                </div>
                <div className="space-y-6">
                    <AIConfigForm
                        provider="openai"
                        name="OpenAI"
                        description="GPT-4, DALL-E, Embeddings"
                        defaultModel="gpt-4-turbo-preview"
                        disabled={!isSuperAdmin}
                    />
                    <AIConfigForm
                        provider="claude"
                        name="Anthropic Claude"
                        description="Claude 3 Opus, Sonnet, Haiku"
                        defaultModel="claude-3-opus-20240229"
                        disabled={!isSuperAdmin}
                    />
                    <AIConfigForm
                        provider="openrouter"
                        name="OpenRouter"
                        description="Accès unifié aux modèles (Mistral, Llama, etc.)"
                        defaultModel="mistralai/mixtral-8x7b-instruct"
                        disabled={!isSuperAdmin}
                    />
                </div>
            </div>
        </div>
    );
}

function SettingCard({ title, description, enabled, disabled }: {
    title: string;
    description: string;
    enabled: boolean;
    disabled?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg ${disabled ? 'opacity-60' : ''}`}>
            <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
            <button
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    );
}

function AIConfigForm({ provider, name, description, defaultModel, disabled }: {
    provider: string;
    name: string;
    description: string;
    defaultModel: string;
    disabled?: boolean;
}) {
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState(defaultModel);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider,
                    apiKey,
                    model,
                    enabled: true
                }),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error("Error saving config:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                {saved ? (
                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                        <Check className="w-4 h-4" />
                        Enregistré
                    </span>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={loading || !apiKey}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "..." : "Sauvegarder"}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={`sk-...`}
                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Modèle par défaut
                    </label>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder={defaultModel}
                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}
