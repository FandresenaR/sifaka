# Configuration Recherche Web - Tavily & SerpAPI

## Vue d'ensemble

La fonctionnalité de recherche web intègre **Tavily AI** et **SerpAPI** pour enrichir les réponses de l'IA avec des résultats de recherche actuels.

## Providers disponibles

### 1. **Tavily AI** (Recommandé pour l'IA)
- **Avantage** : Optimisé pour l'IA, résultats filtrés et pertinents
- **Gratuit** : 1000 requêtes/mois
- **Formule** : `tvly-...`
- **Endpoint** : `https://api.tavily.com/search`
- **Caractéristiques** :
  - Résultats filtrés pour éviter le spam
  - Inclut summaries et contenu précis
  - Réponses structurées en JSON
  - Idéal pour augmenter les prompts IA

**Obtenir une clé** : https://tavily.com

### 2. **SerpAPI** (Métamoteur universel)
- **Avantage** : Métamoteur, accès à Google, Bing, Baidu, etc.
- **Gratuit** : 100 requêtes/mois
- **Format** : Clé alphanumérique standard
- **Endpoint** : `https://serpapi.com/search`
- **Caractéristiques** :
  - Google Search results
  - Organic results structurés
  - Support de multiples moteurs
  - Plus complet pour recherches complexes

**Obtenir une clé** : https://serpapi.com

## Configuration dans Paramètres

### Étapes d'ajout d'une clé API

1. Accédez à **Paramètres** (menu utilisateur)
2. Scrollez jusqu'à **Configuration Recherche Web**
3. Sélectionnez votre provider (Tavily ou SerpAPI)
4. Collez votre clé API
5. Cliquez sur **Sauvegarder**

### Variables d'environnement

```env
# .env.local (web app)
TAVILY_API_KEY=tvly-...
SERPAPI_API_KEY=...
WEB_SEARCH_PROVIDER=tavily  # ou 'serpapi'
```

## Utilisation dans le Chat IA

### Activation de la recherche web

- Par défaut, la recherche web est **désactivée**
- Passez un paramètre dans votre prompt pour l'activer
- Format : `[SEARCH:<query>]` dans votre message

### Exemple d'utilisation

**Message utilisateur** :
```
[SEARCH:dernières nouvelles IA 2024]
Résume les dernières avancées en intelligence artificielle
```

**Réponse IA** :
```
Voici les dernières avancées en IA d'après les résultats web:

🔍 Résultats de recherche:
1. OpenAI annonce GPT-5 avec multimodalité avancée
   - Source: TechCrunch
   - https://techcrunch.com/...

2. Google DeepMind lance Gemini 2.0 avec vision améliorée
   - Source: VentureBeat
   - https://venturebeat.com/...

[Synthèse basée sur les résultats de recherche]
```

## Structure de réponse API

### GET `/api/ai/websearch`

**Request** :
```json
{
  "query": "dernières nouveautés IA",
  "provider": "tavily"  // optionnel
}
```

**Response** :
```json
{
  "results": [
    {
      "title": "OpenAI releases GPT-5",
      "url": "https://example.com",
      "description": "The latest release from OpenAI...",
      "source": "Tavily"
    }
  ],
  "provider": "tavily",
  "query": "dernières nouveautés IA"
}
```

## Sécurité

- Les clés API sont stockées en **variables d'environnement**
- L'accès à l'API `/api/settings/websearch` est **restreint aux SUPER_ADMIN**
- L'accès à `/api/ai/websearch` nécessite une **authentification**
- Les requêtes de recherche sont **loggées** dans les metrics

## Fallback et gestion d'erreurs

### Si la clé API n'est pas configurée
- La recherche web est simplement **désactivée**
- L'IA répond sans résultats web
- Message d'info dans le chat (optionnel)

### Si l'API de recherche échoue (429, 503, timeout)
- **Tavily** : Retourne un array vide `[]`
- **SerpAPI** : Retourne un array vide `[]`
- L'IA procède sans résultats web

### Si le quota est atteint
- **Tavily** : Erreur 429, basculer à SerpAPI automatiquement
- **SerpAPI** : Erreur 429, basculer à Tavily automatiquement

## Estimation de coûts

| Provider | Gratuit | Prix payant |
|----------|---------|------------|
| **Tavily** | 1000/mois | $20 = 10k requêtes |
| **SerpAPI** | 100/mois | $10 = 1000 requêtes |

## Bonnes pratiques

### Pour les super admins
1. ✅ Configurer **Tavily en priorité** (meilleur pour l'IA)
2. ✅ Avoir **SerpAPI en fallback**
3. ✅ Monitorer les quotas mensuels
4. ✅ Configurer les alertes d'usage

### Pour les utilisateurs
1. ✅ Utiliser `[SEARCH:...]` seulement si nécessaire
2. ✅ Être **précis** dans les requêtes de recherche
3. ✅ Ne pas faire de **recherches répétitives**
4. ✅ Vérifier les URLs des résultats

## Dépannage

### "Web Search API not configured"
- Vérifier que la clé API est sauvegardée dans Paramètres
- Vérifier les variables d'environnement en production

### Résultats vides ou incomplets
- Essayer avec une requête plus simple
- Vérifier si le quota n'est pas atteint
- Changer de provider (Tavily ↔ SerpAPI)

### Performance lente
- Les recherches web ajoutent **2-5 secondes** de latence
- Normal, utiliser sans abus
- Considérer un cache des résultats (future feature)

## Roadmap futur

- [ ] Caching des résultats de recherche (Redis)
- [ ] Synthèse automatique des résultats avec l'IA
- [ ] Support de nouvelles sources (Reddit, Twitter, etc.)
- [ ] Recherche par date/langue
- [ ] Intégration Perplexity AI (API)
- [ ] Rate limiting par utilisateur
