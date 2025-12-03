# Résolution de l'erreur Vercel : Secret "database_url" does not exist

## 🔴 Problème

```
Environment Variable "DATABASE_URL" references Secret "database_url", which does not exist.
```

## 📋 Cause

Le fichier `apps/web/vercel.json` référence des **secrets Vercel** qui n'ont pas encore été créés :
- `@database_url`
- `@nextauth_secret`
- `@nextauth_url`
- `@google_client_id`
- `@google_client_secret`

## ✅ Solution : Créer les secrets dans Vercel

### Option 1 : Via le Dashboard Vercel (Recommandé)

#### Étape 1 : Accéder aux variables d'environnement

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet **`sifaka-web`**
3. Cliquez sur **Settings** → **Environment Variables**

#### Étape 2 : Créer les secrets

Pour chaque variable, cliquez sur **"Add New"** et ajoutez :

**1. DATABASE_URL**
- **Key**: `DATABASE_URL`
- **Value**: Votre URL de base de données Supabase
  ```
  postgresql://postgres.sakfwtcnfvjoyvsgjixw:VOTRE_MOT_DE_PASSE@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
  ```
- **Environments**: Cochez **Production**, **Preview**, et **Development**
- Cochez **"Sensitive"** pour en faire un secret

**2. NEXTAUTH_SECRET**
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Une chaîne aléatoire sécurisée (générez-en une ci-dessous)
- **Environments**: Cochez **Production**, **Preview**, et **Development**
- Cochez **"Sensitive"**

**3. NEXTAUTH_URL**
- **Key**: `NEXTAUTH_URL`
- **Value**: 
  - **Production**: `https://votre-domaine.com` (ou l'URL Vercel de production)
  - **Preview**: `https://sifaka-web-git-dev-[username].vercel.app`
  - **Development**: `http://localhost:3000`
- **Environments**: Ajoutez une valeur différente pour chaque environnement
- **Ne cochez PAS "Sensitive"** (ce n'est pas un secret)

**4. GOOGLE_CLIENT_ID**
- **Key**: `GOOGLE_CLIENT_ID`
- **Value**: Votre Google OAuth Client ID
- **Environments**: Cochez **Production**, **Preview**, et **Development**
- Cochez **"Sensitive"**

**5. GOOGLE_CLIENT_SECRET**
- **Key**: `GOOGLE_CLIENT_SECRET`
- **Value**: Votre Google OAuth Client Secret
- **Environments**: Cochez **Production**, **Preview**, et **Development**
- Cochez **"Sensitive"**

**6. NODE_ENV (pour le bypass d'authentification)**
- **Key**: `NODE_ENV`
- **Value**: `development`
- **Environments**: Cochez **Preview** uniquement
- **Ne cochez PAS "Sensitive"**

#### Étape 3 : Générer NEXTAUTH_SECRET

Vous pouvez générer un secret sécurisé avec :

```bash
# Option 1 : OpenSSL
openssl rand -base64 32

# Option 2 : Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3 : En ligne
# Allez sur https://generate-secret.vercel.app/32
```

### Option 2 : Via Vercel CLI

Si vous préférez utiliser la CLI :

```bash
# Se connecter à Vercel
npx vercel login

# Lier le projet
cd apps/web
npx vercel link

# Ajouter les secrets (un par un)
npx vercel env add DATABASE_URL
# Collez la valeur quand demandé
# Sélectionnez les environnements : Production, Preview, Development

npx vercel env add NEXTAUTH_SECRET
# Collez la valeur générée

npx vercel env add NEXTAUTH_URL
# Collez l'URL appropriée

npx vercel env add GOOGLE_CLIENT_ID
# Collez votre Client ID

npx vercel env add GOOGLE_CLIENT_SECRET
# Collez votre Client Secret

npx vercel env add NODE_ENV
# Tapez "development"
# Sélectionnez uniquement Preview
```

## 🔄 Après avoir ajouté les secrets

1. **Retournez dans Deployments**
2. Cliquez sur **"..."** → **"Redeploy"**
3. Sélectionnez la branche `dev`
4. Le déploiement devrait maintenant fonctionner !

## ⚠️ Notes importantes

### Pour l'API (sifaka-api)

Vous devrez probablement faire la même chose pour le projet **`sifaka-api`** :
1. Allez sur le projet `sifaka-api`
2. Ajoutez les mêmes variables d'environnement
3. Ajoutez également `NODE_ENV=development` pour Preview

### Différence Production vs Preview

- **Production (branche main)** : Utilisez vos vraies credentials et `NODE_ENV` non défini (ou `production`)
- **Preview (branche dev)** : Utilisez `NODE_ENV=development` pour activer le bypass d'authentification

### Vérifier les secrets créés

Dans **Settings** → **Environment Variables**, vous devriez voir toutes vos variables avec un cadenas 🔒 pour celles marquées comme "Sensitive".

## 🎯 Checklist

- [ ] Créer `DATABASE_URL` (sensitive)
- [ ] Créer `NEXTAUTH_SECRET` (sensitive)
- [ ] Créer `NEXTAUTH_URL` (non-sensitive, différent par environnement)
- [ ] Créer `GOOGLE_CLIENT_ID` (sensitive)
- [ ] Créer `GOOGLE_CLIENT_SECRET` (sensitive)
- [ ] Créer `NODE_ENV=development` (Preview uniquement)
- [ ] Redéployer la branche `dev`
- [ ] Vérifier que le déploiement réussit
