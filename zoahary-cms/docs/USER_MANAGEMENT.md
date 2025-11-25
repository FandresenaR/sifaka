# Système de Gestion des Utilisateurs

## Vue d'ensemble

Le CMS Zoahary Baobab dispose d'un système complet de gestion des utilisateurs avec quatre niveaux de rôles et des permissions granulaires.

## Rôles

### 1. USER (Utilisateur)
- Rôle par défaut pour tout nouvel utilisateur
- Accès en lecture seule au site public
- Aucun accès à l'interface d'administration

### 2. EDITOR (Éditeur)
- Peut créer et modifier des articles de blog
- Peut éditer ses propres contenus
- Accès limité aux fonctionnalités d'administration

### 3. ADMIN (Administrateur)
- Gestion complète des produits et du blog
- Peut publier/dépublier des articles
- Peut créer, modifier et supprimer des produits
- Accès à toutes les fonctionnalités d'administration sauf la gestion des utilisateurs

### 4. SUPER_ADMIN (Super Administrateur)
- **Email unique** : `fandresenar6@gmail.com`
- Toutes les permissions des autres rôles
- Gestion des utilisateurs (attribution des rôles, suppression)
- Seul rôle ayant accès à `/admin/users`
- Ne peut pas être modifié ou supprimé

## Architecture

### Schéma de base de données

```prisma
enum Role {
  USER
  ADMIN
  EDITOR
  SUPER_ADMIN
}

model User {
  role Role @default(USER)
  // ... autres champs
}
```

### Système de permissions (RBAC)

Le fichier `src/lib/rbac.ts` contient toutes les fonctions de vérification des permissions :

```typescript
// Vérifier une permission spécifique
await checkPermission(Permission.MANAGE_USERS)

// Vérifier si super admin
await isSuperAdmin()

// Vérifier si admin (ADMIN ou SUPER_ADMIN)
await isAdmin()

// Exiger une permission (lance une erreur si non autorisé)
await requireSuperAdmin()
```

### Permissions disponibles

- **Gestion des utilisateurs** : `VIEW_USERS`, `MANAGE_USERS`, `MANAGE_ROLES`
- **Blog** : `VIEW_POSTS`, `CREATE_POST`, `EDIT_POST`, `DELETE_POST`, `PUBLISH_POST`
- **Produits** : `VIEW_PRODUCTS`, `CREATE_PRODUCT`, `EDIT_PRODUCT`, `DELETE_PRODUCT`
- **Système** : `SYSTEM_ADMIN`

## Installation et Configuration

### 1. Appliquer la migration Prisma

```bash
npx prisma migrate dev --name add_super_admin_role
```

### 2. Définir le super administrateur

Après avoir créé un compte avec l'email `fandresenar6@gmail.com` via Google OAuth :

```bash
node scripts/set-super-admin.js
```

Ce script :
- Vérifie que l'utilisateur existe
- Met à jour son rôle en `SUPER_ADMIN`
- Protège contre les modifications futures

### 3. Regénérer le client Prisma

```bash
npx prisma generate
```

## Interface de gestion

### Page `/admin/users`

**Accès** : SUPER_ADMIN uniquement

**Fonctionnalités** :
- Liste tous les utilisateurs avec leurs informations
- Affiche le nombre de posts et produits créés par chaque utilisateur
- Changement de rôle via dropdown (sauf pour le super admin principal)
- Suppression d'utilisateurs (impossible pour le super admin principal)
- Badge spécial 👑 pour le super admin principal

**Protections** :
- Le super admin ne peut pas modifier son propre rôle
- Le super admin ne peut pas se supprimer lui-même
- Le compte `fandresenar6@gmail.com` ne peut jamais perdre le rôle SUPER_ADMIN

## API Routes

### GET `/api/users`

Liste tous les utilisateurs (SUPER_ADMIN uniquement).

**Réponse** :
```json
[
  {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "ADMIN",
    "twoFactorEnabled": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "blogPosts": 5,
      "products": 3
    }
  }
]
```

### PATCH `/api/users/[id]`

Met à jour le rôle d'un utilisateur (SUPER_ADMIN uniquement).

**Body** :
```json
{
  "role": "ADMIN"
}
```

