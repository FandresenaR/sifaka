"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface MediaUploaderProps {
    onUploadComplete: (media: any) => void;
}

export default function MediaUploader({ onUploadComplete }: MediaUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await uploadFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadFiles(Array.from(e.target.files));
        }
    };

    const uploadFiles = async (files: File[]) => {
        setIsUploading(true);
        setError(null);

        try {
            // Pour l'instant on upload un par un, mais on pourrait paralléliser
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "sifaka-media");

                const res = await fetch("/api/media", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error(`Erreur lors de l'upload de ${file.name}`);
                }

                const data = await res.json();
                onUploadComplete(data);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Une erreur est survenue lors de l'upload");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                    }
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileSelect}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-2" />
                        <p className="font-medium">Upload en cours...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Upload className="w-10 h-10 mb-2" />
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                            Cliquez ou glissez des fichiers ici
                        </p>
                        <p className="text-sm mt-1">
                            Images, vidéos ou documents (max 5MB)
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="hover:text-red-800">
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
