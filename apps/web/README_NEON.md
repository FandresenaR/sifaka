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

// lib/prisma.ts - Configuration unifiée (Dev & Prod)
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configuration WebSocket pour Neon
neonConfig.webSocketConstructor = ws
const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

const prisma = new PrismaClient({ adapter })

export default prisma
```

**Note :** Cette configuration fonctionne désormais pour **tous les environnements** (Dev avec port bloqué, Prod, Vercel Edge). Plus besoin de fichiers séparés.

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

## Workflow de développement

### Avec port 5432 (Recommandé)

```bash
# 1. Modifier le schema Prisma
# prisma/schema.prisma

# 2. Créer une migration
npx prisma migrate dev --name add_user_phone

# 3. Le client est régénéré automatiquement

# 4. Utiliser dans le code
import prisma from '@/lib/prisma'
const users = await prisma.user.findMany()
```

### Sans port 5432 (WebSocket uniquement)

```bash
# 1. Modifier le schema Prisma
# prisma/schema.prisma

# 2. Créer le SQL de migration manuellement
cat > migrations/001_add_phone.sql << 'EOF'
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
EOF

# 3. Appliquer la migration
npm run db:migrate migrations/001_add_phone.sql

# 4. Régénérer le client Prisma
npx prisma generate

# 5. Utiliser dans le code (production)
import prisma from '@/lib/prisma-neon'
const users = await prisma.user.findMany()
```

## Limitations et solutions

### Port 5432 disponible

✅ **Aucune limitation** - Workflow Prisma standard
- Toutes les commandes CLI fonctionnent
- Migrations automatiques
- Prisma Studio disponible

### WebSocket uniquement (port 443)

❌ **Limitations :**
- Prisma CLI ne fonctionne pas (`migrate`, `db pull`, `push`, `studio`)
- Migrations manuelles requises

✅ **Solutions :**
1. **Migrations SQL manuelles** (voir scripts)
2. **PostgreSQL local pour dev** + Neon pour production
3. **Neon Console** pour modifications de schéma
4. **Prisma Studio local** avec PostgreSQL Docker

## Déploiement Production

### Vercel / Edge Runtime

**Port 5432 disponible :**
```typescript
// Simple, utilise lib/prisma.ts partout
import prisma from '@/lib/prisma'
```

**WebSocket uniquement :**
```typescript
// Utilise lib/prisma-neon.ts pour les API routes
import prisma from '@/lib/prisma-neon'

export async function GET() {
  const users = await prisma.user.findMany()
  return Response.json(users)
}
```

### Variables d'environnement Vercel

```env
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

## Scripts personnalisés (WebSocket uniquement)

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

**Diagnostic :**
```bash
npm run db:query "SELECT 1"
```

**Si ça fonctionne :**
- Vous avez accès WebSocket (port 443) ✅
- Prisma CLI ne fonctionne pas ❌
- **Solution :** Utiliser scripts npm (`db:*`) et `lib/prisma-neon.ts`

**Si ça ne fonctionne pas :**
- Vérifier `DATABASE_URL` dans `.env`
- Vérifier les credentials Neon
- Tester depuis Neon Console

### Erreur: No database host or connection string

**Solution :** Vérifier que `.env` contient `DATABASE_URL` sans guillemets :
```env
# ✅ Correct
DATABASE_URL=postgresql://...

# ❌ Incorrect
DATABASE_URL="postgresql://..."
```

### Comment savoir si j'ai le port 5432 ?

**Test simple :**
```bash
npx prisma db pull
```

- ✅ **Succès** → Port 5432 disponible (Environnement A)
- ❌ **Erreur P1001** → WebSocket uniquement (Environnement B)

### Prisma Studio ne se lance pas

**Environnement A (port 5432) :**
```bash
npx prisma studio  # ✅ Devrait fonctionner
```

**Environnement B (WebSocket) :**
```bash
# Prisma Studio ne fonctionne pas
# Alternatives :
# 1. Neon Console (web interface)
# 2. PostgreSQL local + Studio
# 3. Scripts SQL personnalisés
npm run db:query "SELECT * FROM \"User\""
```

## Migration d'un environnement à l'autre

### De port 5432 vers WebSocket uniquement

1. Installer les dépendances :
```bash
npm install @neondatabase/serverless @prisma/adapter-neon ws
```

2. Créer `lib/prisma-neon.ts` (voir ci-dessus)

3. Utiliser dans les API routes :
```typescript
import prisma from '@/lib/prisma-neon'
```

### De WebSocket vers port 5432

1. Vérifier la disponibilité :
```bash
npx prisma db pull
```

2. Si ça fonctionne, simplifier :
```typescript
// Utiliser lib/prisma.ts partout
import prisma from '@/lib/prisma'
```

3. Supprimer les dépendances (optionnel) :
```bash
npm uninstall @neondatabase/serverless @prisma/adapter-neon ws
```

## Ressources

- [Documentation Neon](https://neon.tech/docs)
- [Prisma avec Neon](https://www.prisma.io/docs/guides/database/neon)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
