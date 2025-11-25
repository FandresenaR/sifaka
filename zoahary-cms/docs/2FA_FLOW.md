# Flow 2FA corrigé

## Problème résolu

Le 2FA demandait immédiatement le code de vérification même si la configuration initiale n'avait pas été terminée correctement.

## Nouveau flow

### 1. Configuration initiale du 2FA

**Page : `/admin/2fa`**

1. L'utilisateur clique sur "Activer la 2FA"
2. Le serveur génère :
   - Un secret TOTP
   - Un QR code
   - 10 codes de backup
3. L'utilisateur :
   - Scanne le QR code avec Google Authenticator
   - **Sauvegarde les codes de backup** (visibles en noir)
   - Entre le code à 6 chiffres de son app
4. Le serveur vérifie le code
5. Si valide → `twoFactorEnabled = true` dans la DB
6. **La page se recharge automatiquement** pour mettre à jour la session
7. Message de confirmation : "Déconnectez-vous et reconnectez-vous pour tester"

### 2. Première connexion après activation 2FA

1. L'utilisateur se déconnecte
2. Se reconnecte avec Google OAuth
3. ✅ **Redirection automatique vers `/auth/verify-2fa`**
4. L'utilisateur entre son code 2FA
5. Accès à `/admin` accordé

### 3. Si le 2FA ne fonctionne pas

**Option 1 : Désactiver et reconfigurer**

1. Aller sur `/admin/2fa`
2. Cliquer sur "Désactiver le 2FA"
3. Confirmer
4. Recommencer la configuration depuis l'étape 1

**Option 2 : Utiliser un code de backup**

1. À la page `/auth/verify-2fa`
2. Cliquer sur "Utiliser un code de secours"
3. Entrer un des 10 codes de backup
4. ⚠️ Le code sera supprimé après utilisation

## Changements apportés

### 1. Page de configuration améliorée (`/admin/2fa`)

**Avant :**
- Pas de vérification si 2FA déjà activé
- Pas d'option pour désactiver
- Pas de rechargement de session

**Après :**
- ✅ Vérifie l'état 2FA au chargement
- ✅ Affiche "2FA est activée" si déjà configuré
- ✅ Bouton "Désactiver le 2FA" disponible
- ✅ Recharge automatiquement après activation
- ✅ Message clair : "Déconnectez-vous pour tester"

### 2. Nouvel endpoint : `/api/2fa/disable`

Permet de désactiver le 2FA :
```typescript
POST /api/2fa/disable
→ twoFactorEnabled = false
→ twoFactorSecret = null
→ twoFactorBackupCodes = []
```

### 3. Rechargement automatique de la session

Après activation ou désactivation du 2FA, la page se recharge pour synchroniser la session avec la base de données.

## États de la page `/admin/2fa`

### État 1 : 2FA non activé
```
┌─────────────────────────────────────┐
│  Double Authentification (2FA)      │
│                                      │
│  La double authentification ajoute  │
│  une couche de sécurité...          │
│                                      │
│  [  Activer la 2FA  ]               │
└─────────────────────────────────────┘
```

### État 2 : Configuration en cours
```
┌─────────────────────────────────────┐
│  Scannez ce QR code                 │
│  ┌─────────┐                        │
│  │ QR CODE │                        │
│  └─────────┘                        │
│                                      │
│  Codes de récupération:             │
│  ABC123 (visibles en noir)          │
│  DEF456                             │
│  ...                                │
│                                      │
│  Code de vérification:              │
│  [ 000000 ]                         │
│                                      │
│  [  Vérifier  ]                     │
└─────────────────────────────────────┘
```

### État 3 : 2FA activé avec succès (juste après config)
```
┌─────────────────────────────────────┐
│           ✓                         │
│  2FA activée avec succès !          │
│                                      │
│  Votre compte est maintenant        │
│  protégé...                         │
│                                      │
│  ⚠️ Déconnectez-vous et            │
│  reconnectez-vous pour tester       │
│                                      │
│  Retour au tableau de bord          │
└─────────────────────────────────────┘
```

