# Documentation - Intégration IA avec OpenRouter

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Composants](#composants)
5. [API Endpoints](#api-endpoints)
6. [Fonctionnalités](#fonctionnalités)
7. [Gestion des erreurs](#gestion-des-erreurs)
8. [Sécurité](#sécurité)
9. [Tests](#tests)
10. [Évolutions futures](#évolutions-futures)

---

## Vue d'ensemble

Le système de chat IA intégré permet aux utilisateurs d'interagir avec des modèles d'intelligence artificielle gratuits via OpenRouter directement depuis le CMS Zoahary Baobab.

### Caractéristiques principales

- ✅ **Chat flottant** accessible sur toutes les pages
- ✅ **Modèles IA gratuits** d'OpenRouter
- ✅ **Groupement intelligent** des nouveaux modèles (< 2 mois)
- ✅ **Formatage avancé** : code, HTML, tableaux Markdown
- ✅ **Notifications toast** pour les erreurs et événements
- ✅ **Basculement automatique** entre modèles en cas d'erreur
- ✅ **Upload de fichiers** (images, PDF, texte)
- ✅ **Mode agrandissement** pour une meilleure expérience
- ✅ **Mode sombre** et design responsive

---

## Architecture

### Schéma de flux

```
┌─────────────────┐
│  FloatingChat   │ ← Bouton flottant (toutes les pages)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ChatWindow    │ ← Interface principale
└────────┬────────┘
         │
         ├──► ModelSelector ← Sélection de modèle
         ├──► MessageContent ← Rendu des messages
         ├──► Toast ← Notifications
         └──► FileUpload ← Gestion des fichiers
                │
                ▼
         ┌──────────────┐
         │  API Routes  │
         └──────┬───────┘
                │
                ├──► /api/chat/models (GET)
                ├──► /api/chat/send (POST)
                └──► /api/chat/upload (POST)
                       │
                       ▼
                ┌──────────────┐
                │  OpenRouter  │ ← API externe
                └──────────────┘
```

### Structure des fichiers

```
src/
├── components/
│   ├── FloatingChat.tsx      # Bouton flottant + gestion état
│   ├── ChatWindow.tsx         # Interface principale du chat
│   ├── ModelSelector.tsx      # Sélection et groupement des modèles
│   ├── MessageContent.tsx     # Rendu formaté des messages
│   └── Toast.tsx              # Système de notifications
├── types/
│   └── chat.ts                # Interfaces TypeScript
└── app/api/chat/
    ├── models/route.ts        # Liste des modèles gratuits
    ├── send/route.ts          # Envoi de messages
    └── upload/route.ts        # Upload de fichiers
```

---

## Configuration

### Variables d'environnement

Créer un fichier `.env.local` avec :

```bash
# OpenRouter API Key (obligatoire)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx

# Optionnel : URL de base OpenRouter
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Obtenir une clé API OpenRouter

1. Créer un compte sur [OpenRouter](https://openrouter.ai/)
2. Aller dans **Settings** → **API Keys**
3. Créer une nouvelle clé API
4. Copier la clé dans `.env.local`

### Configuration du cache

Les modèles sont mis en cache pendant 1 heure :

```typescript
// src/app/api/chat/models/route.ts
export const revalidate = 3600; // 1 heure
```

---

## Composants

### 1. FloatingChat

**Fichier** : `src/components/FloatingChat.tsx`

Bouton flottant qui gère l'ouverture/fermeture de la fenêtre de chat.

```tsx
<FloatingChat />
```

**Props** : Aucune

**État** :
- `isOpen` : Boolean - Fenêtre ouverte/fermée

**Fonctionnalités** :
- Bouton fixe en bas à droite
- Animation d'apparition
- Badge de notification (optionnel)

---

### 2. ChatWindow

**Fichier** : `src/components/ChatWindow.tsx`

Interface principale du chat avec toutes les fonctionnalités.

```tsx
<ChatWindow onClose={() => setIsOpen(false)} />
```

**Props** :
- `onClose` : () => void - Callback de fermeture

**État** :
- `messages` : ChatMessage[] - Historique des messages
- `input` : string - Texte en cours de saisie
- `selectedModel` : string - Modèle IA sélectionné
- `loading` : boolean - État de chargement
- `selectedFile` : ChatFile | null - Fichier attaché
- `isExpanded` : boolean - Mode agrandissement
- `availableModels` : string[] - Liste des modèles disponibles

**Fonctionnalités** :
- Envoi de messages texte
- Upload de fichiers
- Sélection de modèle IA
- Mode agrandissement (plein écran)
- Scroll automatique vers le bas
- Gestion des erreurs avec retry automatique

---

### 3. ModelSelector

**Fichier** : `src/components/ModelSelector.tsx`

Sélecteur de modèles IA avec groupement intelligent.

```tsx
<ModelSelector 
  selectedModel={selectedModel}
  onModelChange={setSelectedModel}
/>
```

**Props** :
- `selectedModel` : string - Modèle actuellement sélectionné
- `onModelChange` : (modelId: string) => void - Callback de changement

**Fonctionnalités** :
- Récupération automatique des modèles gratuits
- Groupement par date :
  - 🆕 **Nouveaux modèles** (< 2 mois) avec badge ⭐
  - 📋 **Tous les modèles**
- Bouton de rafraîchissement
- Gestion des erreurs de chargement
- Tooltip avec description du modèle

**Détection des nouveaux modèles** :

```typescript
const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

const isNewModel = (model: ChatModel): boolean => {
  if (model.created) {
    const modelDate = new Date(model.created * 1000);
    return modelDate > twoMonthsAgo;
  }
  return false;
};
```

---

### 4. MessageContent

**Fichier** : `src/components/MessageContent.tsx`

Composant de rendu formaté des messages avec support avancé.

```tsx
<MessageContent content={message.content} role={message.role} />
```

**Props** :
- `content` : string - Contenu du message
- `role` : 'user' | 'assistant' - Rôle de l'émetteur

**Fonctionnalités** :

#### Blocs de code

Détection automatique des blocs de code :

````markdown
```html
<div>Hello World</div>
```
````

**Rendu** :
- Coloration syntaxique
- Bouton "Copier"
- Toggle Code/Preview pour HTML/XML
- Support de nombreux langages

#### Tableaux Markdown

Détection automatique des tableaux :

```markdown
| En-tête 1 | En-tête 2 |
|-----------|-----------|
| Cellule 1 | Cellule 2 |
```

**Rendu** :
- Tableau HTML stylisé
- Bordures et hover effects
- Bouton "Copier" pour le Markdown brut
- Scroll horizontal pour tableaux larges

#### Texte simple

Texte formaté avec retours à la ligne préservés.

---

### 5. Toast

**Fichier** : `src/components/Toast.tsx`

Système de notifications avec 4 types.

```tsx
const { toasts, addToast, removeToast } = useToast();

// Ajouter une notification
addToast('error', 'Une erreur est survenue');
addToast('warning', 'Attention !');
addToast('info', 'Information');
addToast('success', 'Succès !');
```

**Types de toast** :
- `error` : ⚠️ Rouge - Erreurs critiques
- `warning` : ⚡ Jaune - Avertissements
- `info` : ℹ️ Bleu - Informations
- `success` : ✓ Vert - Succès

**Fonctionnalités** :
- Auto-fermeture après 5 secondes
- Bouton de fermeture manuelle
- Animation slide-in depuis la droite
- Empilage vertical

---

## API Endpoints

### GET /api/chat/models

Récupère la liste des modèles IA gratuits d'OpenRouter.

**Requête** :
```http
GET /api/chat/models
```

**Réponse** :
```json
{
  "models": [
    {
      "id": "meta-llama/llama-3.2-3b-instruct:free",
      "name": "Llama 3.2 3B Instruct (free)",
      "description": "Meta's Llama 3.2 3B model",
      "created": 1698796800
    }
  ]
}
```

**Cache** : 1 heure (3600s)

**Filtrage** : Uniquement les modèles avec `pricing.prompt === "0"`

---

### POST /api/chat/send

Envoie un message à l'IA et retourne la réponse.

**Requête** :
```http
POST /api/chat/send
Content-Type: application/json

{
  "model": "meta-llama/llama-3.2-3b-instruct:free",
  "messages": [
    {
      "role": "user",
      "content": "Bonjour, comment vas-tu ?",
      "timestamp": 1700000000000,
      "fileData": {
        "name": "image.png",
        "type": "image/png",
        "data": "base64...",
        "size": 12345
      }
    }
  ]
}
```

**Réponse** :
```json
{
  "message": "Bonjour ! Je vais bien, merci. Comment puis-je vous aider ?"
}
```

**Gestion des erreurs** :
- `400` : Données invalides
- `401` : Non authentifié
- `429` : Limite de requêtes atteinte
- `503` : Modèle indisponible
- `500` : Erreur serveur

---

### POST /api/chat/upload

Upload un fichier pour le chat.

**Requête** :
```http
POST /api/chat/upload
Content-Type: multipart/form-data

file: [binary data]
```

**Réponse** :
```json
{
  "name": "document.pdf",
  "type": "application/pdf",
  "data": "base64encodedcontent...",
  "size": 245678
}
```

**Limites** :
- Taille max : 5MB
- Types acceptés : images/*, application/pdf, text/*

**Validation** :
```typescript
// Taille
if (file.size > 5 * 1024 * 1024) {
  return { error: 'File too large (max 5MB)' };
}

// Type
const allowedTypes = ['image/', 'application/pdf', 'text/'];
if (!allowedTypes.some(type => file.type.startsWith(type))) {
  return { error: 'Invalid file type' };
}
```

---

## Fonctionnalités

### 1. Groupement des modèles

Les modèles sont automatiquement groupés en deux catégories :

**🆕 Nouveaux modèles** (< 2 mois)
- Badge ⭐ pour identification rapide
- Basé sur le timestamp `created`
- Mis en avant dans le sélecteur

**📋 Tous les modèles**
- Modèles existants (> 2 mois)
- Liste complète des modèles disponibles

### 2. Basculement automatique de modèle

En cas d'erreur API, le système bascule automatiquement vers un autre modèle :

```typescript
const sendMessageWithRetry = async (
  userMessage: ChatMessage,
  modelToUse: string,
  retryCount = 0
): Promise<boolean> => {
  try {
    // Envoi du message
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({ model: modelToUse, messages })
    });

    // Vérification des erreurs
    if (response.status === 429) throw new Error('RATE_LIMIT');
    if (response.status === 503) throw new Error('MODEL_UNAVAILABLE');
    
    return true;
  } catch (error) {
    // Basculement automatique
    if (retryCount < 3) {
      const nextModel = switchToNextModel(modelToUse);
      if (nextModel) {
        addToast('warning', `Basculement vers ${nextModel}...`);
        return await sendMessageWithRetry(userMessage, nextModel, retryCount + 1);
      }
    }
    
    addToast('error', 'Tous les modèles sont indisponibles');
    return false;
  }
};
```

**Erreurs gérées** :
- `429` : Rate limit → Essai avec autre modèle
- `503` : Modèle indisponible → Essai avec autre modèle
- Quota épuisé → Essai avec autre modèle

**Stratégie** :
- Jusqu'à 3 tentatives
- Rotation circulaire des modèles
- Notification toast à chaque basculement

### 3. Mode agrandissement

Le chat peut être agrandi en plein écran :

```tsx
const [isExpanded, setIsExpanded] = useState(false);

// Classe dynamique
className={`fixed ${
  isExpanded 
    ? 'inset-4'  // Plein écran avec marges
    : 'bottom-20 right-4 w-96 h-[600px]'  // Taille normale
} transition-all duration-300`}
```

**Bouton** :
- Icône expand/collapse
- Transition fluide (300ms)
- Préserve l'état du chat

### 4. Upload de fichiers

Support de plusieurs types de fichiers :

**Images** :
- PNG, JPEG, GIF, WebP
- Conversion en base64
- Prévisualisation dans le message

**Documents** :
- PDF : Conversion en base64
- Texte : Lecture directe du contenu
- Markdown : Lecture directe

**Processus** :
1. Sélection du fichier
2. Validation (taille, type)
3. Upload vers `/api/chat/upload`
4. Conversion (base64 ou texte)
5. Attachement au message
6. Envoi à l'IA

---

## Gestion des erreurs

### Stratégie globale

```typescript
// 1. Toast pour l'utilisateur
addToast('error', 'Message d'erreur clair');

// 2. Log console pour debug
console.error('Détails techniques:', error);

// 3. Message dans le chat
setMessages(prev => [...prev, {
  role: 'assistant',
  content: 'Désolé, une erreur est survenue.',
  timestamp: Date.now()
}]);

// 4. Retry automatique si possible
if (canRetry) {
  await retryWithDifferentModel();
}
```

### Types d'erreurs

| Code | Erreur | Action |
|------|--------|--------|
| 400 | Données invalides | Toast + validation côté client |
| 401 | Non authentifié | Redirection login |
| 429 | Rate limit | Basculement automatique |
| 503 | Service indisponible | Basculement automatique |
| 500 | Erreur serveur | Toast + retry manuel |

---

## Sécurité

### Protections implémentées

✅ **Clé API côté serveur uniquement**
```typescript
// ❌ JAMAIS côté client
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// ✅ Toujours dans les API routes
export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  // ...
}
```

✅ **Validation des entrées**
```typescript
// Validation taille fichier
if (file.size > 5 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'File too large' },
    { status: 400 }
  );
}

// Validation type
const allowedTypes = ['image/', 'application/pdf', 'text/'];
if (!allowedTypes.some(type => file.type.startsWith(type))) {
  return NextResponse.json(
    { error: 'Invalid file type' },
    { status: 400 }
  );
}
```

✅ **Protection CSRF**
- NextAuth gère automatiquement
- Tokens de session sécurisés

✅ **Sanitization**
```typescript
// Pas d'injection HTML
const sanitizedContent = content.replace(/<script>/gi, '');
```

### Bonnes pratiques

1. **Ne jamais exposer la clé API**
2. **Valider toutes les entrées utilisateur**
3. **Limiter la taille des fichiers**
4. **Logger les erreurs (pas les données sensibles)**
5. **Utiliser HTTPS en production**

---

## Tests

### Tests fonctionnels

**Checklist de test** :

- [ ] Ouverture/fermeture du chat
- [ ] Récupération des modèles gratuits
- [ ] Rafraîchissement de la liste
- [ ] Groupement nouveaux/anciens modèles
- [ ] Envoi de message texte
- [ ] Upload d'image
- [ ] Upload de PDF
- [ ] Upload de fichier texte
- [ ] Formatage code (HTML, JS, Python)
- [ ] Aperçu HTML fonctionnel
- [ ] Rendu tableau Markdown
- [ ] Bouton copier (code)
- [ ] Bouton copier (tableau)
- [ ] Toast error
- [ ] Toast warning
- [ ] Toast success
- [ ] Basculement automatique de modèle
- [ ] Mode agrandissement
- [ ] Mode sombre
- [ ] Responsive mobile
- [ ] Responsive desktop

### Tests API

```bash
# Test récupération modèles
curl https://localhost:3000/api/chat/models

# Test envoi message
curl -X POST https://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/llama-3.2-3b-instruct:free",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Test upload fichier
curl -X POST https://localhost:3000/api/chat/upload \
  -F "file=@test.png"
```

---

## Évolutions futures

### Phase 2 : Historique des conversations

- Sauvegarde en base de données (Prisma)
- Modèle `Conversation` et `Message`
- Reprise de conversations précédentes
- Export en PDF/Markdown

### Phase 3 : Fonctionnalités avancées

- **Streaming** : Réponses en temps réel
- **Plus de fichiers** : Excel, Word, etc.
- **Génération d'images** : DALL-E, Stable Diffusion
- **Analyse de documents** : Extraction de texte PDF

### Phase 4 : Personnalisation

- **Thèmes** : Personnalisation des couleurs
- **Raccourcis clavier** : Ctrl+K pour ouvrir
- **Commandes slash** : /help, /clear, /export
- **Templates** : Prompts pré-définis

### Phase 5 : Collaboration

- **Partage de conversations**
- **Commentaires** sur les réponses
- **Évaluation** des réponses IA
- **Favoris** : Sauvegarder les meilleures réponses

---

## Support et contribution

### Rapporter un bug

Créer une issue avec :
- Description du problème
- Steps to reproduce
- Comportement attendu vs actuel
- Screenshots si applicable
- Console logs

### Demander une fonctionnalité

Créer une issue avec :
- Description de la fonctionnalité
- Cas d'usage
- Mockups si possible

---

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Dernière mise à jour** : 24 novembre 2025  
**Version** : 0.7.0
