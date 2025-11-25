import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        // Récupérer le préfixe/dossier optionnel depuis le body
        const body = await req.json().catch(() => ({}));
        const prefix = body.prefix || ""; // Par exemple: "zoahary-baobab/"

        console.log("Starting sync with prefix:", prefix || "(all folders)");

        // Récupérer les ressources depuis Cloudinary
        // On doit faire des appels séparés pour chaque type de ressource
        let allResources: any[] = [];

        // Configuration commune pour les appels API
        const apiConfig: any = {
            type: "upload",
            max_results: 500,
        };

        // Ajouter le préfixe si spécifié
        if (prefix) {
            apiConfig.prefix = prefix;
        }

        // Récupérer les images
        try {
            console.log("Fetching images with config:", apiConfig);
            const imageResult = await cloudinary.api.resources({
                ...apiConfig,
                resource_type: "image",
            });
            console.log(`Found ${imageResult.resources.length} images`);
            allResources = [...allResources, ...imageResult.resources];
        } catch (error: any) {
            console.log("No images found or error fetching images:", error.message);
        }

        // Récupérer les vidéos
        try {
            console.log("Fetching videos with config:", apiConfig);
            const videoResult = await cloudinary.api.resources({
                ...apiConfig,
                resource_type: "video",
            });
            console.log(`Found ${videoResult.resources.length} videos`);
            allResources = [...allResources, ...videoResult.resources];
        } catch (error: any) {
            console.log("No videos found or error fetching videos:", error.message);
        }

        // Récupérer les autres fichiers (raw)
        try {
            console.log("Fetching raw files with config:", apiConfig);
            const rawResult = await cloudinary.api.resources({
                ...apiConfig,
                resource_type: "raw",
            });
            console.log(`Found ${rawResult.resources.length} raw files`);
            allResources = [...allResources, ...rawResult.resources];
        } catch (error: any) {
            console.log("No raw files found or error fetching raw files:", error.message);
        }

        console.log(`Total resources found: ${allResources.length}`);

        let addedCount = 0;
        let skippedCount = 0;

        for (const resource of allResources) {
            // Vérifier si le média existe déjà
            const existingMedia = await prisma.media.findFirst({
                where: { publicId: resource.public_id },
            });

            if (existingMedia) {
                skippedCount++;
                continue;
            }

            // Déterminer le type
            const type = resource.resource_type === "image" ? "image" :
                resource.resource_type === "video" ? "video" : "document";

            // Créer le média
            await prisma.media.create({
                data: {
                    filename: resource.public_id.split("/").pop() || resource.public_id,
                    url: resource.secure_url,
                    publicId: resource.public_id,
                    type,
                    mimeType: `${resource.resource_type}/${resource.format}`,
                    size: resource.bytes,
                    width: resource.width || null,
                    height: resource.height || null,
                    alt: "", // Pas d'alt par défaut depuis Cloudinary
                    title: resource.public_id.split("/").pop() || resource.public_id,
                    tags: [],
                    folder: resource.folder || "",
                    uploadedBy: user.id,
                },
            });
            addedCount++;
        }

        return NextResponse.json({
            message: "Synchronisation terminée",
            added: addedCount,
            skipped: skippedCount,
            total: allResources.length
        });

    } catch (error) {
        console.error("Error syncing media:", error);
        return NextResponse.json(
            { error: "Erreur lors de la synchronisation" },
            { status: 500 }
        );
    }
}
