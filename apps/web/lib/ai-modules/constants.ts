// Champs qui NE PEUVENT PAS être modifiés par l'IA
export const IMMUTABLE_PROJECT_FIELDS = [
  "Project.id",
  "Project.slug",
  "Project.ownerId",
  "Project.type",
  "Project.status",
  "Project.createdAt",
  "Project.updatedAt",
  "Project.name", // Défini à la création
] as const;

export const IMMUTABLE_MODULE_FIELDS = [
  "id",           // CUID auto-généré
  "projectId",    // Isolement multi-tenant
  "createdAt",    // Auto-timestamp
  "updatedAt",    // Auto-timestamp
] as const;

// Champs que l'IA CAN personnaliser
export const AI_CUSTOMIZABLE_PATTERNS = [
  /^[a-z]+_?[a-z]*$/i,  // Noms de champs en snake_case
  /^[A-Z][a-zA-Z]+$/,   // Noms de modèles en PascalCase
] as const;

// Types de champs autorisés
export const ALLOWED_FIELD_TYPES = [
  "String",
  "Int",
  "Float",
  "Boolean",
  "DateTime",
  "Json",
  "Decimal",
  "Bytes",
  // Relations
  "Relation",
  "Enum",
] as const;

// Modèles IA gratuits disponibles via OpenRouter
export const FREE_AI_MODELS = [
  "google/gemini-2.0-flash-lite",
  "mistral/mistral-7b-instruct",
  "meta-llama/llama-2-7b-chat-hf",
  "teknium/openhermes-2.5-mistral-7b",
  "openchat/openchat-3.5",
] as const;

// Configuration par défaut
export const AI_MODULE_CONFIG = {
  maxModulesPerProject: 50,
  maxFieldsPerModule: 200,
  maxRelationsPerModule: 10,
  defaultModel: "google/gemini-2.0-flash-lite",
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000, // 30 secondes
} as const;

// Patterns de validation
export const VALIDATION_PATTERNS = {
  moduleName: /^[A-Z][a-zA-Z0-9]*$/, // PascalCase
  fieldName: /^[a-z][a-zA-Z0-9]*$/, // camelCase
  tableName: /^[a-z][a-z0-9_]*$/,   // snake_case
} as const;

// Permissions par rôle utilisateur (implémentation future)
export const DEFAULT_ROLE_PERMISSIONS = {
  USER: {
    createModule: true,
    editModule: true,
    deleteModule: true,
    generateWithAI: true,
    modifySchema: true,
  },
  ADMIN: {
    createModule: true,
    editModule: true,
    deleteModule: true,
    generateWithAI: true,
    modifySchema: true,
    viewAllModules: true,
  },
  SUPER_ADMIN: {
    createModule: true,
    editModule: true,
    deleteModule: true,
    generateWithAI: true,
    modifySchema: true,
    viewAllModules: true,
    managePermissions: true,
    viewAIMetrics: true,
  },
} as const;
