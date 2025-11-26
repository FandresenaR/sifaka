"use client";

import Link from "next/link";
import { Package, FileText, Users, FolderOpen, Activity, Shield, Edit, DollarSign } from "lucide-react";

export default function AdminDashboard() {
    const modules = [
        {
            title: "Gestion de Produits",
            description: "Catalogue, prix, inventaire et catégories",
            icon: Package,
            href: "/admin/products",
            color: "from-blue-500 to-cyan-500",
            stats: "0 produits"
        },
        {
            title: "Gestion de Blog",
            description: "Articles, révisions, SEO et publication",
            icon: FileText,
            href: "/admin/blog",
            color: "from-purple-500 to-pink-500",
            stats: "0 articles"
        },
        {
            title: "Médiathèque",
            description: "Upload, organisation et optimisation",
            icon: FolderOpen,
            href: "/admin/media",
            color: "from-green-500 to-emerald-500",
            stats: "0 fichiers"
        },
        {
            title: "Utilisateurs",
            description: "Gestion des rôles et permissions",
            icon: Users,
            href: "/admin/users",
            color: "from-orange-500 to-red-500",
            stats: "0 utilisateurs"
        },
        {
            title: "Monitoring",
            description: "Analytics, IPs bloquées, Cloudflare",
            icon: Activity,
            href: "/admin/monitoring",
            color: "from-yellow-500 to-orange-500",
            stats: "Actif"
        },
        {
            title: "Sécurité & IA",
            description: "Configuration 2FA, rate limiting, AI",
            icon: Shield,
            href: "/admin/security",
            color: "from-red-500 to-rose-500",
            stats: "Configuré"
        },
        {
            title: "Éditeur de Texte",
            description: "Test de l'éditeur WYSIWYG",
            icon: Edit,
            href: "/admin/editor-test",
            color: "from-indigo-500 to-purple-500",
            stats: "Disponible"
        },
        {
            title: "Gestion des Prix",
            description: "Multi-devises et réductions",
            icon: DollarSign,
            href: "/admin/pricing",
            color: "from-teal-500 to-cyan-500",
            stats: "0 règles"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Dashboard Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Gérez tous vos modules depuis un seul endroit
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Produits" value="0" change="+0%" />
                <StatCard title="Articles" value="0" change="+0%" />
                <StatCard title="Utilisateurs" value="0" change="+0%" />
                <StatCard title="Médias" value="0" change="+0%" />
            </div>

            {/* Modules Grid */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Modules Disponibles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        return (
                            <Link
                                key={module.title}
                                href={module.href}
                                className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {module.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {module.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                        {module.stats}
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                        Ouvrir →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
    const isPositive = change.startsWith("+");
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <span className={`text-sm font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {change}
                </span>
            </div>
        </div>
    );
}
