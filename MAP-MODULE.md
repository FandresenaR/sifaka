# MAP Module - Shuffle Life

## Vue d'ensemble

Le **MAP Module** est le composant principal du projet **Shuffle Life**. Il utilise l'IA d'OpenRouter pour découvrir des activités aléatoires dans un rayon de **200 km** autour de l'utilisateur, peu importe où il se trouve.

## Fonctionnalités

### 1. Génération d'Activités
- **Localisation automatique**: Récupère les coordonnées GPS de l'utilisateur
- **Rayon de recherche**: 200 km par défaut (configurable entre 10 et 500 km)
- **Types d'activités multiples**: Restaurants, Parcs, Musées, Sports, Divertissement, Événements, etc.
- **Modèles IA supportés**:
  - GPT-4 Turbo (recommandé)
  - Google Gemini 2.0 Flash
  - Claude 3.5 Sonnet

### 2. Information détaillée
Chaque activité générée contient:
- **Nom** de l'activité
- **Type** d'activité
- **Localisation** (latitude/longitude)
- **Distance** estimée depuis l'utilisateur
- **Description** courte (1-2 phrases)
- **Note** sur 5 (si applicable)
- **Horaires** d'ouverture

### 3. Interface Utilisateur
L'accès au MAP Module se fait via :
- **Page dédiée**: `/admin/map-module`
- **Chat Widget** avec mode MAP Module (bouton MapPin)
- **Dashboard Admin**: Carte "MAP Module - Shuffle Life"

## Architecture Technique

### Fichiers principaux

```
/apps/web/
├── app/
│   ├── admin/
│   │   └── map-module/
│   │       └── page.tsx           # Interface de gestion MAP Module
│   └── api/
│       └── ai/
│           └── map-module/
│               ├── generate/      # API de génération d'activités
│               └── config/        # API de configuration
├── components/
│   ├── ChatWidget.tsx             # Intégration du mode MAP
│   └── ActivitiesDisplay.tsx      # Affichage des activités
└── lib/
    └── hooks/
        └── useMapModule.ts        # Hook de gestion du MAP Module
```

### Points d'API

#### POST `/api/ai/map-module/generate`
Génère les activités basées sur la localisation de l'utilisateur.

**Paramètres**:
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "maxDistance": 200,
  "activityTypes": ["restaurants", "parks", "museums"],
  "aiModel": "openai/gpt-4-turbo"
}
```

**Réponse**:
```json
{
  "success": true,
  "activities": [
    {
      "id": "activity_123",
      "name": "Musée du Louvre",
      "type": "museums",
      "latitude": 48.8606,
      "longitude": 2.3352,
      "distance": 5.2,
      "description": "Le plus grand musée du monde",
      "rating": 4.8
    }
  ],
  "count": 8,
  "searchParams": {...}
}
```

#### POST `/api/ai/map-module/config`
Sauvegarde la configuration du module.

**Paramètres**:
```json
{
  "name": "Shuffle Life - Map Module",
  "description": "Find random activities within 200km",
  "maxDistance": 200,
  "activityTypes": ["restaurants", "parks"],
  "aiModel": "openai/gpt-4-turbo",
  "enableGeolocation": true
}
```

## Integration avec le Chat Widget

### Mode MAP Module

Quand le mode MAP est activé:

1. L'utilisateur peut demander à générer des activités
2. Le système récupère sa localisation
3. L'IA génère une liste d'activités pertinentes
4. Les activités s'affichent dans une section formatée
5. L'utilisateur peut copier chaque activité en JSON

**Exemple d'utilisation** :
```
User: "Génère des activités intéressantes près de moi"
→ System détecte: Mode MAP activé
→ Récupère la localisation
→ Appelle l'IA pour générer 8 activités
→ Affiche les résultats en cartes interactives
```

## Intégration avec Shuffle Life

### Cas d'usage principal

1. **Utilisateur lance l'app** → Se connecte
2. **Lance le chat** → Clique sur le bouton MapPin
3. **Demande des activités** → "Trouve-moi des trucs cool à faire"
4. **Reçoit 8 activités** → Localisées et décrites par l'IA
5. **Les explore** → Via la carte ou la liste
6. **Choisit une activité** → Lance une expérience

### Workflow de génération

```
Utilisateur
    ↓
Mode MAP Widget
    ↓
Récupération GPS
    ↓
Appel IA OpenRouter
    ↓
Génération activités (JSON)
    ↓
Affichage formaté (cartes)
    ↓
Action utilisateur (copie/partage)
```

## Configuration requise

### Variables d'environnement

```env
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-...

# Google Maps (optionnel, pour améliorations futures)
GOOGLE_MAPS_API_KEY=...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

### Permissions requises

- **Géolocalisation**: L'utilisateur doit autoriser l'accès à sa position GPS
- **Authentification**: L'utilisateur doit être connecté
- **API OpenRouter**: Une clé API OpenRouter valide doit être configurée

## Limitations et contraintes

### Ce que l'IA PEUT faire:
✅ Générer des listes d'activités réalistes  
✅ Assigner des coordonnées géographiques pertinentes  
✅ Créer des descriptions engageantes  
✅ Varier les types d'activités  
✅ Adapter la distance estimée au rayon de recherche  

### Ce que l'IA NE PEUT PAS faire:
❌ Créer une véritable interface de carte  
❌ Accéder à des données réelles de Google Maps ou Yelp  
❌ Générer des images ou vidéos  
❌ Implémenter de la logique de navigation GPS  
❌ Gérer les paiements ou réservations  
❌ Intégrer des APIs externes (directement)  

## Améliorations futures

1. **Intégration Google Maps**: Afficher les activités sur une vraie carte
2. **Système de notation**: Mémoriser les activités aimées
3. **Historique**: Garder trace des activités déjà proposées
4. **Filtres avancés**: Prix, horaires, accessibilité
5. **Intégration Yelp/TripAdvisor**: Données réelles
6. **Système de réservation**: Booker directement via l'app
7. **Social**: Partager les activités avec des amis

## Débogage

### Erreur: "Localisation requise"
- Vérifier que le navigateur a la permission de localiser
- Essayer en incognito si bloqué en normal
- Vérifier que le protocole HTTPS est utilisé (ou localhost:3000)

### Erreur: "Modèle non disponible"
- Vérifier que la clé OpenRouter API est configurée
- Aller à `/admin/security` pour configurer
- Vérifier que le modèle n'est pas deprecated

### Activités irréalistes
- Augmenter le `temperature` pour plus de variation
- Diminuer pour plus de cohérence
- Vérifier les coordonnées d'entrée GPS

## Performance

- **Temps de réponse**: 3-8 secondes (selon le modèle IA)
- **Nombre d'activités**: 5-8 par défaut
- **Cache**: Pas de cache actuellement (chaque demande = nouvel appel IA)
- **Limite de requêtes**: Dépend de OpenRouter (gratuit = ~1000/jour)

## Sécurité

- ✅ Authentification requise (NextAuth)
- ✅ Clé API OpenRouter sécurisée côté serveur
- ✅ Validation des paramètres (distance 10-500 km)
- ✅ Limite de taille pour les réponses
- ⚠️ À ajouter: Rate limiting par utilisateur
