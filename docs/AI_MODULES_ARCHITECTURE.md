# Architecture Modules IA - AI-Powered Canvas

## Vue d'ensemble

Sifaka CMS v0.3.0+ implémente un système d'architecture modulaire basée sur l'IA où chaque projet fonctionne comme un **canvas IA** permettant de créer et personnaliser dynamiquement des modules de gestion de données.

### Concept principal

```
┌─────────────────────────────────────────────────────────┐
│                    PROJECT (Canvas IA)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Module IA  │  │   Module IA  │  │   Module IA  │  │
│  │  (Généré)    │  │  (Généré)    │  │  (Généré)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                 ↓                  ↓            │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Schéma Prisma Dynamique (Généré par IA)      │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Routes API Dynamiques (Généré par IA)        │  │
│  │    - GET/POST/PATCH/DELETE pour chaque module   │  │
│  └──────────────────────────────────────────────────┘  │
│         ↓                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Base de Données Neon (PostgreSQL)            │  │
│  │    - Tables générées dynamiquement               │  │
│  │    - Relations gérées par Prisma                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Fonctionnement

### 1. Création d'un projet

```bash
L'utilisateur crée un projet dans l'UI
        ↓
Spécifie le modèle de données (structure JSON)
        ↓
Envoie à l'IA (OpenRouter)
        ↓
L'IA génère :
  - Schéma Prisma adapté
  - Relations entre modules
  - Routes API CRUD
  - Validations
        ↓
Sauvegardé en base de données
        ↓
Routes IA applicables immédiatement
```

### 2. Modèle de données immuable (Core)

Les fonctionnalités essentielles sont **immuables** et ne peuvent pas être modifiées par l'IA :

```typescript
// Immuable - Cœur de Sifaka
interface ProjectCore {
  id: string              // CUID
  name: string            // Non modifiable par IA
  slug: string            // Non modifiable par IA
  type: ProjectType       // ECOMMERCE | BLOG | PORTFOLIO | LANDING | CUSTOM
  status: ProjectStatus   // ACTIVE | DRAFT | ARCHIVED
  ownerId: string         // Lien utilisateur immuable
  createdAt: DateTime     // Immuable
  updatedAt: DateTime     // Immuable
}

// Modifiable par IA
interface ProjectModules {
  modules: ModuleDefinition[] // Défini par l'IA
  schema: PrismaSchema        // Généré par l'IA
  routes: RouteDefinition[]   // Généré par l'IA
  permissions: Permission[]   // Généré par l'IA (optionnel)
}
```

### 3. Exemple : Création d'un e-commerce

**Input utilisateur** :
```json
{
  "projectName": "Ma Boutique",
  "projectType": "ECOMMERCE",
  "dataModel": {
    "modules": [
      {
        "name": "Produits",
        "fields": [
          { "name": "sku", "type": "string", "required": true },
          { "name": "prix", "type": "float", "required": true },
          { "name": "stock", "type": "int", "required": true },
          { "name": "images", "type": "relation", "target": "Media" }
        ]
      },
      {
        "name": "Commandes",
        "fields": [
          { "name": "numero", "type": "string", "unique": true },
          { "name": "produits", "type": "relation", "target": "Produits" },
          { "name": "statut", "type": "enum", "values": ["en attente", "expédiée", "livrée"] },
          { "name": "total", "type": "float" }
        ]
      }
    ]
  }
}
```

**L'IA génère** :

```prisma
// Schéma Prisma (Généré)
model Produit {
  id          String    @id @default(cuid())
  sku         String    @unique
  nom         String
  prix        Float
  stock       Int
  projectId   String    // IMMUABLE - Isolement par projet
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  commandes   Commande[] // Relation générée
  medias      Media[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([projectId])
}

model Commande {
  id          String    @id @default(cuid())
  numero      String    @unique
  projectId   String    // IMMUABLE
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  produits    Produit[]
  statut      CommandeStatut
  total       Float
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([projectId])
}

enum CommandeStatut {
  EN_ATTENTE
  EXPEDIEE
  LIVREE
}
```

**Routes API générées** :

```typescript
// GET /api/projects/[slug]/produits
// POST /api/projects/[slug]/produits
// GET /api/projects/[slug]/produits/[id]
// PATCH /api/projects/[slug]/produits/[id]
// DELETE /api/projects/[slug]/produits/[id]

// GET /api/projects/[slug]/commandes
// POST /api/projects/[slug]/commandes
// GET /api/projects/[slug]/commandes/[id]
// PATCH /api/projects/[slug]/commandes/[id]
// DELETE /api/projects/[slug]/commandes/[id]
```

## Architecture des données

### Structure du projet avec modules IA

```sql
-- Table Core (Immuable)
CREATE TABLE "Project" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);

