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

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const search = searchParams.get("search");
        const tag = searchParams.get("tag");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        const where: any = {};

        if (type) {
            where.type = type;
        }

        if (tag) {
            where.tags = {
                has: tag,
            };
        }

        if (search) {
            where.OR = [
                { filename: { contains: search, mode: "insensitive" } },
                { title: { contains: search, mode: "insensitive" } },
                { alt: { contains: search, mode: "insensitive" } },
            ];
        }

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
                include: {
                    uploader: {
                        select: { name: true, email: true },
                    },
                },
            }),
            prisma.media.count({ where }),
        ]);

        return NextResponse.json({
            media,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error("Error fetching media:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des médias" },
            { status: 500 }
        );
    }
}

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

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const alt = formData.get("alt") as string || "";
        const title = formData.get("title") as string || "";
        const folder = formData.get("folder") as string || "zoahary-baobab";

        // Parse tags safely
        let tags: string[] = [];
        const tagsRaw = formData.get("tags");
        if (tagsRaw) {
            try {
                tags = JSON.parse(tagsRaw as string);
            } catch (e) {
                // If not JSON, maybe comma separated
                tags = (tagsRaw as string).split(",").map(t => t.trim()).filter(Boolean);
            }
        }

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
        }

        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type;
        const type = mimeType.startsWith("image/") ? "image" :
            mimeType.startsWith("video/") ? "video" : "document";

        // Upload vers Cloudinary
        const result: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: folder,
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        // Sauvegarder en DB
        const media = await prisma.media.create({
            data: {
                filename: file.name,
                url: result.secure_url,
                publicId: result.public_id,
                type,
                mimeType,
                size: result.bytes,
                width: result.width,
                height: result.height,
                alt: alt || file.name, // Fallback to filename if no alt
                title: title || file.name,
                tags,
                folder,
                uploadedBy: user.id,
            },
        });

        return NextResponse.json(media);
    } catch (error) {
        console.error("Error uploading media:", error);
        return NextResponse.json(
            { error: "Erreur lors de l'upload" },
            { status: 500 }
        );
    }
}
