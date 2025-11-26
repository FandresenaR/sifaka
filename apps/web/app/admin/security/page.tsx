"use client";

import { Shield, Sparkles, Lock } from "lucide-react";

export default function SecurityPage() {
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
                    />
                    <SettingCard
                        title="Rate Limiting"
                        description="Protection contre les abus"
                        enabled={true}
                    />
                    <SettingCard
                        title="Cloudflare WAF"
                        description="Web Application Firewall"
                        enabled={false}
                    />
                    <SettingCard
                        title="IP Whitelisting"
                        description="Liste blanche d'IPs"
                        enabled={false}
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
                <div className="space-y-4">
                    <AIProviderCard
                        name="OpenAI"
                        description="GPT-4, DALL-E, Embeddings"
                        configured={false}
                    />
                    <AIProviderCard
                        name="Anthropic Claude"
                        description="Claude 3 Opus, Sonnet, Haiku"
                        configured={false}
                    />
                    <AIProviderCard
                        name="Google Gemini"
                        description="Gemini Pro, Vision"
                        configured={false}
                    />
                </div>
            </div>
        </div>
    );
}

function SettingCard({ title, description, enabled }: {
    title: string;
    description: string;
    enabled: boolean;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
            <button
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

function AIProviderCard({ name, description, configured }: {
    name: string;
    description: string;
    configured: boolean;
}) {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                {configured ? "Configuré" : "Configurer"}
            </button>
        </div>
    );
}