-- Nouvelle table : Définitions des modules IA
CREATE TABLE "ProjectModuleDefinition" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  
  -- Configuration immuable
  "moduleName" TEXT NOT NULL,           -- "Produits", "Commandes", etc.
  "displayName" TEXT,                   -- "Produits e-commerce"
  "description" TEXT,
  
  -- Schéma généré par l'IA (JSON)
  "schema" JSONB NOT NULL,              -- { fields, relations, validations }
  
  -- Routes disponibles
  "routes" JSONB,                       -- { GET, POST, PATCH, DELETE, ... }
  
  -- Permissions optionnelles (générées par l'IA)
  "permissions" JSONB,                  -- { roles, actions }
  
  -- Métadonnées IA
  "generatedBy" TEXT,                   -- "openrouter", "anthropic", etc.
  "aiModel" TEXT,                       -- Le modèle IA utilisé
  "aiPrompt" TEXT,                      -- Prompt original
  
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_module_per_project UNIQUE("projectId", "moduleName")
);

-- Table : Données dynamiques des modules
-- Exemple pour "Produits"
CREATE TABLE "Produit" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
  
  -- Champs générés par l'IA
  "sku" TEXT,
  "nom" TEXT,
  "prix" FLOAT,
  "stock" INT,
  
  -- Métadonnées
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP,
  
  @@index(projectId)
);
```

## Flux de création de module

### 1. Appel IA initial

```typescript
// POST /api/projects/[slug]/generate-module
{
  "moduleName": "Produits",
  "description": "Gestion des produits avec SKU, prix et stock",
  "requirements": {
    "fields": [...],
    "relationships": [...]
  }
}
```

### 2. Appel OpenRouter

```typescript
const prompt = `
Tu es un expert en modélisation de données Prisma.
Le projet utilise PostgreSQL via Neon et Prisma ORM.

Contexte :
- Tous les modèles DOIVENT avoir "projectId" pour l'isolement multi-tenant
- Les clés primaires DOIVENT être des CUID
- Les timestamps DOIVENT être inclus (createdAt, updatedAt)
- Les relations CASCADE sur projectId sont immuables

Demande :
Génère un modèle Prisma pour : ${moduleName}
Description : ${description}
Champs requis : ${JSON.stringify(requirements.fields)}
Relations : ${JSON.stringify(requirements.relationships)}

Réponse DOIT être :
1. Un bloc Prisma valide
2. Avec relations vers d'autres modules si nécessaire
3. Avec validations appropriées
4. Commentées explicitement

Format de réponse JSON:
{
  "prismaCode": "... code Prisma ...",
  "routes": { "GET": true, "POST": true, ... },
  "validations": { ... },
  "relationships": [ ... ]
}
`;

const response = await openRouterAPI.call({
  model: "gpt-3.5-turbo", // ou autre modèle gratuit
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
});
```

### 3. Sauvegarde et activation

```typescript
// 1. Sauvegarder la définition du module
await prisma.projectModuleDefinition.create({
  data: {
    projectId: project.id,
    moduleName: response.moduleName,
    schema: response.prismaCode,
    routes: response.routes,
    generatedBy: "openrouter",
    aiModel: "gpt-3.5-turbo",
    aiPrompt: prompt,
  }
});

