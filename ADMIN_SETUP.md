# Configuration Admin - Guide complet

## 🎯 Vue d'ensemble

La page admin est **entièrement protégée par OAuth** et offre un dashboard complet avec :
- ✅ Authentification OAuth Google
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Attribution des rôles
- ✅ Modules modulaires extensibles

## 📋 Architecture

```
/admin                    → Dashboard principal (protégé)
├── /users               → Gestion des utilisateurs (protégé)
├── /products            → Gestion des produits
├── /blog                → Gestion du blog
├── /media               → Médiathèque
├── /monitoring          → Analytics et monitoring
└── /security            → Configuration de sécurité
```

## 🔐 Protection des routes

### Comment ça marche ?

1. **Layout Admin** (`app/admin/layout.tsx`)
   - Enveloppe toutes les routes `/admin/*` avec `<AdminProtection>`
   - Vérifie l'authentification OAuth avant d'afficher le contenu

2. **Composant AdminProtection** (`components/admin/AdminProtection.tsx`)
   - Utilise le hook `useAuth()`
   - Redirige vers `/auth/signin` si pas authentifié
   - Affiche un loader pendant la vérification

3. **Hook useAuth** (`lib/useAuth.ts`)
   - Vérifie la présence du token JWT en localStorage
   - Récupère les infos utilisateur stockées
   - Permet la déconnexion sécurisée

### Code d'utilisation

```typescript
// Dans n'importe quelle page admin
import { useAuth } from "@/lib/useAuth"

export default function MyPage() {
  const { user, logout, isLoading } = useAuth()
  
  if (isLoading) return <Loading />
  if (!user) return null
  
  return <h1>Bienvenue {user.name}</h1>
}
```

## 📊 Dashboard Principal

### Fonctionnalités

- **Header Admin** : Navigation, infos utilisateur, déconnexion
- **Statistiques** : Compteurs utilisateurs/admins/super-admins
- **Modules** : Cartes pour accéder aux différents modules
- **Responsive** : Mobile, tablet, desktop

### Code

```typescript
// Récupérer les stats depuis l'API
const data = await api.get("/users")
const stats = {
  users: users.filter(u => u.role === "USER").length,
  admins: users.filter(u => u.role === "ADMIN").length,
  superAdmins: users.filter(u => u.role === "SUPER_ADMIN").length,
}
```

## 👥 Gestion des utilisateurs

### Fonctionnalités

- **Liste des utilisateurs** avec filtrage
- **Modifier les rôles** (User → Admin → Super Admin)
- **Supprimer des utilisateurs**
- **Voir les infos** (email, date création, dernière connexion)

### Endpoints API requis

```typescript
// GET /users - Récupérer tous les utilisateurs
const users = await api.get("/users")

// PATCH /users/:id - Modifier un utilisateur
await api.patch(`/users/${userId}`, { role: "ADMIN" })

// DELETE /users/:id - Supprimer un utilisateur
await api.del(`/users/${userId}`)
```

## 🔧 Utiliser le client API

### Syntaxe

```typescript
import * as api from "@/lib/api-client"

// GET
const data = await api.get("/endpoint")

// POST
const result = await api.post("/endpoint", { key: "value" })

// PATCH
const updated = await api.patch("/endpoint/:id", { key: "newValue" })

// DELETE
await api.del("/endpoint/:id")
```

### Le token JWT est ajouté automatiquement !

```typescript
// Le header "Authorization: Bearer <token>" est ajouté automatiquement
const users = await api.get("/users")
// → GET /users
//    Headers: { Authorization: "Bearer eyJ..." }
```

## 🎨 Composants réutilisables

### AdminHeader

```typescript
<AdminHeader 
  projectName="Mon Projet"
  projectLogo="/logo.png"
/>
```

Affiche :
- Logo + nom du projet
- Navigation (desktop et mobile)
- Infos utilisateur + déconnexion
- Toggle dark mode

### AdminProtection

```typescript
<AdminProtection>
  <div>Contenu protégé</div>
</AdminProtection>
```

Vérifie l'authentification avant d'afficher le contenu.

## 📱 Responsive Design

Tous les composants sont **mobile-first** :
- Navigation collapse en mobile
- Tableau scroll horizontal sur petit écran
- Layout grid responsive

## 🌙 Dark Mode

Support complet du dark mode :
- Classes Tailwind `dark:*`
- Toggle dans le header
- Préférence stockée

## 🚀 Prochaines étapes

### 1. Compléter les modules

```typescript
// apps/web/app/admin/products/page.tsx
export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    api.get("/products").then(setProducts)
  }, [])
  
  return (...)
}
```

### 2. Ajouter des endpoints API

```typescript
// apps/api/src/products/products.controller.ts
@Controller('products')
export class ProductsController {
  @Get()
  findAll() { ... }
  
  @Post()
  create(@Body() dto: CreateProductDto) { ... }
}
```

### 3. Créer des guards pour les rôles

```typescript
// apps/api/src/auth/decorators/roles.decorator.ts
@SetMetadata('roles', [UserRole.ADMIN])
export const RequireRole = (...roles: UserRole[]) => ...
```

## 🔍 Dépannage

### "Redirection vers signin après login"
- Vérifier que le JWT_SECRET est identique entre frontend et backend
- Vérifier que localStorage n'est pas vidé
- Vérifier les logs du navigateur (DevTools → Console)

### "API retourne 401 Unauthorized"
- Vérifier que le token est envoyé dans le header Authorization
- Vérifier que le token n'a pas expiré
- Vérifier que le backend valide le JWT correctement

### "Page charge mais pas de données"
- Vérifier la connexion à la base de données
- Vérifier les logs du backend (nest start --debug)
- Vérifier les erreurs dans DevTools → Network

## 📚 Fichiers clés

| Fichier | Rôle |
|---------|------|
| `app/admin/layout.tsx` | Layout avec protection |
| `app/admin/page.tsx` | Dashboard principal |
| `app/admin/users/page.tsx` | Gestion utilisateurs |
| `components/admin/AdminHeader.tsx` | Header navigation |
| `components/admin/AdminProtection.tsx` | Protection OAuth |
| `lib/useAuth.ts` | Hook authentification |
| `lib/api-client.ts` | Client HTTP sécurisé |
| `lib/oauth.ts` | Logique OAuth |

## ✅ Checklist d'installation

- [ ] Installer les dépendances : `npm install`
- [ ] Configurer les variables d'env
- [ ] Démarrer l'API : `npm start --workspace=api`
- [ ] Démarrer le frontend : `npm run dev --workspace=web`
- [ ] Aller à http://localhost:3000/auth/signin
- [ ] Se connecter avec Google
- [ ] Vérifier le dashboard
- [ ] Tester la gestion des utilisateurs
