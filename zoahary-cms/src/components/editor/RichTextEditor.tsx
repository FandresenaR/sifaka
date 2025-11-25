"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback } from "react";
import EditorToolbar from "./EditorToolbar";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    onImageInsert?: () => void;
    onImageSelect?: (url: string, alt: string) => void;
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = "Commencez à écrire...",
    onImageInsert,
}: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 hover:underline",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            CharacterCount,
        ],
        content,
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4 text-gray-900 dark:text-gray-100 dark:prose-invert",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor content when prop changes (for loading existing content)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Expose insertImage method
    // Expose insertImage method
    const insertImage = useCallback((url: string, alt: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url, alt }).run();
        }
    }, [editor]);

    // Make insertImage available to parent via ref or callback
    useEffect(() => {
        if (editor && onImageInsert) {
            (window as any).__editorInsertImage = insertImage;
        }
    }, [editor, onImageInsert, insertImage]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <EditorToolbar editor={editor} onImageInsert={onImageInsert} />
            <div className="border-t">
                <EditorContent editor={editor} />
            </div>
            <div className="border-t px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                <span>{editor.storage.characterCount.characters()} caractères</span>
                <span>{editor.storage.characterCount.words()} mots</span>
            </div>
        </div>
    );
}
