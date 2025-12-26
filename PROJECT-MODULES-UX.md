# Project Modules Management - Guide UX/UI

## Vue d'ensemble

Les modules IA générés peuvent maintenant être **installés directement dans un projet**. Cela offre une UX complète pour :
1. Découvrir les modules disponibles
2. Les installer dans le projet
3. Les configurer et les gérer
4. Les activer/désactiver selon les besoins

## Architecture UX

### 1. Vue des Projets (`/admin/projects`)

**Affichage amélioré** :
- Chaque carte projet affiche un **badge "⚡ X"** indiquant le nombre de modules installés
- Au survol, le badge est visible avec une info-bulle
- Les projets sans modules n'affichent pas de badge

**Exemple** :
```
┌─────────────────────────────────┐
│ 🛍️  Mon Projet E-commerce       │
│ /mon-projet                      │
│                                  │
│ Mon meilleur projet              │
│ ────────────────────────────────│
│ ACTIVE        ⚡ 3    7 déc     │
└─────────────────────────────────┘
```

### 2. Page Détails Projet (`/admin/projects/[slug]`)

**Ajout de navigation** :
- Deux onglets : "Paramètres" et "Modules IA"
- Permet de basculer facilement entre la config du projet et la gestion des modules

```
┌──────────────────────┐
│ Paramètres │ Modules IA │
└──────────────────────┘
```

### 3. Page Gestion des Modules (`/admin/projects/[slug]/modules`)

**Interface complète avec 3 sections** :

#### A. Barre supérieure
- Titre : "Modules du Projet"
- Bouton "Installer un Module" (si des modules disponibles)
- Affiche le nombre de modules installés

#### B. Colonne gauche (2/3) - Liste des modules installés
- Chaque module affiche :
  - ✓ Nom et status (Actif/Inactif)
  - Description
  - Date d'installation
  - Modèle IA utilisé
  - Boutons d'actions :
    - **Détails** : voir le schéma complet (côté droit)
    - **Copier Schema** : copier le JSON en clipboard
    - **Télécharger** : exporter en fichier JSON
    - **Corbeille** : désinstaller le module

#### C. Colonne droite (1/3) - Détails du module
- Affiche les infos complètes du module sélectionné
- Schéma (code formaté)
- Routes API disponibles
- Validations associées
- Sections collapsibles pour éviter la surcharge

#### D. État vide
- Si aucun module : message avec bouton "Installer le premier module"
- Affiche l'icône Zap avec texte encourageant

### 4. Modal Installation (`/admin/projects/[slug]/modules`)

**Lors du clic sur "Installer un Module"** :
- Affiche la liste des modules **non installés**
- Pour chaque module :
  - Nom
  - Description
  - Bouton "Installer"
- Si tous les modules sont installés : message "Tous les modules sont déjà installés"

## Flux utilisateur complet

### Scénario 1 : Installer un module dans un projet

```
1. Admin va dans /admin/projects
2. Clique sur un projet (par ex. "Mon Projet")
3. Atterrit sur /admin/projects/[slug]
4. Voit les onglets "Paramètres" | "Modules IA"
5. Clique sur "Modules IA"
6. Voit la page de gestion des modules
7. Clique sur "Installer un Module"
8. Sélectionne un module disponible
9. Clique "Installer"
10. Le module apparaît dans la liste
11. Peut maintenant le configurer
```

### Scénario 2 : Activer/Désactiver un module

```
1. Admin est sur /admin/projects/[slug]/modules
2. Voit un module dans la liste
3. Clique sur le bouton status (✓ Actif / ○ Inactif)
4. Le statut change immédiatement
5. Le module s'active ou se désactive dans le projet
```

### Scénario 3 : Voir le détail d'un module

```
1. Admin est sur /admin/projects/[slug]/modules
2. Clique sur "Détails" d'un module
3. Le détail s'affiche à droite avec :
   - Schéma complet
   - Routes API
   - Validations
4. Peut copier le schéma d'un clic
5. Peut télécharger le module en JSON
```

### Scénario 4 : Désinstaller un module

```
1. Admin est sur /admin/projects/[slug]/modules
2. Clique sur l'icône corbeille
3. Confirmation : "Êtes-vous sûr?"
4. Module supprimé de la liste
5. Disparaît de la page de gestion
```

## Éléments visuels

