"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Save, Trash2, Copy, ExternalLink, FileText, Film } from "lucide-react";
import { Media } from "@/types/media";

interface MediaDetailsModalProps {
    media: Media;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<Media>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export default function MediaDetailsModal({
    media,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
}: MediaDetailsModalProps) {
    const [formData, setFormData] = useState({
        title: media.title || "",
        alt: media.alt || "",
        description: media.description || "",
        tags: media.tags?.join(", ") || "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        setFormData({
            title: media.title || "",
            alt: media.alt || "",
            description: media.description || "",
            tags: media.tags?.join(", ") || "",
        });
    }, [media]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const tagsArray = formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            await onUpdate(media.id, {
                ...formData,
                tags: tagsArray,
            });
            onClose();
        } catch (error) {
            console.error("Error updating media:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ? Cette action est irréversible.")) {
            return;
        }
        setIsDeleting(true);
        try {
            await onDelete(media.id);
            onClose();
        } catch (error) {
            console.error("Error deleting media:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(media.url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
                {/* Preview Section */}
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 relative min-h-[300px]">
                    {media.type === "image" ? (
                        <div className="relative w-full h-full min-h-[300px]">
                            <Image
                                src={media.url}
                                alt={media.alt || media.filename}
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            {media.type === "video" ? <Film size={64} /> : <FileText size={64} />}
                            <p className="mt-4 text-sm font-medium">{media.filename}</p>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 flex flex-col h-full max-h-[90vh]">
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Détails du média
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Metadata Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            <div>
                                <span className="block text-xs uppercase text-gray-400">Type</span>
                                {media.mimeType}
                            </div>
                            <div>
                                <span className="block text-xs uppercase text-gray-400">Taille</span>
                                {formatSize(media.size)}
                            </div>
                            {media.width && (
                                <div>
                                    <span className="block text-xs uppercase text-gray-400">Dimensions</span>
                                    {media.width} x {media.height}
                                </div>
                            )}
                            <div>
                                <span className="block text-xs uppercase text-gray-400">Date</span>
                                {new Date(media.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Titre
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Texte alternatif (Alt)
                                </label>
                                <input
                                    type="text"
                                    value={formData.alt}
                                    onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="Description pour l'accessibilité et le SEO"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tags (séparés par des virgules)
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    placeholder="nature, baobab, madagascar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* URL Copy */}
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                            <input
                                type="text"
                                readOnly
                                value={media.url}
                                className="flex-1 bg-transparent text-sm text-gray-600 dark:text-gray-300 outline-none"
                            />
                            <button
                                onClick={copyUrl}
                                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                title="Copier l'URL"
                            >
                                {copySuccess ? <span className="text-green-500 text-xs font-bold">Copié!</span> : <Copy size={16} />}
                            </button>
                            <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                title="Ouvrir dans un nouvel onglet"
                            >
                                <ExternalLink size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={18} />
                            <span className="hidden sm:inline">Supprimer</span>
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
                            >
                                <Save size={18} />
                                <span>{isSaving ? "Enregistrement..." : "Enregistrer"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
