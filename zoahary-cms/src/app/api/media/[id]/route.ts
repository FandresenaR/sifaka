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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { id } = await params;

        const media = await prisma.media.findUnique({
            where: { id },
            include: {
                uploader: {
                    select: { name: true, email: true },
                },
            },
        });

        if (!media) {
            return NextResponse.json({ error: "Média non trouvé" }, { status: 404 });
        }

        return NextResponse.json(media);
    } catch (error) {
        console.error("Error fetching media details:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération du média" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { alt, title, description, tags, folder } = body;

        const media = await prisma.media.update({
            where: { id },
            data: {
                alt,
                title,
                description,
                tags,
                folder,
            },
        });

        return NextResponse.json(media);
    } catch (error) {
        console.error("Error updating media:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du média" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        // Vérifier si l'utilisateur est admin ou propriétaire
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        const { id } = await params;
        const media = await prisma.media.findUnique({
            where: { id },
        });

        if (!media) {
            return NextResponse.json({ error: "Média non trouvé" }, { status: 404 });
        }

        if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN" && media.uploadedBy !== user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        // Supprimer de Cloudinary
        await cloudinary.uploader.destroy(media.publicId);

        // Supprimer de la DB
        await prisma.media.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting media:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du média" },
            { status: 500 }
        );
    }
}
