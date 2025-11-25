# Implémentation complète du 2FA

## Problème résolu

L'authentification à deux facteurs (2FA) était configurée mais **n'était jamais vérifiée lors de la connexion**. Les utilisateurs pouvaient activer le 2FA, mais lors de la reconnexion, ils n'étaient jamais invités à saisir leur code.

## Solution implémentée

### 1. Flow d'authentification complet

```
Connexion Google OAuth
        ↓
Session créée (twoFactorVerified = false)
        ↓
    2FA activé ?
    ↙         ↘
  NON         OUI
    ↓           ↓
/admin    /auth/verify-2fa
              ↓
        Code vérifié ?
        ↙         ↘
      OUI         NON
        ↓           ↓
    /admin    Erreur + Réessai
```

### 2. Fichiers créés

#### `/src/app/auth/verify-2fa/page.tsx`
Page de vérification du code 2FA après connexion :
- Affichage d'un champ pour saisir le code à 6 chiffres
- Support des codes de backup (à implémenter complètement)
- Vérification du code via API
- Mise à jour de la session après vérification réussie
- Redirection automatique vers /admin

#### `/src/app/api/2fa/verify-login/route.ts`
API endpoint pour vérifier le code 2FA lors de la connexion :
- Vérifie que l'utilisateur est authentifié
- Vérifie le code TOTP avec le secret stocké
- Support des codes de backup (avec suppression après utilisation)
- Retourne le statut de vérification

#### `/src/middleware.ts`
Middleware de protection des routes :
- Redirige vers `/auth/signin` si pas de session
- Redirige vers `/auth/verify-2fa` si 2FA activé mais pas vérifié
- Permet l'accès à `/admin/2fa` même sans vérification (pour la configuration)
- Protège toutes les routes `/admin/*`

### 3. Fichiers modifiés

#### `/src/lib/auth.ts`
Callbacks NextAuth améliorés :
- **JWT callback** : Ajout du flag `twoFactorVerified` (défaut: false)
- **Session callback** : Exposition de `twoFactorVerified` dans la session
- **SignIn callback** : Autorise toujours la connexion (vérification faite après)
- Support de `trigger: "update"` pour mettre à jour le token depuis le client

#### `/src/types/next-auth.d.ts`
Types TypeScript mis à jour :
- Ajout de `twoFactorVerified` dans `Session.user`
- Ajout de `twoFactorVerified` dans `User`
- Ajout de `twoFactorVerified` dans `JWT`
- Ajout de `id` dans `JWT` pour suivre l'utilisateur

#### `/src/app/auth/signin/page.tsx`
Page de connexion avec redirection intelligente :
- Vérifie l'état de la session après connexion
- Redirige vers `/auth/verify-2fa` si 2FA activé et non vérifié
- Redirige vers `/admin` sinon
- Gère les erreurs de connexion

#### `/src/app/admin/2fa/page.tsx`
Page de configuration 2FA améliorée :
- **Correction visuelle** : Les codes de récupération s'affichent maintenant en noir (`text-gray-900`)
- **Amélioration UX** : Le champ de code est maintenant :
  - Limité à 6 chiffres
  - N'accepte que des chiffres (regex)
  - Affiché en police monospace
  - Centré avec espacement large
  - Texte noir sur fond blanc

#### `/src/app/auth/verify-2fa/page.tsx`
Amélioration de l'affichage :
- **Correction** : Le code saisi s'affiche maintenant en noir (`text-gray-900`)
- Fond blanc fixe (pas de mode sombre pour le champ)
- Police monospace pour meilleure lisibilité
- Espacement large entre les chiffres

## Fonctionnalités

### ✅ Implémenté

1. **Configuration 2FA** (`/admin/2fa`)
   - Génération du secret TOTP
   - Affichage du QR code
   - Génération de 10 codes de backup
   - Vérification du premier code avant activation

2. **Vérification à la connexion** (`/auth/verify-2fa`)
   - Demande du code 2FA si activé
   - Vérification du code TOTP
   - Support des codes de backup
   - Mise à jour de la session

3. **Protection des routes** (middleware)
   - Blocage de l'accès admin sans 2FA vérifié
   - Redirection automatique
   - Exception pour la page de configuration 2FA

4. **Gestion de session**
   - Flag `twoFactorVerified` dans le JWT
   - Persistance pendant toute la session
   - Réinitialisation à la reconnexion

### 🔄 À améliorer (optionnel)

1. **Interface pour les codes de backup**
   - Page dédiée pour voir/régénérer les codes
   - Compteur de codes restants
   - Alerte quand il reste peu de codes

2. **Options de configuration**
   - Choix de désactiver le 2FA
   - Réinitialisation du secret
   - Historique des connexions

