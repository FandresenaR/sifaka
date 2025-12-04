"use client";

import { Users, UserPlus } from "lucide-react";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gestion des Utilisateurs
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Rôles, permissions et authentification
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Inviter un utilisateur
                </button>
            </div>

            {/* Empty State */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun utilisateur
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Invitez des membres à rejoindre votre équipe
                    </p>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-left max-w-2xl mx-auto">
                        <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                            Fonctionnalités disponibles :
                        </h4>
                        <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
                            <li>• Rôles personnalisables (Admin, Editor, User)</li>
                            <li>• Authentification 2FA</li>
                            <li>• OAuth (Google, GitHub)</li>
                            <li>• Gestion des permissions</li>
                            <li>• Historique d'activité</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
