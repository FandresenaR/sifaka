"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, RefreshCw, DownloadCloud } from "lucide-react";
import MediaCard from "./MediaCard";
import MediaUploader from "./MediaUploader";
import MediaDetailsModal from "./MediaDetailsModal";
import { Media } from "@/types/media";

interface MediaGalleryProps {
    onSelect?: (media: Media) => void;
    selectionMode?: boolean;
}

export default function MediaGallery({ onSelect, selectionMode = false }: MediaGalleryProps) {
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: "",
        search: "",
        tag: "",
    });
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false,
    });
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const fetchMedia = useCallback(async (reset = false, customOffset?: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.type) params.append("type", filters.type);
            if (filters.search) params.append("search", filters.search);
            if (filters.tag) params.append("tag", filters.tag);

            const offset = customOffset ?? (reset ? 0 : pagination.offset);
            params.append("limit", pagination.limit.toString());
            params.append("offset", offset.toString());

            const res = await fetch(`/api/media?${params.toString()}`);
            const data = await res.json();

            if (reset) {
                setMedia(data.media);
            } else {
                setMedia((prev) => [...prev, ...data.media]);
            }

            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching media:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit, pagination.offset]);

    useEffect(() => {
        fetchMedia(true);
    }, [fetchMedia]);

    const loadMore = () => {
        if (pagination.hasMore) {
            const newOffset = pagination.offset + pagination.limit;
            fetchMedia(false, newOffset);
        }
    };

    const handleUploadComplete = (newMedia: Media) => {
        setMedia((prev) => [newMedia, ...prev]);
    };

    const handleUpdate = async (id: string, data: Partial<Media>) => {
        const res = await fetch(`/api/media/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            const updated = await res.json();
            setMedia((prev) => prev.map((m) => (m.id === id ? updated : m)));
        }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/media/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setMedia((prev) => prev.filter((m) => m.id !== id));
            setDetailsOpen(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch("/api/media/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}) // Sync tous les dossiers
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Synchronisation terminée : ${data.added} ajoutés, ${data.skipped} ignorés.`);
                fetchMedia(true);
            } else {
                alert("Erreur lors de la synchronisation");
            }
        } catch (error) {
            console.error("Error syncing:", error);
            alert("Erreur lors de la synchronisation");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tous les types</option>
                        <option value="image">Images</option>
                        <option value="video">Vidéos</option>
                        <option value="document">Documents</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Synchroniser avec le storage"
                    >
                        <DownloadCloud size={20} className={syncing ? "animate-bounce" : ""} />
                        <span className="hidden sm:inline">Sync</span>
                    </button>
                    <button
                        onClick={() => fetchMedia(true)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Rafraîchir"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            {!selectionMode && (
                <MediaUploader onUploadComplete={handleUploadComplete} />
            )}

            {/* Gallery Grid */}
            {loading && media.length === 0 ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="animate-spin text-blue-500" size={32} />
                </div>
            ) : media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media.map((item) => (
                        <MediaCard
                            key={item.id}
                            media={item}
                            onClick={(m) => {
                                if (selectionMode && onSelect) {
                                    onSelect(m);
                                } else {
                                    setSelectedMedia(m);
                                    setDetailsOpen(true);
                                }
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Aucun média trouvé
                </div>
            )}

            {/* Load More */}
            {pagination.hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Chargement..." : "Charger plus"}
                    </button>
                </div>
            )}

            {/* Details Modal */}
            {selectedMedia && (
                <MediaDetailsModal
                    media={selectedMedia}
                    isOpen={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
