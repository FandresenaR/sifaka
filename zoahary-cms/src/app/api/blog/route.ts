import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeHtmlServer } from '@/lib/serverSanitize';
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { withCors } from "@/lib/cors";

// API publique pour le site principal
async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang');
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '100');

    // Vérifier si c'est une requête authentifiée (admin)
    const session = await auth();
    let isAdmin = false;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });
      isAdmin = user?.role ? ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(user.role) : false;
    }

    // Filtres pour requête publique (site principal)
    const where: any = {};

    // Seuls les admins peuvent voir les brouillons
    if (!isAdmin) {
      where.published = true;
    } else if (status === 'published') {
      where.published = true;
    } else if (status === 'draft') {
      where.published = false;
    }

    // Filtrer par langue si spécifié
    if (lang) {
      where.lang = lang.toUpperCase();
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
    });

    // Headers CORS pour permettre l'accès depuis le site principal
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return NextResponse.json(posts, { headers });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
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

    if (user?.role !== "ADMIN" && user?.role !== "EDITOR" && user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await req.json();
    // Sanitize content server-side (double-check)
    if (data.content) {
      data.content = sanitizeHtmlServer(data.content);
    }

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        authorId: user.id,
        publishedAt: data.published ? new Date() : null,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Apply rate limiting and CORS to GET (public endpoint)
export const GET = withCors(withRateLimit(handler, RATE_LIMITS.BLOG));
