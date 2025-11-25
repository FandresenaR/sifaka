"use client";

import { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    Code2,
} from "lucide-react";

interface EditorToolbarProps {
    editor: Editor;
    onImageInsert?: () => void;
}

export default function EditorToolbar({ editor, onImageInsert }: EditorToolbarProps) {
    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isActive ? "bg-gray-200 dark:bg-gray-600" : ""
                }`}
            title={title}
        >
            {children}
        </button>
    );

    const addLink = () => {
        const url = window.prompt("URL du lien:");
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 dark:bg-gray-900">
            {/* Text Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Gras (Ctrl+B)"
            >
                <Bold size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Italique (Ctrl+I)"
            >
                <Italic size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Barré"
            >
                <Strikethrough size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
                title="Code inline"
            >
                <Code size={18} />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                title="Titre 1"
            >
                <Heading1 size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                title="Titre 2"
            >
                <Heading2 size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
                title="Titre 3"
            >
                <Heading3 size={18} />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Liste à puces"
            >
                <List size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Liste numérotée"
            >
                <ListOrdered size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Citation"
            >
                <Quote size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive("codeBlock")}
                title="Bloc de code"
            >
                <Code2 size={18} />
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Insert */}
            <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Insérer un lien">
                <LinkIcon size={18} />
            </ToolbarButton>

            {onImageInsert && (
                <ToolbarButton onClick={onImageInsert} title="Insérer une image">
                    <ImageIcon size={18} />
                </ToolbarButton>
            )}

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

            {/* Undo/Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                title="Annuler (Ctrl+Z)"
            >
                <Undo size={18} />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                title="Refaire (Ctrl+Y)"
            >
                <Redo size={18} />
            </ToolbarButton>
        </div>
    );
}
