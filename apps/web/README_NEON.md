# Configuration Neon Database

## Vue d'ensemble

Ce projet utilise **Neon PostgreSQL** pour la base de données. Neon offre deux modes de connexion :

- **WebSocket (port 443)** - Pour les environnements serverless (Vercel, etc.)
- **PostgreSQL standard (port 5432)** - Pour le développement local et certains environnements

## Types de connexion Neon

### 1. Connexion Pooled (recommandée)

**URL Pooled :** `postgresql://user:pass@host-pooler.neon.tech/db`
- ✅ Utilise le pooler de connexions (PgBouncer)
- ✅ Optimisé pour les connexions courtes (serverless)
- ✅ Supporte WebSocket (port 443) ET port 5432

### 2. Connexion Direct (non-pooled)

**URL Direct :** `postgresql://user:pass@host.neon.tech/db`
- ✅ Connexion directe à PostgreSQL
- ⚠️ Peut ne pas être disponible sur tous les plans Neon
- ⚠️ Azure Neon : Port 5432 souvent **non accessible**

## Configuration selon votre environnement

### Environnement A : Port 5432 DISPONIBLE

Si vous avez accès au port 5432 (connexion direct ou pooler avec port 5432), Prisma CLI fonctionne normalement.

**Configuration .env :**
```env
# Connexion pooled avec port 5432 accessible
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require

# OU connexion directe (si disponible)
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
```

**Prisma Client :**
```typescript
// lib/prisma.ts - Fonctionne en dev ET production
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

**Commandes Prisma disponibles :**
```bash
npx prisma migrate dev     # ✅ Fonctionne
npx prisma db pull         # ✅ Fonctionne
npx prisma db push         # ✅ Fonctionne
npx prisma studio          # ✅ Fonctionne
npx prisma generate        # ✅ Fonctionne
```

### Environnement B : Port 5432 NON DISPONIBLE (WebSocket uniquement)

Si seul le port 443 (WebSocket) est accessible (cas Azure Neon), Prisma CLI ne fonctionne pas.

**Configuration .env :**
```env
# Connexion pooled - WebSocket uniquement (port 443)
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require
```

**Prisma Client pour production :**
```typescript
// lib/prisma-neon.ts - Avec adapter WebSocket
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })
```

**Scripts alternatifs requis :**
```bash
npm run db:query "SQL"     # Exécuter SQL
npm run db:sync            # Vérifier schéma
npm run db:migrate file    # Appliquer migration SQL
npx prisma generate        # ✅ Fonctionne (local)
```

## Comment vérifier votre environnement

### Test de connexion port 5432

```bash
# Tester si le port 5432 est accessible
npm run db:query "SELECT version()"
```

Si ça fonctionne ✅ : Vous êtes dans **Environnement A** (port 5432 disponible)

Si erreur "Can't reach port 5432" ❌ : Vous êtes dans **Environnement B** (WebSocket uniquement)

### Identifier votre type de connexion Neon

Regardez votre URL de connexion :

```env
# Pooled - peut supporter les deux modes
postgresql://...@ep-xxx-pooler.neon.tech/db

# Direct - généralement port 5432
postgresql://...@ep-xxx.neon.tech/db
```

## Configuration

### Variables d'environnement

**Pour environnement avec port 5432 :**
```env
# apps/web/.env
DATABASE_URL=postgresql://user:password@host-pooler.neon.tech/dbname?sslmode=require
```

**Pour environnement WebSocket uniquement (port 443) :**
```env
# apps/web/.env
DATABASE_URL=postgresql://user:password@host-pooler.neon.tech/dbname?sslmode=require
# Note: Même URL, mais comportement différent selon disponibilité du port
```

### Prisma Client selon environnement

**Environnement A (port 5432 disponible) :**

```typescript
// lib/prisma.ts - Configuration simple
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Utilisable partout
export default prisma
```

**Environnement B (WebSocket uniquement) :**

```typescript
// lib/prisma.ts - Pour développement (limité)
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// lib/prisma-neon.ts - Pour production (WebSocket)
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })
```

## Scripts disponibles

### Si port 5432 disponible (Environnement A)

```bash
# Toutes les commandes Prisma fonctionnent
npx prisma migrate dev       # Créer et appliquer migrations
npx prisma db pull           # Synchroniser schema depuis DB
npx prisma db push           # Pousser schema vers DB
npx prisma studio            # Interface graphique
npx prisma generate          # Générer client

# Scripts personnalisés (optionnels)
npm run db:query "SQL"       # Exécuter requête SQL directe
```

### Si WebSocket uniquement (Environnement B)

```bash
# Scripts personnalisés (requis)
npm run db:query "SQL"       # Exécuter requête SQL
npm run db:sync              # Vérifier le schéma
npm run db:migrate file.sql  # Appliquer migration SQL manuelle

# Prisma limité
npx prisma generate          # ✅ Fonctionne (génération locale)
npx prisma migrate dev       # ❌ Erreur P1001
npx prisma db pull           # ❌ Erreur P1001
npx prisma studio            # ❌ Erreur P1001
```

## Limitations importantes

### ❌ Prisma CLI ne fonctionne PAS

Les commandes suivantes **ne fonctionnent pas** avec Neon Azure (WebSocket uniquement) :

```bash
npx prisma migrate dev    # ❌ Erreur P1001
npx prisma db pull        # ❌ Erreur P1001  
npx prisma db push        # ❌ Erreur P1001
```

**Raison :** Neon Azure n'expose que le port 443 (WebSocket), pas le port 5432 (PostgreSQL standard).

### ✅ Solutions alternatives

**1. Migrations SQL manuelles**
```bash
# Créer un fichier SQL
cat > migrations/001_add_field.sql << 'EOF'
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
EOF

# Appliquer la migration
npm run db:migrate migrations/001_add_field.sql
```

**2. Utiliser Neon Console**
- Modifier le schéma via l'interface web de Neon

**3. PostgreSQL local pour développement**
```bash
# Docker Compose
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:16

# Utiliser DATABASE_URL local pour les migrations
DATABASE_URL=postgresql://postgres:dev@localhost:5432/app npx prisma migrate dev
```

## Déploiement Production

### Vercel / Edge Runtime

```typescript
// app/api/users/route.ts
import prisma from '@/lib/prisma-neon'

export async function GET() {
  const users = await prisma.user.findMany()
  return Response.json(users)
}
```

### Variables d'environnement Vercel

Ajouter dans les paramètres du projet Vercel :
- `DATABASE_URL` : Votre URL de connexion Neon poolée

## Scripts personnalisés

Les scripts de développement sont dans `scripts/` :

- **db-query.ts** - Exécution de requêtes SQL via Neon Serverless
- **sync-schema.ts** - Vérification du schéma actuel
- **apply-migration.ts** - Application de migrations SQL

Exemple d'utilisation :

```typescript
// scripts/db-query.ts
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
const result = await client.query('SELECT * FROM "User"')
```

## Troubleshooting

### Erreur: Can't reach database server at port 5432

**Solution :** Utiliser les scripts npm (`npm run db:*`) au lieu de Prisma CLI.

### Erreur: No database host or connection string

**Solution :** Vérifier que `.env` contient `DATABASE_URL` sans guillemets.

### Prisma Studio ne se lance pas

**Solution :** Prisma Studio utilise le même driver que CLI, il peut ne pas fonctionner. Utiliser Neon Console à la place.

## Ressources

- [Documentation Neon](https://neon.tech/docs)
- [Prisma avec Neon](https://www.prisma.io/docs/guides/database/neon)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
