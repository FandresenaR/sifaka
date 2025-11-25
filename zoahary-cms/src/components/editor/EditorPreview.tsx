"use client";

interface EditorPreviewProps {
    content: string;
}

export default function EditorPreview({ content }: EditorPreviewProps) {
    return (
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Prévisualisation
            </h3>
            <div
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
}