**Protections** :
- Impossible de modifier son propre rôle
- Impossible de retirer le rôle SUPER_ADMIN de `fandresenar6@gmail.com`
- Validation des valeurs de rôle

### DELETE `/api/users/[id]`

Supprime un utilisateur (SUPER_ADMIN uniquement).

**Protections** :
- Impossible de se supprimer soi-même
- Impossible de supprimer `fandresenar6@gmail.com`
- Suppression en cascade des contenus liés (géré par Prisma)

## Sécurité

### Protection des routes

1. **Middleware** (`src/middleware.ts`) : Vérifie la présence d'une session pour `/admin`
2. **Layout Admin** : Vérifie le rôle et la 2FA
3. **API Routes** : Utilisent `requireSuperAdmin()` pour vérifier les permissions
4. **Interface** : Cache le menu "Utilisateurs" pour les non-SUPER_ADMIN

### Hiérarchie des rôles

```
SUPER_ADMIN (toutes les permissions)
    ↓
ADMIN (gestion produits + blog)
    ↓
EDITOR (édition blog uniquement)
    ↓
USER (aucune permission admin)
```

## Cas d'usage

### Ajouter un nouvel administrateur

1. L'utilisateur se connecte avec Google OAuth
2. Le SUPER_ADMIN accède à `/admin/users`
3. Trouve l'utilisateur dans la liste
4. Change son rôle via le dropdown
5. L'utilisateur peut maintenant accéder à l'administration

### Rétrograder un administrateur

1. Le SUPER_ADMIN accède à `/admin/users`
2. Sélectionne le nouveau rôle dans le dropdown
3. Confirme l'action
4. L'utilisateur perd immédiatement les permissions associées

### Supprimer un utilisateur

1. Le SUPER_ADMIN accède à `/admin/users`
2. Clique sur "Supprimer" pour l'utilisateur concerné
3. Confirme l'action dans la popup
4. L'utilisateur et ses sessions sont supprimés
5. Ses contenus (blog/produits) sont également supprimés (cascade)

## Audit et statistiques

La page de gestion affiche pour chaque utilisateur :
- **Informations** : Nom, email, rôle
- **Sécurité** : Statut 2FA
- **Activité** : Nombre de posts et produits créés
- **Historique** : Date d'inscription

## Bonnes pratiques

1. **Ne jamais partager** l'accès au compte `fandresenar6@gmail.com`
2. **Principe du moindre privilège** : Donner le rôle minimum nécessaire
3. **Révision régulière** : Vérifier périodiquement les rôles attribués
4. **Activer la 2FA** : Recommandé pour tous les administrateurs
5. **Supprimer les comptes inactifs** : Nettoyer régulièrement les utilisateurs non utilisés

## Dépannage

### Le lien "Utilisateurs" n'apparaît pas

Vérifiez que :
- Vous êtes connecté avec `fandresenar6@gmail.com`
- Le script `set-super-admin.js` a été exécuté
- Le rôle dans la base de données est bien `SUPER_ADMIN`

### Erreur "Accès refusé"

- Vérifiez votre rôle dans la base de données
- Reconnectez-vous pour rafraîchir la session
- Vérifiez que la 2FA est validée si activée

### Impossible de modifier un utilisateur

- Seul le SUPER_ADMIN peut modifier les rôles
- Le compte principal ne peut pas être modifié
- Vérifiez que l'utilisateur existe toujours

## Extension future

Pour ajouter de nouvelles permissions :

1. Ajouter la permission dans `Permission` enum (`src/lib/rbac.ts`)
2. L'attribuer aux rôles concernés dans `rolePermissions`
3. Utiliser `checkPermission()` ou `requirePermission()` dans le code
4. Mettre à jour cette documentation

## Fichiers concernés

- `prisma/schema.prisma` - Définition du modèle User et enum Role
- `src/lib/rbac.ts` - Logique RBAC et vérification des permissions
- `src/types/next-auth.d.ts` - Types TypeScript pour NextAuth
- `src/app/api/users/route.ts` - API liste des utilisateurs
- `src/app/api/users/[id]/route.ts` - API modification/suppression
- `src/app/admin/users/page.tsx` - Interface de gestion
- `src/app/admin/layout.tsx` - Layout avec menu conditionnel
- `scripts/set-super-admin.js` - Script d'initialisation
