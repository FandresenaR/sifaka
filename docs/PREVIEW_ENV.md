# Preview Environment Variables

Ce fichier documente les variables d'environnement à configurer dans **Vercel** pour l'environnement **Preview** (branche `dev` et feature branches).

> ⚠️ **Important** : Ne commitez JAMAIS de vraies valeurs sensibles dans ce fichier !

---

## 🗄️ Database - Neon PostgreSQL

**Recommandation** : Créez une branche "dev" dans votre projet Neon ou un projet séparé.

```env
DATABASE_URL='postgresql://user:password@ep-xxx-dev.aws.neon.tech/sifaka_dev?sslmode=require'
```

**Documentation** : [Neon Branching Guide](https://neon.tech/docs/guides/branching)

---

## 🔐 NextAuth - Authentication

### NEXTAUTH_URL

Vercel définit automatiquement l'URL pour les previews. Format :
```
https://sifaka-web-git-dev-fandresenar.vercel.app
```

**Production** : `https://sifaka-web.vercel.app/`

Vous pouvez aussi utiliser la variable système Vercel :
```env
NEXTAUTH_URL=$VERCEL_URL
```

### NEXTAUTH_SECRET

Utilisez un secret **différent** de la production.

**Générer un nouveau secret** :
```bash
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET='dev-secret-key-different-from-prod-xyz123=='
```

---

## 🔑 Google OAuth

### Option 1 : Projet Google Cloud séparé (Recommandé)

Créez un projet Google Cloud dédié au développement avec des credentials séparés.

```env
GOOGLE_CLIENT_ID='xxx-dev.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET='GOCSPX-dev-secret-key'
```

### Option 2 : Même projet, URLs multiples

Utilisez les mêmes credentials mais ajoutez les URLs de preview dans les "Authorized redirect URIs".

---

## 🌐 Authorized Redirect URIs (Google OAuth)

Ajoutez ces URLs dans [Google Cloud Console](https://console.cloud.google.com/apis/credentials) :

**Production** :
```
https://sifaka-web.vercel.app/api/auth/callback/google
```

**Preview** :
```
https://sifaka-web-git-dev-fandresenar.vercel.app/api/auth/callback/google
https://sifaka-web-*.vercel.app/api/auth/callback/google
```

Le wildcard `*` permet d'autoriser toutes les previews Vercel automatiquement.

---

## 📦 Stack Auth (si utilisé)

```env
NEXT_PUBLIC_STACK_PROJECT_ID='dev-project-id'
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY='dev-publishable-key'
STACK_SECRET_SERVER_KEY='dev-secret-server-key'
```

---

## ⚙️ Configuration dans Vercel Dashboard

### Étapes

1. Allez dans **Settings → Environment Variables**
2. Pour chaque variable ci-dessus :
   - ✅ Cochez **"Preview"** (pour `dev` et feature branches)
   - ❌ **Ne cochez PAS** "Production" (utilisez des valeurs différentes)
3. Sauvegardez

### Variables système Vercel disponibles

Vercel fournit automatiquement ces variables :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VERCEL_URL` | URL du déploiement | `sifaka-web-git-dev-user.vercel.app` |
| `VERCEL_ENV` | Environnement | `preview` |
| `VERCEL_GIT_COMMIT_REF` | Nom de la branche | `dev` |

---

## 📋 Checklist de configuration

- [ ] Créer une branche Neon "dev" ou un projet séparé
- [ ] Générer un nouveau `NEXTAUTH_SECRET` pour preview
- [ ] Configurer Google OAuth (projet séparé ou ajouter URLs)
- [ ] Ajouter toutes les variables dans Vercel Dashboard
- [ ] Cocher "Preview" pour chaque variable
- [ ] Tester un déploiement sur la branche `dev`
- [ ] Vérifier que l'authentification fonctionne
- [ ] Vérifier la connexion à la base de données

---

## 🔗 Ressources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Branching](https://neon.tech/docs/guides/branching)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [Google OAuth Setup](https://console.cloud.google.com/apis/credentials)
