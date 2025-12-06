# Scripts de développement Neon

Ce dossier contient des scripts utilitaires pour gérer la base de données Neon via WebSocket (port 443).

## Scripts disponibles

### db-query.ts
Exécute des requêtes SQL directement sur la base Neon.

**Usage:**
```bash
npm run db:query "SELECT * FROM \"User\" LIMIT 5"
npm run db:query "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'admin@example.com'"
```

### sync-schema.ts
Vérifie le schéma actuel de la base de données et liste toutes les tables.

**Usage:**
```bash
npm run db:sync
```

### apply-migration.ts
Applique une migration SQL à partir d'un fichier.

**Usage:**
```bash
# Créer un fichier de migration
cat > migrations/001_add_field.sql << 'SQL'
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
SQL

# Appliquer la migration
npm run db:migrate migrations/001_add_field.sql
```

## Pourquoi ces scripts ?

Neon Azure utilise uniquement des connexions WebSocket (port 443), ce qui rend Prisma CLI (`migrate`, `db pull`, `push`) incompatible. Ces scripts utilisent `@neondatabase/serverless` pour contourner cette limitation.

## Environnement requis

- Node.js 20+
- Variable d'environnement `DATABASE_URL` configurée
- Packages installés: `@neondatabase/serverless`, `dotenv`, `ws`