### État 4 : 2FA déjà activé
```
┌─────────────────────────────────────┐
│           ✓                         │
│  2FA est activée                    │
│                                      │
│  Votre compte est protégé par la    │
│  double authentification.           │
│                                      │
│  [  Désactiver le 2FA  ]           │
│                                      │
│  Retour au tableau de bord          │
└─────────────────────────────────────┘
```

## Scénarios de test

### Scénario 1 : Premier setup complet ✅

1. Connecté, visiter `/admin/2fa`
2. Cliquer "Activer la 2FA"
3. Scanner QR code
4. Sauvegarder codes de backup
5. Entrer code à 6 chiffres
6. Voir "2FA activée avec succès"
7. Page se recharge après 2s
8. **Se déconnecter**
9. **Se reconnecter avec Google**
10. → Redirection vers `/auth/verify-2fa` ✅
11. Entrer code 2FA
12. → Accès à `/admin` ✅

### Scénario 2 : Setup incomplet puis désactivation ✅

1. Commencer le setup
2. Scanner QR mais **ne pas terminer** la vérification
3. Fermer la page
4. Revenir sur `/admin/2fa`
5. Si 2FA pas activé → recommencer
6. Si 2FA activé par erreur → "Désactiver le 2FA"
7. Recommencer depuis l'étape 1

### Scénario 3 : Désactivation du 2FA ✅

1. Avec 2FA activé, aller sur `/admin/2fa`
2. Voir "2FA est activée"
3. Cliquer "Désactiver le 2FA"
4. Confirmer dans la popup
5. Page se recharge
6. 2FA désactivé ✅
7. Prochaine connexion → pas de demande de code ✅

### Scénario 4 : Utilisation code de backup ✅

1. À la page `/auth/verify-2fa`
2. Cliquer "Utiliser un code de secours"
3. Entrer un code de backup (ex: ABC123)
4. Connexion réussie ✅
5. Le code ABC123 est supprimé de la DB ✅

## Messages utilisateur

### ✅ Messages de succès

- "2FA activée avec succès !"
- "⚠️ Déconnectez-vous et reconnectez-vous pour tester le 2FA"
- "2FA est activée" (quand déjà configuré)

### ⚠️ Messages d'avertissement

- "Êtes-vous sûr de vouloir désactiver le 2FA ? Cela réduira la sécurité de votre compte."

### ❌ Messages d'erreur

- "Code invalide" (si mauvais code TOTP)
- "Erreur lors de la configuration"
- "Erreur lors de la désactivation"

## API Endpoints

### POST `/api/2fa/setup`
Configure le 2FA (génère secret + QR + backup codes)

### POST `/api/2fa/verify`
Vérifie le code lors de la configuration initiale
→ Active `twoFactorEnabled = true`

### POST `/api/2fa/verify-login`
Vérifie le code lors de la connexion

### POST `/api/2fa/disable` ⭐ NOUVEAU
Désactive le 2FA complètement
```json
Response: { "success": true }
```

## Points clés

### ✅ Ce qui fonctionne maintenant

1. **Détection de l'état 2FA** au chargement de `/admin/2fa`
2. **Option de désactivation** si 2FA déjà activé
3. **Rechargement automatique** après activation/désactivation
4. **Message clair** pour déconnecter/reconnecter
5. **Flow complet** : Setup → Déconnexion → Reconnexion → Vérification → Admin

### ⚠️ Important à retenir

1. **Toujours sauvegarder les codes de backup** lors du setup
2. **Se déconnecter/reconnecter** pour que le 2FA prenne effet
3. **Un code de backup ne peut être utilisé qu'une fois**
4. **Désactiver le 2FA** si problème, puis recommencer

## Prochaines améliorations (optionnel)

1. **Régénérer les codes de backup** sans désactiver le 2FA
2. **Voir combien de codes restants**
3. **Remember device** (30 jours sans demander 2FA)
4. **Email de notification** lors activation/désactivation
5. **Historique des connexions**
