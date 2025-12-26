# Web Search Integration - Tavily et SerpAPI

## Vue d'ensemble

La fonctionnalité de recherche web permet au ChatWidget d'accéder à des informations en temps réel via internet. Deux fournisseurs sont supportés :

- **Tavily** : Spécialisé dans la recherche d'informations pour l'IA
- **SerpAPI** : Agrégateur universal de résultats de recherche

## Fonctionnalités

### 1. Configuration dans Paramètres
- Accès à `/admin/security` pour configurer les clés API
- Section dédiée "Web Search" avec deux options
- Possibilité d'utiliser l'une ou l'autre (ou les deux)
- Clés API sécurisées (stockées en base de données)

### 2. Utilisation dans le ChatWidget
- Le ChatWidget peut demander à l'IA de faire des recherches
- Intégration transparente avec les réponses de l'IA
- Résultats enrichis avec des informations réelles

### 3. Types de recherche supportés
- ✅ Recherche web générale
- ✅ Actualités
- ✅ Recherche académique (Tavily)
- ✅ Recherche d'images (SerpAPI)
- ✅ Recherche de vidéos
- ✅ Recherche locale

## Configuration technique

### Variables d'environnement

```env
# Optional - Pour Tavily
TAVILY_API_KEY=tvly-...

# Optional - Pour SerpAPI
SERPAPI_API_KEY=...
```

### Points d'API

#### POST `/api/settings/websearch`
Sauvegarde les clés API de recherche web.

**Paramètres**:
```json
{
  "provider": "tavily" | "serpapi",
  "apiKey": "sk-...",
  "enabled": true
}
```

**Réponse**:
```json
{
  "success": true,
  "message": "Configuration saved"
}
```

#### POST `/api/ai/websearch`
Effectue une recherche web via le fournisseur configuré.

**Paramètres**:
```json
{
  "query": "Que peut faire l'IA?",
  "provider": "tavily",
  "searchType": "general"
}
```

**Réponse Tavily**:
```json
{
  "success": true,
  "provider": "tavily",
  "query": "...",
  "results": [
    {
      "title": "...",
      "url": "...",
      "content": "...",
      "score": 0.95
    }
  ]
}
```

**Réponse SerpAPI**:
```json
{
  "success": true,
  "provider": "serpapi",
  "results": [
    {
      "position": 1,
      "title": "...",
      "link": "...",
      "snippet": "..."
    }
  ]
}
```

## Intégration ChatWidget

### Prompt système avec recherche web

```
Vous êtes un assistant IA utile. Quand l'utilisateur demande une information
actuelle, utilisez l'outil de recherche web pour trouver les infos les plus récentes.
```

### Exemple d'utilisation

```
User: "Quelles sont les dernières actualités sur ChatGPT?"
→ Assistant détecte: demande d'infos actuelles
→ Utilise /api/ai/websearch pour chercher
→ Enrichit la réponse avec les résultats
→ Affiche la réponse avec sources
```

## Différences entre Tavily et SerpAPI

### Tavily
**Avantages**:
- ✅ Conçu pour l'IA et les agents
- ✅ Filtre automatique de contenu pertinent
- ✅ Support académique
- ✅ API plus rapide
- ✅ Meilleur pour les "digital natives"

**Inconvénients**:
- ❌ Moins de sources que SerpAPI
- ❌ Pas d'images

**Cas d'usage**:
- Recherche pour l'IA
- Questions académiques
- Recherche générale rapide

### SerpAPI
**Avantages**:
- ✅ Plus de sources
- ✅ Support images et vidéos
- ✅ Recherche locale
- ✅ Support universels (Google, Bing, Baidu)

**Inconvénients**:
- ❌ Plus lent
- ❌ Beaucoup de résultats (besoin de filtrer)
- ❌ Plus cher

**Cas d'usage**:
- Recherche d'images
- Recherche locale
- Recherche exhaustive
- Support multiples moteurs

## Comment choisir ?

### Utilisez **Tavily** si:
- Vous voulez une recherche rapide et pertinente
- Vous posez des questions académiques
- Vous avez un budget limité
- Vous voulez la meilleure intégration IA

