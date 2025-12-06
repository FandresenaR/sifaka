# Configuration OAuth Google - Guide d'implémentation

## Vue d'ensemble

Ce projet utilise **OAuth 2.0 Google** pour l'authentification sans dépendre de NextAuth.

### Architecture

```
Frontend (Next.js) 
  ↓ User clique "Login with Google"
Google OAuth Server
  ↓ Redirect avec authorization code
Frontend (auth/callback)
  ↓ POST /auth/oauth/callback avec le code
Backend API (NestJS)
  ↓ Valide le code avec Google
  ↓ Crée/met à jour l'utilisateur
  ↓ Retourne JWT token + user data
Frontend
  ↓ Stocke le token en localStorage
  ↓ Redirige vers /admin
Chaque requête API
  ↓ Ajoute "Authorization: Bearer <token>" header
```

## Fichiers clés

### Frontend (Next.js)

1. **`lib/oauth.ts`** - Fonctions OAuth (login, token management)
2. **`lib/api-client.ts`** - Client HTTP avec authentification automatique
3. **`lib/useAuth.ts`** - Hook React pour protéger les routes
4. **`app/auth/signin/page.tsx`** - Page de connexion OAuth
5. **`app/auth/callback/page.tsx`** - Page de callback OAuth

### Backend (NestJS)

1. **`src/auth/auth.service.ts`** - Logique OAuth + JWT
2. **`src/auth/auth.controller.ts`** - Endpoint POST /auth/oauth/callback
3. **`src/auth/auth.guard.ts`** - Protège les routes avec JWT

## Variables d'environnement requises

### Frontend (apps/web/.env)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="636201463661-..."
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Backend (apps/api/.env)
```env
GOOGLE_CLIENT_ID="636201463661-..."
GOOGLE_CLIENT_SECRET="GOCSPX-..."
JWT_SECRET="your-secret-key-change-in-production"
API_URL="http://localhost:3001"
```

## Flux d'authentification

### 1. Login (Frontend)
```typescript
// Utilisateur clique le bouton Google
const googleAuthUrl = getGoogleAuthURL();
window.location.href = googleAuthUrl;
```

### 2. Callback (Frontend)
```typescript
// Google redirige vers /auth/callback?code=xxx
const { token, user } = await exchangeCodeForToken(code);
setToken(token); // localStorage
setCurrentUser(user); // localStorage
router.push("/admin");
```

### 3. OAuth Exchange (Backend)
```typescript
// POST /auth/oauth/callback { code }
// 1. Valide le code avec Google
// 2. Récupère l'email et les infos utilisateur
// 3. Upsert l'utilisateur en DB
// 4. Crée un JWT
// 5. Retourne { token, user }
```

### 4. Requêtes authentifiées (Frontend)
```typescript
// Le client HTTP ajoute automatiquement le token
const user = await get("/api/users/me"); // Header: "Authorization: Bearer <token>"
```

### 5. Protection des routes (Backend)
```typescript
// AuthGuard valide le JWT sur toutes les routes sauf @Public()
if (!isPublic && !token) return 401;
const user = validateUser(token);
```

## Installation des dépendances

### Backend
```bash
npm install google-auth-library jsonwebtoken
```

### Frontend
Aucune dépendance supplémentaire requise (utilise l'API native fetch)

## Utilisation dans les composants

### Page protégée
```typescript
import { withAuth } from "@/lib/useAuth";

function AdminPage({ user }) {
  return <h1>Bienvenue {user.name}</h1>;
}

export default withAuth(AdminPage);
```

### Utiliser le client API
```typescript
import * as api from "@/lib/api-client";

// GET
const users = await api.get("/api/users");

// POST
const newUser = await api.post("/api/users", { name: "John" });

// DELETE
await api.del(`/api/users/${id}`);
```

## Sécurité

✅ Tokens JWT avec expiration (7 jours)
✅ Secrets stockés en variables d'environnement
✅ CORS configuré sur l'API
✅ Validation du code Google côté serveur
✅ Token jamais exposé au client (sauf localStorage)
✅ AuthGuard sur toutes les routes sauf @Public()

## Dépannage

### "Invalid token" error
- Vérifier que JWT_SECRET est identique entre frontend et backend
- Vérifier que le token n'a pas expiré

### "Google OAuth error: invalid_client"
- Vérifier GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET
- Vérifier que l'URI de callback est enregistré dans Google Console

### "User not found in DB"
- Vérifier la connexion à la base de données
- Vérifier que l'utilisateur a été créé lors de l'OAuth exchange

## Prochaines étapes

1. ✅ Installer les dépendances: `npm install`
2. ✅ Tester la page de login: http://localhost:3000/auth/signin
3. ✅ Vérifier les logs du backend
4. ✅ Implémenter les pages admin protégées
