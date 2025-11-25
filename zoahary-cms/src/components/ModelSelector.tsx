"use client";

import React, { useState, useEffect } from "react";
import { ChatModel } from "@/types/chat";

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
    const [models, setModels] = useState<ChatModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Date limite pour les nouveaux modèles (2 mois)
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const fetchModels = React.useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/chat/models');

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des modèles');
            }

            const data = await response.json();
            setModels(data.models || []);

            // Auto-select first model if none selected
            if (!selectedModel && data.models && data.models.length > 0) {
                onModelChange(data.models[0].id);
            }
        } catch (err) {
            setError('Impossible de charger les modèles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedModel, onModelChange]);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    // Fonction pour vérifier si un modèle est nouveau
    const isNewModel = (model: ChatModel): boolean => {
        // Si le modèle a une date de création
        if (model.created) {
            const modelDate = new Date(model.created * 1000); // Unix timestamp to Date
            return modelDate > twoMonthsAgo;
        }
        return false;
    };

    // Grouper les modèles
    const newModels = models.filter(isNewModel);
    const existingModels = models.filter(m => !isNewModel(m));

    if (loading && models.length === 0) {
        return (
            <div className="text-xs text-gray-500 dark:text-gray-400">
                Chargement...
            </div>
        );
    }

    if (error && models.length === 0) {
        return (
            <div className="flex items-center gap-1">
                <div className="text-xs text-red-500">Erreur</div>
                <button
                    onClick={fetchModels}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label="Réessayer"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        );
    }

    const selectedModelData = models.find(m => m.id === selectedModel);

    return (
        <div className="relative w-full flex items-center gap-1">
            <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors truncate"
                title={selectedModelData?.description || selectedModelData?.name}
            >
                {/* Nouveaux modèles */}
                {newModels.length > 0 && (
                    <optgroup label="🆕 Nouveaux modèles">
                        {newModels.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name} ⭐
                            </option>
                        ))}
                    </optgroup>
                )}

                {/* Tous les modèles */}
                <optgroup label={newModels.length > 0 ? "📋 Tous les modèles" : "Modèles disponibles"}>
                    {existingModels.map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name}
                        </option>
                    ))}
                </optgroup>
            </select>
            <button
                onClick={fetchModels}
                disabled={loading}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
                aria-label="Rafraîchir les modèles"
                title="Rafraîchir la liste des modèles"
            >
                <svg
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
            </button>
        </div>
    );
}
