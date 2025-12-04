"use client";

import { useState } from "react";
import { Activity, AlertTriangle, Shield, Ban } from "lucide-react";

export default function MonitoringPage() {
    const [selectedTab, setSelectedTab] = useState<"overview" | "logs" | "blocked">("overview");

    // Données mockées pour l'instant
    const stats = {
        total24h: 0,
        rateLimit24h: 0,
        uniqueIps24h: 0,
        blockedCount: 0,
    };

    const logs: any[] = [];
    const blockedIps: any[] = [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        🛡️ Monitoring & Sécurité
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Suivi des activités et gestion Cloudflare
                    </p>
                </div>
                <span className="text-sm text-gray-500">
                    Dernière mise à jour : {new Date().toLocaleTimeString()}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <StatCard
                    title="Incidents (24h)"
                    value={stats.total24h}
                    icon={<Activity className="w-5 h-5" />}
                    color="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Rate Limits (24h)"
                    value={stats.rateLimit24h}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="text-yellow-600 dark:text-yellow-400"
                />
                <StatCard
                    title="IPs Suspectes (24h)"
                    value={stats.uniqueIps24h}
                    icon={<Shield className="w-5 h-5" />}
                    color="text-orange-600 dark:text-orange-400"
                />
                <StatCard
                    title="IPs Bloquées"
                    value={stats.blockedCount}
                    icon={<Ban className="w-5 h-5" />}
                    color="text-red-600 dark:text-red-400"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setSelectedTab("overview")}
                        className={`${selectedTab === "overview"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Vue d'ensemble
                    </button>
                    <button
                        onClick={() => setSelectedTab("logs")}
                        className={`${selectedTab === "logs"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Logs de sécurité
                    </button>
                    <button
                        onClick={() => setSelectedTab("blocked")}
                        className={`${selectedTab === "blocked"
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        IPs Bloquées
                    </button>
                </nav>
            </div>

            {/* Content */}
            {selectedTab === "overview" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Monitoring en attente de configuration
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Connectez votre backend pour activer le monitoring en temps réel
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left max-w-2xl mx-auto">
                            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                                Fonctionnalités disponibles :
                            </h4>
                            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                                <li>• Suivi des tentatives de connexion</li>
                                <li>• Rate limiting automatique</li>
                                <li>• Détection d'IPs suspectes</li>
                                <li>• Intégration Cloudflare WAF</li>
                                <li>• Logs de sécurité détaillés</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === "logs" && (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Derniers événements
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Message
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        IP / Endpoint
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Aucun événement de sécurité enregistré
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedTab === "blocked" && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <Ban className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucune IP bloquée
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Les IPs suspectes seront automatiquement bloquées ici
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {title}
                        </dt>
                        <dd className={`mt-1 text-3xl font-semibold ${color}`}>
                            {value}
                        </dd>
                    </div>
                    <div className={color}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
}
