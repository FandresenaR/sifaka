"use client";

import { ConversationSummary } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ConversationHistoryProps {
    conversations: ConversationSummary[];
    currentConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    onNewConversation: () => void;
    onClose: () => void;
}

export default function ConversationHistory({
    conversations,
    currentConversationId,
    onSelectConversation,
    onDeleteConversation,
    onNewConversation,
    onClose,
}: ConversationHistoryProps) {
    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Êtes-vous sûr de vouloir supprimer cette conversation ?")) {
            onDeleteConversation(id);
        }
    };

    return (
        <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 animate-slide-in-left flex flex-col shadow-xl">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Historique
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        aria-label="Fermer l'historique"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* New Conversation Button */}
                <button
                    onClick={onNewConversation}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle conversation
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2">
                {conversations.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8 px-4">
                        <p className="text-sm">Aucune conversation</p>
                        <p className="text-xs mt-2">Commencez une nouvelle conversation</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${conv.id === currentConversationId
                                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                                    }`}
                            >
                                {/* Title */}
                                <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate pr-8">
                                    {conv.title}
                                </h3>

                                {/* Metadata */}
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                        {formatDistanceToNow(conv.updatedAt, {
                                            addSuffix: true,
                                            locale: fr,
                                        })}
                                    </span>
                                    <span>•</span>
                                    <span>{conv.messageCount} messages</span>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDelete(e, conv.id)}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                    aria-label="Supprimer"
                                    title="Supprimer cette conversation"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                {conversations.length} / 100 conversations
            </div>
        </div>
    );
}
