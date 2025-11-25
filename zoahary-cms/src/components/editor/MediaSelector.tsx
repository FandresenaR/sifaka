"use client";

import { useState } from "react";
import { X } from "lucide-react";
import MediaGallery from "../media/MediaGallery";
import { Media } from "@/types/media";

interface MediaSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (media: Media) => void;
}

export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
    if (!isOpen) return null;

    const handleSelect = (media: Media) => {
        onSelect(media);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Sélectionner un média
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    <MediaGallery onSelect={handleSelect} selectionMode={true} />
                </div>
            </div>
        </div>
    );
}
