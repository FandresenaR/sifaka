# Fix: Dev Branch Not Deploying on Vercel

## Problem
Latest commits to `dev` branch are not triggering preview deployments on Vercel for both web and API applications.

## Root Causes & Solutions

### 1. **Vercel Dashboard Configuration** (Most Common)

#### Check & Fix in Vercel Dashboard:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (sifaka)
3. **Settings → Git**:
   - ✅ Verify "Production Branch" is set to `main`
   - ✅ Check "Ignored Build Step" - should be empty or properly configured
   - ✅ Ensure "Automatically expose System Environment Variables" is enabled

4. **Settings → Git → Deploy Hooks**:
   - Check if there are any deploy hooks that might be interfering

5. **Deployments Tab**:
   - Check if there are any failed deployments
   - Look for error messages

---

### 2. **GitHub Integration Issue**

#### Verify GitHub Connection:

1. **Vercel Dashboard → Settings → Git**:
   - Check if GitHub integration is active
   - Verify the correct repository is connected: `FandresenaR/sifaka`
   - Re-authorize GitHub if needed

2. **GitHub Webhooks**:
   - Go to: https://github.com/FandresenaR/sifaka/settings/hooks
   - Verify Vercel webhook exists and is active
   - Check recent deliveries for errors

#### Fix Webhook Issues:

If webhook is missing or broken:
- In Vercel: **Settings → Git → Disconnect** then **Reconnect**
- This will recreate the webhook

---

### 3. **Ignored Build Step Configuration**

Your `vercel.json` might need an ignored build step configuration to prevent Vercel from skipping builds.

#### Add to `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && npx turbo run build --filter=@sifaka/web",
  "devCommand": "cd ../.. && npx turbo run dev --filter=@sifaka/web",
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

The `"ignoreCommand": "exit 0"` ensures builds are never skipped.

---

### 4. **Monorepo Detection Issue**

Vercel might not be detecting changes in your monorepo structure properly.

#### Solution A: Update Root Directory

1. **Vercel Dashboard → Settings → General**
2. **Root Directory**: Leave blank (for root) or set to specific app
3. For web app, the current setup should work
4. For API, you need a separate project with Root Directory: `apps/api`

#### Solution B: Add Turbo Configuration

Create `turbo.json` at root if not exists:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

---

### 5. **Environment Variables Missing**

Preview deployments might be failing due to missing environment variables.

#### Check & Add Preview Environment Variables:

1. **Vercel Dashboard → Settings → Environment Variables**
2. **For each variable**, ensure it's available for **Preview** environment:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NODE_ENV` (set to `development` for Preview only)

3. **Important**: Click the **Preview** checkbox for each variable

---

### 6. **Build Command Issues**

The build command in `vercel.json` uses a relative path that might fail.

#### Fix Build Command:

Update `vercel.json` build command:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --prefix ../.. && npm install"
}
```

Or use Turbo properly:

```json
{
  "buildCommand": "npx turbo run build --filter=@sifaka/web",
  "installCommand": "npm install"
}
```

---

## Quick Diagnostic Steps

### Step 1: Trigger Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd /home/twain/Project/sifaka
vercel link

# Deploy dev branch manually
git checkout dev
vercel --prod=false
```

This will show you the exact error if there is one.

### Step 2: Check Vercel Logs

1. Go to Vercel Dashboard → Deployments
2. Look for any failed deployments
3. Click on them to see detailed logs

### Step 3: Verify Branch Protection

```bash
# Check if dev branch exists on remote
git ls-remote --heads origin dev

# Should show: refs/heads/dev
```

### Step 4: Force Push to Trigger Deployment

```bash
# Make a trivial change
git checkout dev
echo "# Trigger deployment" >> README.md
git add README.md
git commit -m "chore: trigger vercel deployment"
git push origin dev --force-with-lease
```

---

## Separate Projects for Web and API

Since you have both web and API apps, you need **two separate Vercel projects**:

### Project 1: sifaka-web
- **Root Directory**: `.` (root)
- **Framework**: Next.js
- **Build Command**: `npx turbo run build --filter=@sifaka/web`
- **Output Directory**: `.next`

### Project 2: sifaka-api
- **Root Directory**: `apps/api`
- **Framework**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Create API Project:

1. **Vercel Dashboard → Add New Project**
2. **Import** the same GitHub repository: `FandresenaR/sifaka`
3. **Configure**:
   - Name: `sifaka-api`
   - Root Directory: `apps/api`
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**: Add all API-specific variables
5. **Deploy**

---

## Verification Checklist

After applying fixes:

- [ ] Vercel webhook exists in GitHub settings
- [ ] GitHub integration is active in Vercel
- [ ] Environment variables are set for Preview environment
- [ ] `dev` branch is enabled in `vercel.json`
- [ ] No ignored build step blocking deployments
- [ ] Separate Vercel projects for web and API (if needed)
- [ ] Manual deployment via CLI works
- [ ] Push to `dev` branch triggers automatic deployment

---

## Expected Result

After fixing:

1. **Push to dev branch**:
   ```bash
   git checkout dev
   git add .
   git commit -m "test: verify deployment"
   git push origin dev
   ```

2. **Check Vercel Dashboard**:
   - New deployment should appear within 10-30 seconds
   - Status: Building → Ready
   - Preview URL: `https://sifaka-git-dev-[username].vercel.app`

3. **For API** (if separate project):
   - Preview URL: `https://sifaka-api-git-dev-[username].vercel.app`

---

## Common Errors & Solutions

### Error: "No framework detected"
**Solution**: Set framework explicitly in `vercel.json` or dashboard

### Error: "Build command failed"
**Solution**: Test build locally first: `npm run build`

### Error: "Missing environment variables"
**Solution**: Add variables in Vercel dashboard for Preview environment

### Error: "Ignored build step"
**Solution**: Add `"ignoreCommand": "exit 0"` to `vercel.json`

---

## Next Steps

1. **Check Vercel Dashboard** for existing deployments and errors
2. **Verify GitHub webhook** is active
3. **Add environment variables** for Preview environment
4. **Try manual deployment** via CLI to see exact errors
5. **Create separate API project** if needed

Let me know which error you encounter and I'll help you fix it!
