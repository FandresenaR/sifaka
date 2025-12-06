import Image from "next/image";
import { FileText, Film, Image as ImageIcon, Check } from "lucide-react";
import { Media } from "@/types/media";

interface MediaCardProps {
    media: Media;
    selected?: boolean;
    onSelect?: (media: Media) => void;
    onClick?: (media: Media) => void;
}

export default function MediaCard({ media, selected, onSelect, onClick }: MediaCardProps) {
    const isImage = media.type === "image";

    return (
        <div
            className={`group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all cursor-pointer
        ${selected
                    ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                    : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                }`}
            onClick={() => onClick?.(media)}
        >
            {/* Thumbnail */}
            {isImage ? (
                <Image
                    src={media.url}
                    alt={media.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {media.type === "video" ? <Film size={48} /> : <FileText size={48} />}
                </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex flex-col justify-end p-2">
                <p className="text-white text-xs truncate opacity-0 group-hover:opacity-100 font-medium drop-shadow-md">
                    {media.filename}
                </p>
            </div>

            {/* Selection Checkbox */}
            {onSelect && (
                <div
                    className="absolute top-2 right-2 z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(media);
                    }}
                >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
            ${selected
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white/80 border-gray-300 text-transparent hover:border-blue-400"
                        }`}
                    >
                        <Check size={14} strokeWidth={3} />
                    </div>
                </div>
            )}
        </div>
    );
}
