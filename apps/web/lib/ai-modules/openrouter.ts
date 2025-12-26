import { AI_MODULE_CONFIG, FREE_AI_MODELS } from "./constants"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIModuleGenerationRequest {
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
  projectType?: "ECOMMERCE" | "BLOG" | "PORTFOLIO" | "LANDING" | "CUSTOM";
}

export interface AIModuleResponse {
  moduleName: string;
  displayName: string;
  description: string;
  prismaCode: string;
  routes: {
    GET: boolean;
    POST: boolean;
    PATCH: boolean;
    DELETE: boolean;
    SEARCH?: boolean;
    EXPORT?: boolean;
  };
  validations: Record<string, string>;
  relationships: Array<{
    target: string;
    type: "one-to-many" | "many-to-one" | "many-to-many";
  }>;
  indexes: string[];
}

/**
 * Génère un prompt système pour l'IA
 */
function getSystemPrompt(): string {
  return `Tu es un expert en modélisation de données avec Prisma et PostgreSQL.
Tu généres des schémas de données pour un CMS multi-tenant appelé Sifaka.

RÈGLES IMMUABLES - NE JAMAIS VIOLER :
1. TOUS les modèles DOIVENT avoir "projectId: String" pour l'isolement multi-tenant
2. TOUTES les relations sur projectId DOIVENT être "onDelete: Cascade"
3. Les IDs DOIVENT TOUJOURS être "id String @id @default(cuid())"
4. TOUS les modèles DOIVENT avoir "createdAt DateTime @default(now())" et "updatedAt DateTime @updatedAt"
5. Les noms de modèles doivent être en PascalCase
6. Les noms de champs doivent être en camelCase
7. Les valeurs d'énums doivent être en SCREAMING_SNAKE_CASE

DIRECTIVES DE QUALITÉ :
- Ajouter des commentaires explicites avant les relations complexes
- Ajouter des @@index([projectId]) pour la performance
- Ajouter des @@unique constraints si approprié
- Ajouter des validations (min, max, regex) si pertinent
- Générer des énums pour les champs avec des valeurs limitées

FORMAT DE RÉPONSE :
Réponds en JSON valide avec cette structure exacte:
{
  "moduleName": "NomDuModule",
  "displayName": "Nom affiché",
  "description": "Description courte",
  "prismaCode": "model Module { ... }",
  "routes": {
    "GET": true,
    "POST": true,
    "PATCH": true,
    "DELETE": true,
    "SEARCH": false
  },
  "validations": {
    "fieldName": "description de validation"
  },
  "relationships": [
    {
      "target": "OtherModule",
      "type": "one-to-many"
    }
  ],
  "indexes": [
    "@index([projectId])",
    "@unique([projectId, slug])"
  ]
}`;
}

/**
 * Crée le prompt utilisateur pour la génération de module
 */
function buildUserPrompt(request: AIModuleGenerationRequest): string {
  const fieldsDescription = request.fields
    .map(
      (f) =>
        `- ${f.name} (${f.type}${f.required ? ", requis" : ""}${f.unique ? ", unique" : ""})${f.description ? ": " + f.description : ""}`
    )
    .join("\n");

  const relationsDescription = request.relationships
    ? request.relationships
        .map((r) => `- Relation vers ${r.target} (${r.type})`)
        .join("\n")
    : "Aucune relation";

  return `
Génère un modèle Prisma pour le module suivant :

NOM : ${request.moduleName}
DESCRIPTION : ${request.description}
TYPE DE PROJET : ${request.projectType || "CUSTOM"}

CHAMPS DEMANDÉS :
${fieldsDescription}

RELATIONS :
${relationsDescription}

IMPORTANT :
- Ajouter projectId (String) pour l'isolement multi-tenant
- Ajouter créé/updatedAt automatiquement
- Générer un Prisma code complètement valide et prêt à être utilisé
- Inclure les validations appropriées
- Ajouter des commentaires explicatifs
- Si pertinent, créer des énums pour les champs de statut/type
`;
}

/**
 * Appelle OpenRouter pour générer un module
 */
export async function generateModuleWithAI(
  request: AIModuleGenerationRequest
): Promise<AIModuleResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY non configurée");
  }

  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: getSystemPrompt(),
    },
    {
      role: "user",
      content: buildUserPrompt(request),
    },
  ];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODULE_CONFIG.defaultModel,
        messages,
        temperature: AI_MODULE_CONFIG.temperature,
        max_tokens: AI_MODULE_CONFIG.maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenRouter API error: ${error.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parser la réponse JSON
    let parsedResponse: AIModuleResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (e) {
      // Si la réponse n'est pas du JSON pur, essayer d'extraire le JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Impossible de parser la réponse de l'IA");
      }
      parsedResponse = JSON.parse(jsonMatch[0]);
    }

    return parsedResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur lors de la génération du module IA: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fallback : générer un module simple sans IA (pour les tests)
 */
export function generateModuleFallback(
  request: AIModuleGenerationRequest
): AIModuleResponse {
  const fieldDefinitions = request.fields
    .map(
      (f) =>
        `  ${f.name}          ${f.type}${f.required ? "" : "?"}${f.unique ? " @unique" : ""}`
    )
    .join("\n");

  const prismaCode = `model ${request.moduleName} {
  id          String    @id @default(cuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

${fieldDefinitions}

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([projectId])
}`;

  return {
    moduleName: request.moduleName,
    displayName: request.moduleName,
    description: request.description,
    prismaCode,
    routes: {
      GET: true,
      POST: true,
      PATCH: true,
      DELETE: true,
    },
    validations: {},
    relationships: request.relationships || [],
    indexes: ["@@index([projectId])"],
  };
}