3. **Expérience utilisateur**
   - Remember device (cookie pour 30 jours)
   - SMS/Email comme alternative
   - Notifications de connexion suspecte

## Variables de session

```typescript
session.user = {
  id: string;
  email: string;
  name: string;
  image: string;
  role: "USER" | "ADMIN" | "EDITOR";
  twoFactorEnabled: boolean;      // 2FA est-il activé ?
  twoFactorVerified: boolean;     // 2FA a-t-il été vérifié pour cette session ?
}
```

## API Endpoints

### POST `/api/2fa/setup`
Configure le 2FA pour l'utilisateur connecté.

**Response:**
```json
{
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["ABC123", "DEF456", ...]
}
```

### POST `/api/2fa/verify`
Vérifie le code lors de la configuration initiale.

**Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST `/api/2fa/verify-login`
Vérifie le code lors de la connexion.

**Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "usedBackupCode": false  // true si un code de backup a été utilisé
}
```

## Test du flow complet

### Scénario 1 : Première connexion (sans 2FA)

1. Visitez `/auth/signin`
2. Cliquez sur "Se connecter avec Google"
3. Connectez-vous avec Google
4. ✅ Redirection directe vers `/admin`

### Scénario 2 : Activation du 2FA

1. Connecté, allez sur `/admin/2fa`
2. Cliquez sur "Activer la 2FA"
3. Scannez le QR code avec Google Authenticator
4. **Sauvegardez les codes de récupération** (maintenant visibles en noir)
5. Entrez le code à 6 chiffres (s'affiche en noir)
6. ✅ 2FA activé

### Scénario 3 : Connexion avec 2FA activé

1. Déconnectez-vous
2. Visitez `/auth/signin`
3. Connectez-vous avec Google
4. ⚠️ Redirection vers `/auth/verify-2fa`
5. Entrez le code à 6 chiffres de votre app (texte en noir)
6. ✅ Redirection vers `/admin`

### Scénario 4 : Tentative d'accès direct à /admin

1. Avec 2FA activé mais non vérifié
2. Visitez `/admin`
3. ⚠️ Middleware redirige vers `/auth/verify-2fa`
4. Après vérification → accès à `/admin`

### Scénario 5 : Utilisation d'un code de backup

1. À la page `/auth/verify-2fa`
2. Cliquez sur "Utiliser un code de secours"
3. Entrez un des codes de backup
4. ✅ Connexion réussie
5. ⚠️ Le code de backup est supprimé de la base de données

## Sécurité

### ✅ Protections en place

1. **Secrets stockés de manière sécurisée**
   - Secrets TOTP dans la base de données (Neon PostgreSQL)
   - Variables d'environnement pour AUTH_SECRET

2. **Validation côté serveur**
   - Tous les codes sont vérifiés par l'API
   - Pas de vérification côté client

3. **Codes de backup à usage unique**
   - Supprimés après utilisation
   - 10 codes générés

4. **Protection des routes**
   - Middleware NextAuth
   - Vérification à chaque requête

5. **Session sécurisée**
   - JWT avec secret
   - HttpOnly cookies

### 🔒 Recommandations supplémentaires

1. **Rate limiting** : Limiter les tentatives de code 2FA
2. **Logs d'audit** : Enregistrer les tentatives de connexion
3. **Remember device** : Cookie sécurisé pour 30 jours
4. **Notification** : Email après activation/désactivation du 2FA
5. **Recovery** : Processus de récupération si perte du téléphone

## Compatibilité

- ✅ NextAuth v5
- ✅ Next.js 15
- ✅ Prisma 6.19.0
- ✅ otplib 12.0.1
- ✅ qrcode 1.5.4
- ✅ Neon PostgreSQL

## Déploiement

Aucune variable d'environnement supplémentaire requise. Le 2FA utilise les variables existantes :
- `DATABASE_URL` (déjà configuré)
- `AUTH_SECRET` (déjà configuré)
- `TOTP_APP_NAME` (déjà configuré)

Pour déployer :
```bash
git add .
git commit -m "feat: implement complete 2FA flow with verification"
git push
```

Vercel détectera automatiquement les changements et déploiera.

## Corrections visuelles appliquées

### Problème 1 : Codes de récupération invisibles
**Avant :** `<div key={i}>{code}</div>` → Texte blanc sur fond gris clair
**Après :** `<div key={i} className="text-gray-900">{code}</div>` → Texte noir visible

### Problème 2 : Code saisi invisible
**Avant :** `text-gray-900 dark:text-white` → Blanc en mode sombre
**Après :** `text-gray-900 bg-white` → Toujours noir sur blanc

### Améliorations UX
- Police monospace pour les codes
- Espacement large (`tracking-widest`)
- Centrage du texte
- Limitation à 6 chiffres
- Accepte uniquement des chiffres
