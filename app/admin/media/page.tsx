import MediaGallery from "@/components/media/MediaGallery";

export const metadata = {
    title: "Médiathèque | Sifaka CMS",
    description: "Gestion des images et fichiers",
};

export default function MediaPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Médiathèque
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Gérez vos images, vidéos et documents
                    </p>
                </div>
            </div>

            <MediaGallery />
        </div>
    );
}
