# Troubleshooting Vercel Preview Deployments

## Problème : Liste de déploiements preview vide

Si vous voyez que la liste des déploiements preview est vide malgré le push sur la branche `dev`, voici les causes possibles et solutions :

## ✅ Vérifications à faire

### 1. Vérifier la connexion GitHub dans Vercel

**Étapes** :
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **Git**
4. Vérifiez que le repository connecté est bien : `FandresenaR/sifaka`

**Si le repository est différent** :
- Vous devez soit :
  - A) Reconnecter le bon repository
  - B) Pousser sur le repository actuellement connecté

### 2. Vérifier que le projet Vercel existe

Il est possible que vous n'ayez pas encore de projet Vercel pour ce repository.

**Solution** :
1. Sur https://vercel.com/dashboard
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez le repository `FandresenaR/sifaka`
4. Configurez :
   - **Framework Preset** : Next.js (pour le web) ou autre selon votre projet
   - **Root Directory** : Laissez vide ou spécifiez `apps/web` si c'est un monorepo
   - **Build Command** : `npm run build` (ou celle de votre projet)
   - **Output Directory** : `.next` (pour Next.js)

### 3. Vérifier les webhooks GitHub

Vercel utilise des webhooks GitHub pour détecter les pushs.

**Vérification** :
1. Allez sur https://github.com/FandresenaR/sifaka/settings/hooks
2. Vous devriez voir un webhook Vercel
3. Cliquez dessus et vérifiez les "Recent Deliveries"
4. Si aucune livraison récente ou erreurs, recréez le webhook

**Pour recréer le webhook** :
- Dans Vercel : Settings → Git → Reconnectez le repository

### 4. Forcer un déploiement manuel

Si Vercel ne détecte pas automatiquement le push :

**Via le Dashboard** :
1. Allez sur votre projet Vercel
2. Cliquez sur **"Deployments"**
3. Cliquez sur le bouton **"..."** (trois points)
4. Sélectionnez **"Redeploy"** ou **"Deploy"**
5. Choisissez la branche `dev`

**Via CLI** :
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer la branche dev
git checkout dev
vercel --prod=false
```

### 5. Vérifier les paramètres de branche

**Dans Vercel Settings → Git** :
- **Production Branch** : Devrait être `main`
- **Preview Deployments** : Devrait être activé
- Assurez-vous qu'aucune branche n'est dans la liste "Ignored Branches"

### 6. Vérifier que le push a bien été fait

```bash
# Vérifier que la branche dev existe sur GitHub
git ls-remote --heads Fandresena-Kali

# Vous devriez voir :
# refs/heads/dev
# refs/heads/main
```

## 🔍 Diagnostic rapide

Exécutez ces commandes pour diagnostiquer :

```bash
# 1. Vérifier les branches locales et distantes
git branch -a

# 2. Vérifier le dernier commit sur dev
git log dev -1 --oneline

# 3. Vérifier que dev est bien poussé
git ls-remote --heads Fandresena-Kali dev
```

## 🎯 Solution la plus probable

**Le projet Vercel n'est probablement pas encore créé ou connecté au bon repository.**

### Action recommandée :
1. Allez sur https://vercel.com/dashboard
2. Vérifiez si un projet existe pour `sifaka`
3. Si non, créez-le en important `FandresenaR/sifaka`
4. Si oui, vérifiez dans Settings → Git que c'est bien le bon repository

## 📝 Alternative : Déploiement manuel immédiat

Si vous voulez tester immédiatement sans attendre la configuration automatique :

```bash
# Installer Vercel CLI
npm i -g vercel

# Se positionner sur dev
git checkout dev

# Déployer
vercel

# Suivez les instructions :
# - Link to existing project? → Yes (si existe) ou No (pour créer)
# - What's your project's name? → sifaka
# - In which directory is your code located? → ./
```

Cela créera un déploiement preview immédiatement.
