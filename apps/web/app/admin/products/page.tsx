"use client";

import { useState } from "react";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gestion des Produits
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Catalogue, prix, inventaire et catégories
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Ajouter un produit
                </button>
            </div>

            {/* Empty State */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun produit
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Commencez par ajouter votre premier produit au catalogue
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left max-w-2xl mx-auto">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                            Fonctionnalités disponibles :
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                            <li>• Support multilingue (FR/EN)</li>
                            <li>• Upload d'images vers Cloudinary</li>
                            <li>• Gestion des catégories</li>
                            <li>• Badges (Nouveau, Vedette, Bientôt)</li>
                            <li>• Gestion du stock</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