// 2. Appliquer le schéma Prisma
// (Sera fait via migration ou appel direct Neon)

// 3. Générer les routes API
// (Routes créées dynamiquement dans un middleware)
```

## Contraintes immuables

Certains éléments **NE PEUVENT PAS** être générés ou modifiés par l'IA :

```typescript
// ❌ L'IA ne peut PAS modifier :
const IMMUTABLE_FIELDS = {
  // Cœur du projet
  "Project.id": "CUID auto",
  "Project.slug": "Défini à la création",
  "Project.ownerId": "Défini à la création",
  "Project.type": "Défini à la création",
  "Project.createdAt": "Auto-timestamp",
  "Project.updatedAt": "Auto-timestamp",
  
  // Isolement multi-tenant
  "*.projectId": "CUID du projet",
  "*.projectId relation": "CASCADE DELETE immuable",
  
  // Identité
  "*.id": "CUID auto",
  "*.createdAt": "Auto-timestamp",
  "*.updatedAt": "Auto-timestamp",
};

// ✅ L'IA CAN générer/modifier :
const AI_CUSTOMIZABLE = {
  // Champs métier
  "Product.sku": "String",
  "Product.name": "String",
  "Product.price": "Float",
  
  // Relations métier
  "Product -> Category": "Relations de gestion",
  "Order -> Product": "Relations de gestion",
  
  // Validations
  "Product.price": "Min 0, required",
  
  // Routes optionnelles
  "GET /search": "Endpoints custom",
  "POST /bulk-import": "Endpoints custom",
  
  // Permissions par rôle
  "ADMIN can delete": "Règles métier",
};
```

## Exemple : Modification d'un module existant

```typescript
// PATCH /api/projects/[slug]/modules/[moduleName]
{
  "action": "add_field",
  "field": {
    "name": "description",
    "type": "text",
    "required": false
  }
}
```

**L'IA génère** :
```prisma
// Modification seulement du module concerné
model Product {
  // ... champs existants ...
  description String? // NOUVEAU
  
  // projectId et relations immuables conservées
}
```

**Migration appliquée** :
```sql
ALTER TABLE "Product" ADD COLUMN "description" TEXT;
```

## Routes dynamiques générées

### Pour chaque module créé par l'IA

```typescript
// Auto-générées dans [projectSlug]/[moduleName]/
GET    /api/projects/[slug]/[moduleName]
GET    /api/projects/[slug]/[moduleName]/[id]
POST   /api/projects/[slug]/[moduleName]
PATCH  /api/projects/[slug]/[moduleName]/[id]
DELETE /api/projects/[slug]/[moduleName]/[id]

// Optionnelles (si générées)
GET    /api/projects/[slug]/[moduleName]/search?q=...
GET    /api/projects/[slug]/[moduleName]/analytics
POST   /api/projects/[slug]/[moduleName]/bulk-import
POST   /api/projects/[slug]/[moduleName]/export
```

### Implémentation d'une route générique

```typescript
// app/api/projects/[slug]/[moduleName]/route.ts
export async function GET(request: NextRequest, { params }) {
  const { slug, moduleName } = await params;
  
  const session = await auth();
  const project = await getProject(slug, session);
  
  // Charger la définition du module
  const moduleDefinition = await prisma.projectModuleDefinition.findUnique({
    where: {
      projectId_moduleName: {
        projectId: project.id,
        moduleName
      }
    }
  });
  
  // Charger les données dynamiquement
  // Utiliser Prisma avec le schéma généré
  const tableName = toCamelCase(moduleName);
  const data = await prisma[tableName].findMany({
    where: { projectId: project.id }
  });
  
  return NextResponse.json(data);
}
```

## Sécurité et isolation

### Isolement par projet

```typescript
// Toujours filtrer par projectId
const products = await prisma.product.findMany({
  where: {
    projectId: session.project.id  // ← Obligatoire
  }
});

