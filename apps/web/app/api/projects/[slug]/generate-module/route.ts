import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  generateModuleWithAI,
  generateModuleFallback,
  validateAIResponse,
} from "@/lib/ai-modules"

interface GenerateModuleRequest {
  moduleName: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    description?: string;
  }>;
  relationships?: Array<{
    target: string;
    type: "one-to-many" | "many-to-one" | "many-to-many";
  }>;
  useFallback?: boolean; // Pour les tests sans API
}

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

/**
 * POST /api/projects/[slug]/generate-module
 * Génère un module Prisma via IA et le sauvegarde
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body: GenerateModuleRequest = await request.json();

    // Valider les données
    if (!body.moduleName || !body.description) {
      return NextResponse.json(
        { error: "moduleName et description sont requis" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.fields) || body.fields.length === 0) {
      return NextResponse.json(
        { error: "Au moins un champ est requis" },
        { status: 400 }
      );
    }

    // Charger le projet
    const project = await prisma.project.findUnique({
      where: { slug },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";
    const isOwner = project.ownerId === session.user.id;

    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Vérifier que le module n'existe pas déjà
    const existingModule = await prisma.projectModuleDefinition.findUnique({
      where: {
        projectId_moduleName: {
          projectId: project.id,
          moduleName: body.moduleName,
        },
      },
    });

    if (existingModule) {
      return NextResponse.json(
        { error: `Le module ${body.moduleName} existe déjà` },
        { status: 409 }
      );
    }

    // Générer le module via IA
    let aiResponse;
    try {
      aiResponse = body.useFallback
        ? generateModuleFallback(body)
        : await generateModuleWithAI(body);
    } catch (error) {
      console.warn("Erreur IA, utilisation du fallback:", error);
      aiResponse = generateModuleFallback(body);
    }

    // Valider la réponse IA
    const existingModules = await prisma.projectModuleDefinition.findMany({
      where: { projectId: project.id },
      select: { moduleName: true },
    });

    const validation = validateAIResponse(
      aiResponse,
      existingModules.map((m) => m.moduleName)
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Validation de la réponse IA échouée",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Sauvegarder la définition du module
    const moduleDefinition = await prisma.projectModuleDefinition.create({
      data: {
        projectId: project.id,
        moduleName: aiResponse.moduleName,
        displayName: aiResponse.displayName,
        description: aiResponse.description,
        schema: aiResponse.prismaCode,
        routes: aiResponse.routes,
        validations: aiResponse.validations,
        relationships: aiResponse.relationships,
        indexes: aiResponse.indexes,
        generatedBy: body.useFallback ? "fallback" : "openrouter",
        aiModel: body.useFallback ? null : "google/gemini-2.0-flash-lite",
        aiPrompt: JSON.stringify(body),
      },
    });

    // Retourner la réponse
    return NextResponse.json(
      {
        success: true,
        module: moduleDefinition,
        warnings: validation.warnings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la génération du module:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
