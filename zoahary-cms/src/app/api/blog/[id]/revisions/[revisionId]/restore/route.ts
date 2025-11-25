import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string; revisionId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role !== "ADMIN" && user?.role !== "EDITOR" && user?.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        const { id, revisionId } = await context.params;

        // Récupérer la révision
        const revision = await prisma.blogPostRevision.findUnique({
            where: { id: revisionId },
        });

        if (!revision) {
            return NextResponse.json({ error: "Révision non trouvée" }, { status: 404 });
        }

        if (revision.postId !== id) {
            return NextResponse.json({ error: "Révision ne correspond pas à l'article" }, { status: 400 });
        }

        // Créer une NOUVELLE révision avec l'état ACTUEL avant de restaurer (pour ne pas perdre le travail actuel)
        const currentPost = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (currentPost) {
            await prisma.blogPostRevision.create({
                data: {
                    postId: currentPost.id,
                    title: currentPost.title,
                    content: currentPost.content,
                    excerpt: currentPost.excerpt,
                    coverImage: currentPost.coverImage,
                    tags: currentPost.tags,
                    authorId: user.id,
                },
            });
        }

        // Restaurer l'article avec les données de la révision
        const restoredPost = await prisma.blogPost.update({
            where: { id },
            data: {
                title: revision.title,
                content: revision.content,
                excerpt: revision.excerpt,
                coverImage: revision.coverImage,
                tags: revision.tags,
                updatedAt: new Date(), // Mettre à jour la date de modification
            },
        });

        return NextResponse.json(restoredPost);
    } catch (error) {
        console.error("Error restoring revision:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
