# Migrations Prisma

Ce dossier contient l'historique des migrations de la base de données.

## ⚠️ Important

**NE PAS supprimer ce dossier !** Les migrations doivent être versionnées dans Git pour être appliquées en production.

## Structure

- `migration_lock.toml` - Fichier de verrouillage qui identifie le provider de base de données
- `YYYYMMDDHHMMSS_nom/` - Dossiers contenant les fichiers SQL de chaque migration

## Workflow

### Développement

Lors de la modification du schéma Prisma (`schema.prisma`), créez une nouvelle migration :

```bash
npx prisma migrate dev --name description_du_changement
```

Cette commande :
1. Crée un nouveau dossier de migration avec un fichier SQL
2. Applique la migration à votre base de données locale
3. Régénère le client Prisma

### Production

Les migrations sont appliquées automatiquement lors du build via :

```bash
npx prisma migrate deploy
```

Cette commande :
- Applique uniquement les migrations qui n'ont pas encore été exécutées
- Ne crée pas de nouvelles migrations
- Est safe pour la production

## Historique des migrations

### 20251107083625_init
**Date :** 7 novembre 2025  
**Description :** Migration initiale créant toutes les tables

**Tables créées :**
- `User` - Utilisateurs avec support 2FA
- `Account` - Comptes OAuth (Google)
- `Session` - Sessions NextAuth
- `VerificationToken` - Tokens de vérification
- `Product` - Catalogue de produits
- `BlogPost` - Articles de blog

**Enums créés :**
- `Role` - USER | ADMIN | EDITOR

## Commandes utiles

```bash
# Voir le statut des migrations
npx prisma migrate status

# Appliquer les migrations en production
npx prisma migrate deploy

# Créer une nouvelle migration (dev uniquement)
npx prisma migrate dev --name nom_de_la_migration

# Réinitialiser la base de données (⚠️ perte de données)
npx prisma migrate reset

# Ouvrir Prisma Studio pour voir les données
npx prisma studio
```

## Rollback

Si une migration pose problème en production :

1. Marquer la migration comme rolled back :
```bash
npx prisma migrate resolve --rolled-back "nom_de_la_migration"
```

2. Créer une nouvelle migration qui annule les changements

⚠️ **Ne jamais modifier ou supprimer une migration déjà appliquée en production !**

## Bonnes pratiques

✅ **À faire :**
- Versionner toutes les migrations dans Git
- Tester les migrations localement avant de pousser
- Utiliser des noms de migration descriptifs
- Faire des backups avant les migrations importantes

❌ **À ne pas faire :**
- Modifier une migration déjà appliquée
- Supprimer des migrations du dossier
- Utiliser `prisma db push` en production
- Oublier de commit les migrations