// Si pas de projectId, erreur
if (!data.projectId === session.project.id) {
  throw new Error("Access denied");
}
```

### Validation des modifications

```typescript
// L'IA ne peut modifier que les champs "customizable"
const canModify = (fieldName: string) => {
  return !IMMUTABLE_FIELDS.includes(fieldName);
};

// Avant d'appliquer une migration :
const migration = parseAIGenerated(schema);
migration.changes.forEach(change => {
  if (!canModify(change.field)) {
    throw new Error(`Cannot modify immutable field: ${change.field}`);
  }
});
```

## Versioning des modules

```prisma
model ProjectModuleVersion {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  moduleName      String
  version         Int      // v1, v2, v3...
  schema          JSONB    // Schéma à cette version
  
  previousVersion Int?
  nextVersion     Int?
  
  createdAt       DateTime @default(now())
  
  @@unique([projectId, moduleName, version])
}
```

## Flux complet d'utilisation

```
1. Utilisateur crée un projet
   └─ Spécifie le type (ECOMMERCE, BLOG, etc.)

2. Utilisateur définit modèle de données
   └─ "Je veux des Produits avec SKU, Prix, Stock"
   └─ "Et des Commandes liées aux Produits"

3. Envoie à l'IA via OpenRouter
   └─ Contexte : schéma immuable
   └─ Demande : générer modèle Prisma
   └─ L'IA ajoute projectId + relations

4. Système valide la réponse IA
   └─ Vérifie projectId présent
   └─ Vérifie pas de modification immuable
   └─ Vérifie relations valides

5. Sauvegarde configuration
   └─ Stocke défnition module
   └─ Applique migration DB
   └─ Génère routes API

6. Utilisateur utilise les routes
   └─ GET /api/projects/ma-boutique/produits
   └─ POST /api/projects/ma-boutique/commandes
   └─ etc.

7. Modification ultérieure
   └─ Ajouter champ "description" à Produit
   └─ L'IA génère migration (seulement champs perso)
   └─ Système applique (projectId conservé)
```

## Intégration avec les modules existants

Les modules existants (Projects, Users, etc.) restent **immuables** :

```typescript
// ✅ Ces routes restent immuables
GET  /api/users
GET  /api/users/[userId]
PATCH /api/users/[userId]
DELETE /api/users/[userId]

GET  /api/projects
POST /api/projects
GET  /api/projects/[slug]
PATCH /api/projects/[slug]
DELETE /api/projects/[slug]

// ✨ Ces routes sont générées dynamiquement par l'IA
GET  /api/projects/[slug]/produits          // Module généré
POST /api/projects/[slug]/produits
GET  /api/projects/[slug]/produits/[id]
PATCH /api/projects/[slug]/produits/[id]
DELETE /api/projects/[slug]/produits/[id]

GET  /api/projects/[slug]/commandes         // Module généré
POST /api/projects/[slug]/commandes
// etc.
```

## Performance et limitations

### Limitations actuelles

- **Max 50 modules par projet** (limite Prisma)
- **Max 200 champs par module** (limite PostgreSQL)
- **Max 10 relations par module** (complexité)

### Optimisations

- Cache du schéma généré (Redis)
- Lazy loading des définitions de module
- Pagination automatique des données
- Indexes générés automatiquement sur projectId

## Améliorations futures (v0.4.0+)

- [ ] UI visuelle pour créer modules (Drag & drop)
- [ ] Prévisualisation avant génération IA
- [ ] Rollback de version de module
- [ ] Synchronisation multi-projets
- [ ] Webhooks sur changements de schéma
- [ ] Validation en temps réel lors de la génération

---

**Version** : 0.3.0 (Planification)  
**Statut** : En design  
**Prochaine révision** : Après v0.2.0 multi-tenant
