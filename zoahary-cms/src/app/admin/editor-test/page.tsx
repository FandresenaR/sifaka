"use client";

import { useState } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import EditorPreview from "@/components/editor/EditorPreview";
import MediaSelector from "@/components/editor/MediaSelector";
import { Media } from "@/types/media";
import { Eye, EyeOff } from "lucide-react";

export default function EditorTestPage() {
    const [content, setContent] = useState("<p>Commencez à écrire votre article ici...</p>");
    const [showPreview, setShowPreview] = useState(false);
    const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);

    const handleImageSelect = (media: Media) => {
        // Use the exposed insertImage method from RichTextEditor
        if ((window as any).__editorInsertImage) {
            (window as any).__editorInsertImage(media.url, media.alt || media.title);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Test de l&apos;Éditeur WYSIWYG
                </h1>
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                    {showPreview ? "Masquer" : "Afficher"} la prévisualisation
                </button>
            </div>

            <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
                <div>
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Écrivez votre contenu ici..."
                        onImageInsert={() => setMediaSelectorOpen(true)}
                    />
                </div>

                {showPreview && (
                    <div>
                        <EditorPreview content={content} />
                    </div>
                )}
            </div>

            <MediaSelector
                isOpen={mediaSelectorOpen}
                onClose={() => setMediaSelectorOpen(false)}
                onSelect={handleImageSelect}
            />
        </div>
    );
}
