# Déploiement Vercel - Guide Rapide

## Problème identifié

La liste des déploiements preview est vide car **Vercel n'est probablement pas connecté au repository GitHub `FandresenaR/sifaka`**.

## ✅ Solution Recommandée : Via le Dashboard Vercel

### Étape 1 : Vérifier/Créer le projet

1. **Allez sur** : https://vercel.com/dashboard
2. **Cherchez** votre projet `sifaka`

### Si le projet N'EXISTE PAS :
1. Cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez **"Import Git Repository"**
3. Cherchez et sélectionnez `FandresenaR/sifaka`
4. Configurez :
   - **Framework Preset** : Détecté automatiquement (probablement Next.js)
   - **Root Directory** : Laissez vide pour monorepo ou spécifiez `apps/web`
   - **Build Command** : Laissez par défaut ou `npm run build`
   - Cliquez sur **"Deploy"**

### Si le projet EXISTE :
1. Ouvrez le projet
2. Allez dans **Settings** → **Git**
3. Vérifiez que le repository est bien `FandresenaR/sifaka`
4. Si ce n'est pas le cas, déconnectez et reconnectez le bon repository

### Étape 2 : Configurer les variables d'environnement

1. Dans le projet → **Settings** → **Environment Variables**
2. Ajoutez :
   - **Key** : `NODE_ENV`
   - **Value** : `development`
   - **Environments** : Cochez **Preview** uniquement
3. Cliquez sur **"Save"**

### Étape 3 : Forcer un déploiement de la branche dev

1. Allez dans **Deployments**
2. Cliquez sur le bouton avec les trois points **"..."**
3. Sélectionnez **"Redeploy"**
4. Choisissez la branche `dev`
5. Cliquez sur **"Redeploy"**

## 🚀 Alternative : Via CLI (sans installation globale)

Si vous préférez utiliser la ligne de commande :

```bash
# Utiliser npx pour éviter les problèmes de permissions
npx vercel login

# Déployer la branche dev
git checkout dev
npx vercel --prod=false

# Suivez les instructions interactives
```

## 🔍 Vérification

Une fois configuré, vous devriez voir :
- Un déploiement dans la liste **Deployments**
- Une URL de preview : `https://sifaka-git-dev-[username].vercel.app`
- Les futurs pushs sur `dev` créeront automatiquement des previews

## ⚠️ Note importante

Vercel a besoin d'un **webhook GitHub** pour détecter les pushs automatiquement. Ce webhook est créé automatiquement quand vous connectez le repository via le dashboard.