### Utilisez **SerpAPI** si:
- Vous avez besoin d'images ou vidéos
- Vous cherchez des lieux locaux
- Vous avez besoin de exhaustivité
- Vous avez un budget élevé

## Exemple d'intégration complète

### 1. Configuration (User Admin)
```
1. Aller à /admin/security
2. Scrolle vers "Web Search"
3. Choisir Tavily ou SerpAPI
4. Coller la clé API
5. Cliquer "Sauvegarder"
```

### 2. Utilisation (User Chat)
```
1. Ouvrir le ChatWidget
2. Demander une question actuelle
3. L'IA va automatiquement faire une recherche si pertinent
4. Réponse enrichie avec les résultats web
```

### 3. Résultat
```
L'utilisateur voit:
- La réponse de l'IA
- Les sources web utilisées
- Les liens vers les articles complets
```

## Limitations et cas d'usage

### Ce qui fonctionne bien ✅
- Actualités et événements récents
- Données statistiques
- Recherche d'articles
- Informations météo
- Prix et tarifs actuels
- Biographie de personnes publiques
- Résumé de sujets généraux

### Ce qui ne fonctionne pas ❌
- Recherche de contenu payant
- Accès aux données derrière des murs payants
- Crawl de sites dynamiques (JS)
- Recherche de fichiers personnels
- Recherche privée/authentifiée

## Sécurité et confidentialité

### ✅ Points sûrs
- Clés API stockées en base de données sécurisée
- Pas d'exposition des clés au client
- Tous les appels passent par le serveur
- Logs des recherches pour audit
- Validation des requêtes

### ⚠️ À vérifier
- Compliance RGPD si EU
- Politique de rétention des données
- Respect des limites de requête
- Monitoring des abus

## Quotas et tarification

### Tavily
- Plan gratuit: 10 requêtes/mois
- Plan payant: À partir de $50/mois (3000 requêtes)
- Rate limit: 20 requêtes/minute

### SerpAPI
- Plan gratuit: 100 requêtes/mois
- Plan payant: À partir de $15/mois (1000 requêtes)
- Rate limit: 100 requêtes/minute

## Dépannage

### "Clé API invalide"
- Vérifier la clé est correcte
- Vérifier le format (avec "tvly-" pour Tavily, sans préfixe pour SerpAPI)
- Aller au dashboard du fournisseur pour confirmer

### "Rate limit exceeded"
- Attendre quelques minutes
- Mettre à jour le plan
- Implémenter du caching

### "Pas de résultats"
- Vérifier la query
- Essayer une query plus générale
- Changer de fournisseur

## Améliorations futures

1. **Caching des résultats**: Ne pas faire 2 recherches identiques
2. **Multiple providers**: Essayer Tavily puis SerpAPI en fallback
3. **Recherche avancée**: Filtres par date, type, langue
4. **Mémorisation**: Se souvenir des précédentes recherches
5. **Sources fiables**: Filtrer par domaines de confiance
6. **Vérification de faits**: Comparer avec sources multiples

## Exemple d'utilisation avancée

```
// Dans le ChatWidget - Mode recherche web activé
const messages = [
  { role: 'user', content: 'Qui a gagné les Oscars 2024?' }
]

const systemPrompt = `
Tu es un assistant IA. L'utilisateur a activé le mode recherche web.
Utilise l'outil de recherche pour avoir les infos les plus récentes.
Cite tes sources.
`

const response = await chat({
  messages,
  systemPrompt,
  tools: [webSearchTool],
  aiModel: 'google/gemini-2.0-flash-lite'
})

// Réponse enrichie avec:
// - Les gagnants réels
// - Les sources fiables
// - Les liens vers plus d'infos
```

## Conclusion

La recherche web permet au ChatWidget de Sifaka de fournir des informations actuelles et fiables. C'est l'outil parfait pour :
- Enrichir les réponses de l'IA
- Obtenir des infos actuelles
- Citer des sources
- Augmenter la confiance de l'utilisateur

Activez-la dans les paramètres pour en profiter ! 🔍
