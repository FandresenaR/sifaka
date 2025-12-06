# 🔴 Fixing Vercel Build Errors

## Current Situation

✅ **Good News**: 
- Vercel IS detecting your `dev` branch
- Deployments ARE being triggered
- Both apps build successfully locally

❌ **Problem**: 
- Builds are FAILING on Vercel (Error 2s)
- Last failed deployment: commit `2e017ec` (11h ago)
- Latest commits (`7cbd1a9`, `9118940`) should trigger new deployments

---

## 🔍 Step 1: Check Build Logs (CRITICAL - DO THIS FIRST!)

### How to Access Build Logs:

1. **Vercel Dashboard** → **Deployments** tab
2. **Click on the failed deployment** (red "Error" status)
3. **Scroll down to "Build Logs"** section
4. **Look for the error** - usually at the bottom in red text

### Common Error Patterns to Look For:

```
❌ "Missing required environment variable: DATABASE_URL"
❌ "Module not found: Can't resolve..."
❌ "Command failed with exit code 1"
❌ "Type error: ..."
❌ "ENOENT: no such file or directory"
```

---

## 🛠️ Common Vercel Build Errors & Fixes

### Error 1: Missing Environment Variables

**Symptom**: 
```
Error: Missing required environment variable: DATABASE_URL
```

**Fix**:
1. Vercel Dashboard → Settings → Environment Variables
2. Add missing variables for **Preview** environment
3. **Required variables**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

**Important**: Check the **Preview** checkbox for each variable!

---

### Error 2: Build Command Issues

**Symptom**:
```
Error: Command "npm run build" exited with 1
```

**Possible Causes**:
1. **Monorepo path issues** - Vercel can't find the right directory
2. **Missing dependencies** - npm install failed
3. **TypeScript errors** - strict mode catching issues

**Fix for Web App**:

Check your Vercel project settings:
- **Root Directory**: Should be blank (for root) or `.`
- **Build Command**: `npx turbo run build --filter=@sifaka/web`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**Fix for API**:

Check your Vercel project settings:
- **Root Directory**: `apps/api` ⚠️ **CRITICAL**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

### Error 3: Turbo/Monorepo Issues

**Symptom**:
```
Error: Could not find package @sifaka/web
```

**Fix**: Update root `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm install && npx turbo run build --filter=@sifaka/web",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "dev": true
    }
  },
  "ignoreCommand": "exit 0"
}
```

---

### Error 4: Node Version Mismatch

**Symptom**:
```
Error: The engine "node" is incompatible with this module
```

**Fix**: Add to `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

Or set in Vercel Dashboard → Settings → General → Node.js Version

---

### Error 5: Database Connection During Build

**Symptom**:
```
Error: Can't reach database server at...
```

**Why**: Your build process might be trying to connect to the database

**Fix**: Ensure database connections only happen at runtime, not during build

Check for:
- Prisma generate running during build (this is OK)
- Database queries in top-level code (NOT OK)
- Migrations running during build (NOT OK)

---

## 🚀 Quick Fixes to Try

### Fix 1: Update vercel.json (Already Done)

We already added `"ignoreCommand": "exit 0"` - this ensures builds aren't skipped.

### Fix 2: Simplify Build Command

Update `/home/twain/Project/sifaka/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "dev": true
    }
  },
  "ignoreCommand": "exit 0",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url",
    "GOOGLE_CLIENT_ID": "@google_client_id",
    "GOOGLE_CLIENT_SECRET": "@google_client_secret"
  }
}
```

### Fix 3: Check for New Deployments

Your latest commits should have triggered new deployments:
- `7cbd1a9` - feat(vercel): add API vercel.json and deployment troubleshooting guides
- `9118940` - fix(vercel): add ignoreCommand to ensure dev branch deployments are not skipped

**Check**: Do you see these commits in Vercel deployments?

If not, the webhook might be broken.

---

## 🔧 Webhook Troubleshooting

### Check GitHub Webhook:

1. Go to: https://github.com/FandresenaR/sifaka/settings/hooks
2. Find the Vercel webhook
3. Click on it
4. Check "Recent Deliveries"
5. Look for:
   - ✅ Green checkmark = webhook working
   - ❌ Red X = webhook failing

### Fix Broken Webhook:

1. **Vercel Dashboard** → **Settings** → **Git**
2. Click **"Disconnect"**
3. Click **"Connect Git Repository"**
4. Select your repository again
5. This recreates the webhook

---

## 📋 Checklist: What to Check

- [ ] **Build logs** - What's the actual error message?
- [ ] **Environment variables** - Are they set for Preview?
- [ ] **Root directory** - Correct for each project?
- [ ] **Build command** - Matches what works locally?
- [ ] **GitHub webhook** - Is it working?
- [ ] **New deployments** - Do you see commits `7cbd1a9` and `9118940`?
- [ ] **Node version** - Compatible with your dependencies?

---

## 🎯 Next Steps

### 1. Get the Exact Error (Priority #1)

**You need to**:
1. Click on a failed deployment in Vercel
2. Read the build logs
3. Copy the error message
4. Share it with me

Without the exact error, we're guessing!

### 2. Check for New Deployments

Look for deployments with commits:
- `7cbd1a9` (latest)
- `9118940` (second latest)

If you don't see them, the webhook is broken.

### 3. Verify Environment Variables

Make sure these exist with **Preview** checked:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## 💡 Most Likely Causes (Ranked)

Based on the screenshot:

1. **Missing Environment Variables** (60% probability)
   - Preview environment variables not set
   - Fix: Add them in Vercel dashboard

2. **Monorepo Build Path Issues** (25% probability)
   - Vercel can't find the right files
   - Fix: Verify root directory settings

3. **Broken GitHub Webhook** (10% probability)
   - New commits not triggering deployments
   - Fix: Reconnect Git integration

4. **Database Connection During Build** (5% probability)
   - Build trying to connect to DB
   - Fix: Ensure DB calls only at runtime

---

## 🆘 What to Share

To help you fix this, I need:

1. **The exact error message** from build logs
2. **Screenshot** of environment variables page
3. **Confirmation**: Do you see deployments for commits `7cbd1a9` or `9118940`?

Then I can give you the exact fix!
