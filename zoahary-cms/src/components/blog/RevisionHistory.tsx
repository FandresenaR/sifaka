import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Revision {
    id: string;
    createdAt: string;
    author: {
        name: string | null;
        email: string;
    };
    title: string;
}

interface RevisionHistoryProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
    onRestore: () => void;
}

export default function RevisionHistory({ postId, isOpen, onClose, onRestore }: RevisionHistoryProps) {
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && postId) {
            fetchRevisions();
        }
    }, [isOpen, postId]);

    const fetchRevisions = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/blog/${postId}/revisions`);
            if (res.ok) {
                const data = await res.json();
                setRevisions(data);
            }
        } catch (error) {
            console.error('Error fetching revisions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (revisionId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir restaurer cette version ? La version actuelle sera sauvegardée comme une nouvelle révision.')) {
            return;
        }

        setRestoringId(revisionId);
        try {
            const res = await fetch(`/api/blog/${postId}/revisions/${revisionId}/restore`, {
                method: 'POST',
            });

            if (res.ok) {
                alert('Version restaurée avec succès');
                onRestore(); // Callback to refresh the editor content
                onClose();
            } else {
                const error = await res.json();
                alert(`Erreur: ${error.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.error('Error restoring revision:', error);
            alert('Erreur lors de la restauration');
        } finally {
            setRestoringId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-end z-[60]">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historique des versions</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : revisions.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Aucune révision trouvée pour cet article.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {revisions.map((revision) => (
                                <div
                                    key={revision.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {format(new Date(revision.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                par {revision.author.name || revision.author.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                                            <span className="font-medium">Titre:</span> {revision.title}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(revision.id)}
                                        disabled={restoringId === revision.id}
                                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {restoringId === revision.id ? 'Restauration...' : 'Restaurer cette version'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
