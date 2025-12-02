# Configuration Vercel pour la branche Dev

## ✅ Étape 1 : Push vers GitHub - TERMINÉ

La branche `dev` a été créée et poussée avec succès sur GitHub avec le bypass d'authentification.

Commit: `101b8d6` - feat: add authentication bypass for development environment

## 📋 Étape 2 : Configuration Vercel Preview

Pour configurer Vercel afin qu'il déploie automatiquement la branche `dev` en preview :

### Option A : Via le Dashboard Vercel (Recommandé)

1. **Accéder à Vercel** : https://vercel.com
2. **Sélectionner le projet** : `sifaka` (ou le nom de votre projet)
3. **Aller dans Settings** : Cliquez sur "Settings" dans le menu du projet
4. **Git Configuration** :
   - Allez dans l'onglet "Git"
   - Trouvez la section "Production Branch"
   - Assurez-vous que `main` est la branche de production
5. **Preview Deployments** :
   - Dans la même section, trouvez "Ignored Build Step"
   - Assurez-vous que les preview deployments sont activés pour toutes les branches
   - La branche `dev` sera automatiquement déployée en preview

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI si ce n'est pas déjà fait
npm i -g vercel

# Se connecter à Vercel
vercel login

# Lier le projet
vercel link

# Déployer la branche dev
vercel --prod=false
```

### Option C : Configuration automatique

Vercel déploie automatiquement toutes les branches en preview par défaut. Votre branche `dev` devrait déjà être en cours de déploiement !

## 🔍 Vérifier le déploiement

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Vous devriez voir un nouveau déploiement pour la branche `dev`
4. L'URL de preview sera quelque chose comme : `https://sifaka-git-dev-[votre-username].vercel.app`

## ⚙️ Variables d'environnement pour Preview

Pour que le bypass d'authentification fonctionne en preview, ajoutez cette variable d'environnement dans Vercel :

1. **Settings** → **Environment Variables**
2. Ajouter :
   - **Name** : `NODE_ENV`
   - **Value** : `development`
   - **Environment** : Cochez uniquement "Preview"

## 🎯 Résultat attendu

- **Production (main)** : Authentification activée
- **Preview (dev)** : Authentification bypassée (NODE_ENV=development)
- **Local** : Authentification bypassée avec `NODE_ENV=development`

## 📝 Notes importantes

- Les déploiements preview sont créés automatiquement pour chaque push sur une branche non-production
- Chaque pull request vers `main` créera également un déploiement preview
- Les URLs de preview sont uniques et temporaires