### Couleurs et icônes
- **Modules IA** : Gradient ambre/orange (Zap icon)
- **Statut Actif** : Badge vert avec checkmark
- **Statut Inactif** : Badge gris neutre
- **Actions** : Gris par défaut, rouge pour la suppression

### Mise en page responsive
- **Desktop** (1024px+) : Grille 2/3 + 1/3
- **Tablet** (768px) : Modules en full width, détails en modal
- **Mobile** : Interface mobile-first avec détails en expandable

## Données affichées par module

### Liste des modules
```
┌────────────────────────────────────────┐
│ Gestion des Produits                   │ ✓ Actif  │
│ Gérer l'inventaire de produits        │
│ Installé le: 7 déc • Modèle: GPT-4   │
│ [Détails] [Copier] [Télécharger] [Del]│
└────────────────────────────────────────┘
```

### Détails du module
```
Gestion des Produits
│
├─ Description
│  Gérer l'inventaire de produits...
│
├─ Schéma
│  ```json
│  { "name": "string", "price": 0 }
│  ```
│  [Copier]
│
├─ Routes API
│  GET /products
│  POST /products
│  PUT /products/:id
│
└─ Validations
   ✓ name (min:3, max:100)
   ✓ price (min:0)
```

## API utilisées

### GET `/api/projects/[slug]/modules`
Récupère tous les modules installés dans le projet.

**Réponse** :
```json
{
  "success": true,
  "modules": [
    {
      "id": "pm_123",
      "projectId": "proj_123",
      "moduleId": "module_456",
      "enabled": true,
      "installedAt": "2024-12-09T10:00:00Z",
      "module": {
        "id": "module_456",
        "moduleName": "Product",
        "displayName": "Gestion des Produits",
        "schema": { ... },
        "routes": { ... },
        "validations": { ... }
      }
    }
  ]
}
```

### POST `/api/projects/[slug]/modules`
Installe un module dans le projet.

**Body** :
```json
{
  "moduleId": "module_456"
}
```

### PATCH `/api/projects/[slug]/modules/[moduleId]`
Active ou désactive un module du projet.

**Body** :
```json
{
  "enabled": true
}
```

### DELETE `/api/projects/[slug]/modules/[moduleId]`
Désinstalle un module du projet.

## Cas d'usage avancés

### 1. Modules recommandés par type de projet
Si le projet est de type "ECOMMERCE", afficher un badge "Recommandé" sur les modules pertinents (Produits, Commandes, etc.)

### 2. Dépendances entre modules
Si le module B dépend du module A, empêcher l'installation de B sans A.

### 3. Configuration personnalisée par module
Permettre à l'utilisateur de configurer le module avant installation (ex: "Ajouter les champs personnalisés?")

### 4. Export/Import complet
Exporter toute la config du projet (paramètres + modules) et l'importer dans un autre projet.

### 5. Historique des installations
Garder trace des modules installés/désinstallés (audit trail)

## Restrictions et permissions

- ✅ Le propriétaire du projet peut **installer** des modules
- ✅ Le propriétaire du projet peut **activer/désactiver** des modules
- ✅ Le propriétaire du projet peut **désinstaller** des modules
- ✅ Super admin peut gérer les modules de **n'importe quel** projet
- ❌ Les utilisateurs normaux **ne peuvent pas** accéder à cette page
- ❌ L'installation est **limitée** à un module par ID par projet

## Performance et optimisations

1. **Lazy loading** : Les détails des modules ne se chargent que sur demande
2. **Caching** : La liste des modules est cachée pendant 5 minutes
3. **Pagination** : Si 50+ modules, paginer la liste d'installation
4. **Recherche** : Ajouter une barre de recherche si 20+ modules

## Prochaines améliorations

1. 🎨 Thème custom pour chaque module (couleur, icône)
2. 📊 Dashboard avec stats par module (utilisation, erreurs)
3. 🔄 Workflow d'activation progressive (draft → test → production)
4. 🔐 Permissions granulaires par module
5. 📝 Documentation inline (help popover pour chaque configuration)
6. 🚀 One-click deployment (module → live en un clic)

## Conclusion

L'intégration des modules dans les projets offre une UX **complète et intuitive** pour :
- Découvrir les capacités
- Installer facilement
- Configurer et gérer
- Exporter et réutiliser

C'est un système **scalable** qui peut grandir avec le nombre de modules. ✅
