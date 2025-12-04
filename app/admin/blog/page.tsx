"use client";

import { FileText, Plus } from "lucide-react";

export default function BlogPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gestion du Blog
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Articles, révisions, SEO et publication
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Nouvel article
                </button>
            </div>

            {/* Empty State */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun article
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Commencez à créer du contenu pour votre blog
                    </p>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-left max-w-2xl mx-auto">
                        <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                            Fonctionnalités disponibles :
                        </h4>
                        <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
                            <li>• Éditeur WYSIWYG avancé</li>
                            <li>• Historique des révisions</li>
                            <li>• Optimisation SEO</li>
                            <li>• Gestion des tags</li>
                            <li>• Publication programmée</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
