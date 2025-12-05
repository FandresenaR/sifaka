# Mode Bypass Authentication (Développement)

## Configuration

Pour activer le bypass d'authentification en développement, ajoutez dans `.env` :

```env
BYPASS_AUTH=true
```

## Fonctionnement

Lorsque `BYPASS_AUTH=true` :

1. **Middleware** : Toutes les routes sont accessibles sans authentification
2. **RBAC** : `getCurrentUser()` retourne automatiquement un utilisateur mock SUPER_ADMIN
3. **API Routes** : Toutes les vérifications de rôle passent automatiquement

### Utilisateur Mock

```typescript
{
  id: 'dev-user-123',
  email: 'dev@localhost',
  name: 'Dev User (Bypass)',
  role: 'SUPER_ADMIN',
  image: null,
}
```

## Interface Visuelle

Un bandeau jaune s'affiche en haut de toutes les pages admin pour indiquer que le mode bypass est actif :

```
🔓 MODE DÉVELOPPEMENT - Authentication Bypass Activé
```

## Sécurité

⚠️ **IMPORTANT** : 
- Ce mode est uniquement pour le développement local
- Ne JAMAIS déployer avec `BYPASS_AUTH=true` en production
- La vérification `NODE_ENV === 'development'` est également en place comme garde-fou

## Désactivation

Pour revenir au mode authentification normal :

```env
BYPASS_AUTH=false
```

Ou supprimez simplement la ligne `BYPASS_AUTH` du fichier `.env`.

## Utilisation

### Accès direct aux routes protégées

```bash
# Sans authentification, vous pouvez accéder directement à :
http://localhost:3000/admin
http://localhost:3000/admin/users
http://localhost:3000/admin/blog
# etc.
```

### Développement API

Les endpoints API fonctionnent normalement :

```typescript
// app/api/users/route.ts
export async function GET() {
  const user = await requireSuperAdmin() 
  // ✅ Retourne l'utilisateur mock en mode bypass
  
  const users = await prisma.user.findMany()
  return Response.json(users)
}
```

## Fichiers Modifiés

- `apps/web/.env` - Variable `BYPASS_AUTH`
- `apps/web/middleware.ts` - Vérification du bypass avant auth
- `apps/web/lib/rbac.ts` - Retour d'utilisateur mock dans `getCurrentUser()`
- `apps/web/components/DevModeBanner.tsx` - Bandeau visuel d'avertissement
- `apps/web/app/admin/layout.tsx` - Intégration du bandeau

## Avantages

✅ Développement rapide sans configuration OAuth  
✅ Pas besoin de credentials Google en local  
✅ Tests des fonctionnalités admin sans friction  
✅ Toutes les permissions SUPER_ADMIN disponibles  
✅ Facile à activer/désactiver  

## Limitations

⚠️ Les fonctionnalités liées à la vraie session utilisateur peuvent ne pas fonctionner correctement  
⚠️ Les données de profil sont mockées  
⚠️ Les relations avec la base de données utilisateur peuvent nécessiter des ajustements
