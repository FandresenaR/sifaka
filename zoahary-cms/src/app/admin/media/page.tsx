import MediaGallery from "@/components/media/MediaGallery";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Médiathèque | Zoahary CMS",
    description: "Gestion des images et fichiers",
};

export default function MediaPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Médiathèque
                </h1>
            </div>

            <MediaGallery />
        </div>
    );
}
