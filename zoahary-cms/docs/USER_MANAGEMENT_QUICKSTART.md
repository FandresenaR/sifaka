# Guide de démarrage rapide - Gestion des utilisateurs

## Étape 1 : Appliquer la migration Prisma

Tout d'abord, appliquez la migration pour ajouter le rôle `SUPER_ADMIN` :

```bash
npx prisma migrate dev --name add_super_admin_role
```

## Étape 2 : Créer un compte Google OAuth

1. Ouvrez votre navigateur et accédez à `http://localhost:3000`
2. Cliquez sur "Se connecter" ou accédez à `/auth/signin`
3. Connectez-vous avec le compte Google **fandresenar6@gmail.com**
4. Autorisez l'application à accéder à votre profil Google

Cela créera automatiquement un compte utilisateur avec le rôle `USER` par défaut.

## Étape 3 : Promouvoir en Super Administrateur

Exécutez le script pour définir le super administrateur :

```bash
node scripts/set-super-admin.js
```

Vous devriez voir :

```
✅ Super administrateur défini avec succès !
Email: fandresenar6@gmail.com
Rôle: SUPER_ADMIN
```

## Étape 4 : Vérifier l'accès

1. Reconnectez-vous (ou rafraîchissez la page)
2. Accédez à `/admin`
3. Vous devriez maintenant voir le lien **"Utilisateurs"** dans le menu de navigation
4. Cliquez dessus pour accéder à `/admin/users`

## Étape 5 : Gérer les utilisateurs

### Ajouter un utilisateur

1. Demandez à l'utilisateur de se connecter via Google OAuth
2. Une fois connecté, il apparaîtra dans votre liste d'utilisateurs

### Modifier un rôle

1. Dans la page `/admin/users`, trouvez l'utilisateur
2. Utilisez le dropdown pour sélectionner le nouveau rôle :
   - **USER** : Accès en lecture seule
   - **EDITOR** : Peut créer/modifier des articles
   - **ADMIN** : Gestion complète produits + blog
   - **SUPER_ADMIN** : Toutes permissions (attention !)
3. Le changement est immédiat

### Supprimer un utilisateur

1. Cliquez sur le bouton **"Supprimer"** à droite de la ligne
2. Confirmez l'action dans la popup
3. L'utilisateur et ses sessions sont supprimés

⚠️ **Note** : La suppression d'un utilisateur supprime également ses contenus (articles, produits).

## Vérification de sécurité

### Le menu "Utilisateurs" n'apparaît pas ?

Vérifiez dans la base de données :

```sql
SELECT email, role FROM "User" WHERE email = 'fandresenar6@gmail.com';
```

Le résultat doit être :

```
email                   | role
------------------------+-------------
fandresenar6@gmail.com  | SUPER_ADMIN
```

### Réinitialiser le super admin

Si nécessaire, vous pouvez toujours réexécuter le script :

```bash
node scripts/set-super-admin.js
```

## Protections automatiques

Le système empêche automatiquement :

- ✅ Le super admin de modifier son propre rôle
- ✅ Le super admin de se supprimer lui-même
- ✅ La rétrogradation du compte fandresenar6@gmail.com
- ✅ La suppression du compte fandresenar6@gmail.com
- ✅ L'accès à `/admin/users` pour les non-SUPER_ADMIN

## Prochaines étapes

- Configurez la 2FA pour sécuriser le compte super admin
- Créez des comptes pour vos éditeurs et administrateurs
- Attribuez les rôles appropriés selon les responsabilités
- Consultez [la documentation complète](USER_MANAGEMENT.md) pour plus de détails

## Aide

En cas de problème :

1. Vérifiez que la migration Prisma a été appliquée
2. Vérifiez que le client Prisma est à jour (`npx prisma generate`)
3. Vérifiez les logs de la console pour des erreurs
4. Reconnectez-vous pour rafraîchir la session
5. Consultez la section Dépannage dans [USER_MANAGEMENT.md](USER_MANAGEMENT.md)
