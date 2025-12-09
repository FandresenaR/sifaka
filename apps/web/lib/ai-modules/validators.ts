import { IMMUTABLE_MODULE_FIELDS, VALIDATION_PATTERNS } from "./constants"

/**
 * Valide que l'IA ne modifie pas les champs immuables
 */
export function validateImmutableFields(schema: Record<string, any>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = [];

  // Vérifier que tous les champs immuables sont présents
  IMMUTABLE_MODULE_FIELDS.forEach((field) => {
    if (!schema[field]) {
      errors.push(`Champ immuable manquant: ${field}`);
    }
  });

  // Vérifier que projectId est une relation CASCADE
  if (schema.projectId) {
    if (!schema.projectId.relation || schema.projectId.relation !== "cascade") {
      errors.push("projectId DOIT avoir relation CASCADE sur delete");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les noms de champs et modèles
 */
export function validateNaming(moduleName: string, fields: Record<string, any>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = [];

  // Valider le nom du module (PascalCase)
  if (!VALIDATION_PATTERNS.moduleName.test(moduleName)) {
    errors.push(`Nom du module invalide: ${moduleName}. Utilisez PascalCase`);
  }

  // Valider les noms de champs (camelCase)
  Object.keys(fields).forEach((fieldName) => {
    if (IMMUTABLE_MODULE_FIELDS.includes(fieldName as any)) {
      return; // Les champs immuables peuvent être en n'importe quel format
    }

    if (!VALIDATION_PATTERNS.fieldName.test(fieldName)) {
      errors.push(
        `Nom de champ invalide: ${fieldName}. Utilisez camelCase`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les types de champs
 */
export function validateFieldTypes(
  fields: Record<string, any>,
  allowedTypes: string[]
): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = [];

  Object.entries(fields).forEach(([fieldName, fieldDef]) => {
    if (!fieldDef.type) {
      errors.push(`Champ ${fieldName}: type requis`);
      return;
    }

    if (!allowedTypes.includes(fieldDef.type)) {
      errors.push(
        `Champ ${fieldName}: type ${fieldDef.type} non autorisé. Types autorisés: ${allowedTypes.join(", ")}`
      );
    }

    // Valider les relations
    if (fieldDef.type === "Relation") {
      if (!fieldDef.target) {
        errors.push(`Champ ${fieldName}: relation doit spécifier un target`);
      }
      if (!fieldDef.relationName) {
        errors.push(`Champ ${fieldName}: relation doit spécifier un relationName`);
      }
    }

    // Valider les enums
    if (fieldDef.type === "Enum") {
      if (!Array.isArray(fieldDef.values) || fieldDef.values.length === 0) {
        errors.push(`Champ ${fieldName}: enum doit avoir au moins une valeur`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide les relations entre modules
 */
export function validateRelations(
  moduleName: string,
  fields: Record<string, any>,
  existingModules: string[]
): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = [];

  Object.entries(fields).forEach(([fieldName, fieldDef]) => {
    if (fieldDef.type === "Relation") {
      // Ne pas permettre les auto-références sauf si explicitement mentionné
      if (fieldDef.target === moduleName) {
        // Les auto-références sont autorisées (ex: categorie -> categorie parent)
        return;
      }

      // Vérifier que le module cible existe ou sera créé
      if (!existingModules.includes(fieldDef.target)) {
        // Avertissement au lieu d'erreur (le module peut être créé après)
        console.warn(
          `Module cible ${fieldDef.target} n'existe pas pour la relation ${fieldName}`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide un schéma Prisma généré
 */
export function validatePrismaSchema(schema: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = [];

  // Vérifier que c'est du code Prisma valide
  if (!schema.includes("model ") && !schema.includes("enum ")) {
    errors.push("Schéma doit contenir au moins un model ou enum");
  }

  // Vérifier la présence de projectId dans les modèles principaux
  const modelMatches = schema.match(/model\s+(\w+)\s*{/g);
  if (modelMatches) {
    modelMatches.forEach((match) => {
      const modelName = match.match(/model\s+(\w+)/)?.[1];
      if (modelName && modelName !== "ProjectModuleDefinition") {
        if (!schema.includes(`${modelName} {`) || !schema.includes(`projectId`)) {
          // Avertissement plutôt qu'erreur - projectId peut être ajouté automatiquement
          console.warn(`Model ${modelName} devrait avoir projectId pour l'isolement`);
        }
      }
    });
  }

  // Vérifier la syntaxe Prisma basique
  if (!schema.includes("@@") && !schema.includes("@id") && !schema.includes("@default")) {
    errors.push("Schéma Prisma invalide: manque de décorateurs ou annotations");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide la réponse complète de l'IA
 */
export interface AIModuleResponse {
  moduleName: string;
  displayName?: string;
  description?: string;
  prismaCode: string;
  routes?: Record<string, boolean>;
  validations?: Record<string, any>;
  relationships?: Array<{
    target: string;
    type: "one-to-many" | "many-to-one" | "many-to-many";
  }>;
}

export function validateAIResponse(
  response: AIModuleResponse,
  existingModules: string[]
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Valider le nom du module
  if (!response.moduleName) {
    errors.push("moduleName est requis");
  } else if (!VALIDATION_PATTERNS.moduleName.test(response.moduleName)) {
    errors.push(
      `moduleName invalide: ${response.moduleName}. Utilisez PascalCase`
    );
  }

  // Valider le schéma Prisma
  if (!response.prismaCode) {
    errors.push("prismaCode est requis");
  } else {
    const schemaValidation = validatePrismaSchema(response.prismaCode);
    if (!schemaValidation.valid) {
      errors.push(...schemaValidation.errors);
    }
  }

  // Valider les relations
  if (response.relationships && Array.isArray(response.relationships)) {
    response.relationships.forEach((rel) => {
      if (!rel.target) {
        errors.push("Relation doit avoir un target");
      }
      if (!["one-to-many", "many-to-one", "many-to-many"].includes(rel.type)) {
        errors.push(`Type de relation invalide: ${rel.type}`);
      }
    });
  }

  // Avertissements (non-bloquants)
  if (!response.displayName) {
    warnings.push("displayName non fourni, utilisera moduleName");
  }

  if (!response.routes) {
    warnings.push("routes non fournies, utilisant les routes CRUD par défaut");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
