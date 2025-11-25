import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeHtmlServer } from '@/lib/serverSanitize';
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { withCors } from "@/lib/cors";

// API publique - Récupérer un article par slug
async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const includeTranslations = searchParams.get('include') === 'translations';

    // Vérifier si c'est un admin
    const session = await auth();
    let isAdmin = false;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      isAdmin = user?.role ? ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(user.role) : false;
    }

    const where: any = { slug: id };

    // Seuls les admins peuvent voir les brouillons
    if (!isAdmin) {
      where.published = true;
    }

    const post = await prisma.blogPost.findFirst({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    // Inclure les traductions si demandé
    let response: any = post;
    if (includeTranslations && post.translationKey) {
      const translations = await prisma.blogPost.findMany({
        where: {
          translationKey: post.translationKey,
          slug: { not: post.slug },
          published: isAdmin ? undefined : true,
        },
        select: {
          slug: true,
          title: true,
          lang: true,
        },
      });
      response = { ...post, translations };
    }

    // CORS headers are handled by middleware
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Apply rate limiting and CORS to GET (public endpoint)
// Wrapper for dynamic routes with context
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const wrappedHandler = withCors(withRateLimit(
    async (r: NextRequest) => getHandler(r, context),
    RATE_LIMITS.BLOG
  ));
  return wrappedHandler(req);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { id } = await context.params;
    const data = await req.json();
    // Sanitize content server-side (double-check)
    if (data.content) {
      data.content = sanitizeHtmlServer(data.content);
    }

    // Récupérer l'article existant
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      select: { published: true, publishedAt: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    const updateData: any = { ...data };

    // Gérer publishedAt selon le statut de publication
    if (data.published === true && !existingPost.published) {
      // On passe de brouillon à publié : définir publishedAt
      updateData.publishedAt = new Date();
    } else if (data.published === false && existingPost.published) {
      // On dépublie : mettre publishedAt à null
      updateData.publishedAt = null;
    }

    // Créer une révision avant la mise à jour
    // On récupère d'abord les données complètes de l'article actuel
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
          authorId: user.id, // L'auteur de la révision est celui qui fait la modif (ou l'auteur original ?) 
          // Ici on met l'utilisateur courant qui fait la modif
        },
      });
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Seuls les admins peuvent supprimer" }, { status: 403 });
    }

    const { id } = await context.params;

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Article supprimé" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
