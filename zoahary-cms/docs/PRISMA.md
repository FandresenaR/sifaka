# Documentation Prisma

## Vue d'ensemble

Ce projet utilise Prisma ORM pour gérer la base de données PostgreSQL hébergée sur Neon.

## Configuration

### Variables d'environnement

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

La `DATABASE_URL` doit pointer vers votre base de données Neon PostgreSQL.

## Schéma de base de données

### Modèles

#### User
Table principale des utilisateurs avec support 2FA.

```prisma
model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String    @unique
  emailVerified         DateTime?
  image                 String?
  password              String?
  role                  Role      @default(USER)
  
  // 2FA fields
  twoFactorSecret       String?
  twoFactorEnabled      Boolean   @default(false)
  twoFactorBackupCodes  String[]  @default([])
  
  accounts              Account[]
  sessions              Session[]
  products              Product[]
  blogPosts             BlogPost[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

#### Account
Gère les comptes OAuth (Google).

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

#### Session
Sessions NextAuth.

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Product
Catalogue de produits.

```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String   @db.Text
  price       Float
  images      String[]
  category    String
  inStock     Boolean  @default(true)
  featured    Boolean  @default(false)
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([slug])
  @@index([category])
}
```

#### BlogPost
Articles de blog.

```prisma
model BlogPost {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  excerpt     String?
  coverImage  String?
  published   Boolean  @default(false)
  tags        String[]
  
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  
  @@index([slug])
  @@index([published])
}
```

#### Enum Role
```prisma
enum Role {
  USER
  ADMIN
  EDITOR
}
```

## Commandes Prisma

### Développement

#### Générer le client Prisma
```bash
npx prisma generate
```
Génère le client Prisma TypeScript à partir du schéma.

#### Créer une migration
```bash
npx prisma migrate dev --name description_du_changement
```
Crée une nouvelle migration et l'applique à la base de données locale.

#### Appliquer les migrations
```bash
npx prisma migrate dev
```
Applique toutes les migrations en attente.

#### Synchroniser le schéma (prototypage)
```bash
npx prisma db push
```
⚠️ **Attention :** À utiliser uniquement en développement. Ne crée pas de fichiers de migration.

#### Ouvrir Prisma Studio
```bash
npx prisma studio
```
Interface graphique pour explorer et modifier les données (http://localhost:5555).

#### Réinitialiser la base de données
```bash
npx prisma migrate reset
```
⚠️ **Attention :** Supprime toutes les données et réapplique toutes les migrations.

### Production

#### Déployer les migrations
```bash
npx prisma migrate deploy
```
Applique uniquement les migrations non encore exécutées. **À utiliser en production.**

#### Vérifier le statut des migrations
```bash
npx prisma migrate status
```
Affiche l'état des migrations (appliquées, en attente).

## Scripts npm

Dans `package.json`, nous avons configuré ces scripts :

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

### Utilisation

```bash
# Développement
npm run migrate:dev -- --name add_new_field
npm run db:studio

# Production (automatique lors du build)
npm run build

# Production (manuel)
npm run migrate:deploy
```

## Workflow de développement

### 1. Modifier le schéma

Éditez `prisma/schema.prisma` :

```prisma
model Product {
  // ... champs existants
  newField String? // Nouveau champ
}
```

### 2. Créer une migration

```bash
npx prisma migrate dev --name add_product_new_field
```

Cette commande :
- ✅ Crée un fichier SQL dans `prisma/migrations/`
- ✅ Applique la migration à votre base de données
- ✅ Régénère le client Prisma

### 3. Vérifier la migration

```bash
npx prisma studio
```

Ouvrez Prisma Studio pour vérifier que le champ a été ajouté.

### 4. Commit et push

```bash
git add .
git commit -m "feat: add new field to Product model"
git push
```

### 5. Déploiement automatique

Lors du déploiement sur Vercel/production :
1. `prisma generate` → Génère le client
2. `prisma migrate deploy` → Applique les nouvelles migrations
3. `next build` → Build l'application

## Historique des migrations

### 20251107083625_init
**Date :** 7 novembre 2025  
**Description :** Migration initiale

**Tables créées :**
- User (avec 2FA)
- Account (OAuth)
- Session (NextAuth)
- VerificationToken
- Product
- BlogPost

**Enums :**
- Role (USER, ADMIN, EDITOR)

## Vérification en production

Après un déploiement, vérifiez les logs Vercel :

```
✔ Generated Prisma Client (v6.19.0)
Datasource "db": PostgreSQL database "neondb"
1 migration found in prisma/migrations
No pending migrations to apply. ✅
```

**"No pending migrations"** signifie que toutes les migrations sont appliquées avec succès.

## Utilisation du client Prisma

### Importer le client

```typescript
import { prisma } from "@/lib/prisma";
```

### Exemples de requêtes

#### Créer un utilisateur
```typescript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
    role: "USER",
  },
});
```

#### Trouver un utilisateur
```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: {
    accounts: true,
    products: true,
  },
});
```

#### Mettre à jour un produit
```typescript
const product = await prisma.product.update({
  where: { id: "product_id" },
  data: {
    price: 29.99,
    inStock: true,
  },
});
```

#### Créer un article de blog
```typescript
const post = await prisma.blogPost.create({
  data: {
    title: "Mon article",
    slug: "mon-article",
    content: "Contenu de l'article...",
    published: true,
    authorId: user.id,
    tags: ["tech", "web"],
  },
});
```

#### Requête complexe
```typescript
const products = await prisma.product.findMany({
  where: {
    category: "electronics",
    inStock: true,
    price: {
      lte: 100,
    },
  },
  include: {
    author: {
      select: {
        name: true,
        email: true,
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 10,
});
```

## Bonnes pratiques

### ✅ À faire

1. **Toujours créer des migrations** pour les changements de schéma
2. **Tester les migrations localement** avant de pousser
3. **Versionner les migrations** dans Git
4. **Utiliser des transactions** pour les opérations critiques
5. **Fermer les connexions** dans les API routes

```typescript
// Exemple de transaction
await prisma.$transaction([
  prisma.product.update({ where: { id }, data: { inStock: false } }),
  prisma.order.create({ data: { productId: id, userId } }),
]);
```

### ❌ À éviter

1. **Ne jamais modifier une migration déjà appliquée**
2. **Ne pas utiliser `db push` en production**
3. **Ne pas supprimer le dossier `prisma/migrations/`**
4. **Ne pas commit les fichiers `.env`**
5. **Ne pas oublier d'inclure les relations** dans les requêtes

## Troubleshooting

### Erreur : "The table does not exist"

**Solution :**
```bash
npx prisma migrate deploy
```

### Erreur : "Client is not generated"

**Solution :**
```bash
npx prisma generate
```

### Erreur de permissions (Windows)

Si vous obtenez `EPERM: operation not permitted` :
1. Arrêtez le serveur Next.js
2. Exécutez `npx prisma generate`
3. Redémarrez le serveur

### Base de données désynchronisée

**Solution :**
```bash
npx prisma migrate reset  # ⚠️ Supprime toutes les données
npx prisma migrate dev
```

## Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Neon PostgreSQL](https://neon.tech/docs)
- [NextAuth + Prisma](https://authjs.dev/reference/adapter/prisma)

## Support

Pour toute question sur Prisma :
- Consultez la [documentation officielle](https://www.prisma.io/docs)
- Visitez le [Discord Prisma](https://pris.ly/discord)
- Vérifiez les [exemples NextAuth](https://authjs.dev/getting-started/adapters/prisma)
