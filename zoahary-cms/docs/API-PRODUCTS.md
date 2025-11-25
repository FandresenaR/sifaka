# API Publique Produits - Documentation

**Version** : 2.0.0  
**Base URL** : `https://zoahary-cms.vercel.app`  
**Authentification** : Aucune (API publique)

---

## 📦 Endpoints disponibles

### 1. Récupérer tous les produits

**Endpoint** : `GET /api/products/public`

**Description** : Retourne la liste de tous les produits en stock avec traductions et prix calculés selon la géolocalisation.

**Query Parameters** :
- `lang` (optionnel) : Langue de retour (`"fr"` ou `"en"`, défaut: `"fr"`)
- `city` (optionnel) : Ville pour calculer les réductions géolocalisées (ex: `"Tuléar"`)
- `category` (optionnel) : Filtrer par catégorie
  - Valeurs : `"Produits de Consommation"`, `"Cosmétiques"`, `"Autres"`
- `featured` (optionnel) : Filtrer les produits vedettes
  - Valeurs : `"true"`

**Exemples** :
```bash
# Tous les produits en français
GET https://zoahary-cms.vercel.app/api/products/public?lang=fr

# Produits en anglais
GET https://zoahary-cms.vercel.app/api/products/public?lang=en

# Produits avec prix Tuléar (réduction appliquée)
GET https://zoahary-cms.vercel.app/api/products/public?lang=fr&city=Tuléar

# Produits vedettes en anglais
GET https://zoahary-cms.vercel.app/api/products/public?lang=en&featured=true

# Cosmétiques avec prix Tuléar
GET https://zoahary-cms.vercel.app/api/products/public?category=Cosmétiques&city=Tuléar

# Cosmétiques vedettes en anglais
GET https://zoahary-cms.vercel.app/api/products/public?category=Cosmétiques&featured=true&lang=en
```

**Réponse** : `200 OK`
```json
[
  {
    "id": "clxxx123",
    "title": "Huile de Baobab Bio",
    "slug": "huile-baobab-bio",
    "description": "Huile de baobab pressée à froid, 100% pure et bio.",
    "price": 40000,
    "originalPrice": 45000,
    "discount": 5000,
    "discountReason": "Réduction Tuléar -10%",
    "images": [
      "https://res.cloudinary.com/domw8mfsy/image/upload/v123/huile-baobab.jpg"
    ],
    "category": "Cosmétiques",
    "categoryTranslated": "Cosmetics",
    "featured": true,
    "inStock": true,
    "isNew": true,
    "comingSoon": false,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

**Notes** :
- `title` et `description` sont retournés dans la langue demandée (`lang`)
- `slug` correspond au slug de la langue demandée (`slug` pour FR, `slugEn` pour EN)
- `price` est le prix final après réduction (si applicable avec `city`)
- `originalPrice` n'apparaît que si une réduction est appliquée
- `discount` est le montant de la réduction en Ariary
- `discountReason` indique la raison de la réduction (ex: "Réduction Tuléar -10%")
- `categoryTranslated` contient la traduction de la catégorie dans la langue demandée

**Cache** : ISR avec revalidation toutes les 60 secondes

---

### 2. Récupérer un produit par slug

**Endpoint** : `GET /api/products/public/[slug]`

**Description** : Retourne les détails d'un produit spécifique par son slug (français ou anglais).

**Paramètres** :
- `slug` (path parameter) : Le slug unique du produit (FR ou EN)

**Exemples** :
```bash
# Slug français
GET https://zoahary-cms.vercel.app/api/products/public/huile-baobab-bio

# Slug anglais
GET https://zoahary-cms.vercel.app/api/products/public/organic-baobab-oil

# Autres produits
GET https://zoahary-cms.vercel.app/api/products/public/poudre-baobab-pure
GET https://zoahary-cms.vercel.app/api/products/public/savon-baobab-bio
```

**Réponse** : `200 OK`
```json
{
  "id": "clxxx123",
  "titleFr": "Huile de Baobab Bio",
  "titleEn": "Organic Baobab Oil",
  "descriptionFr": "Huile de baobab pressée à froid, 100% pure et bio. Riche en vitamines A, D, E et F. Parfaite pour les soins de la peau et des cheveux.",
  "descriptionEn": "Cold-pressed baobab oil, 100% pure and organic. Rich in vitamins A, D, E and F. Perfect for skin and hair care.",
  "slug": "huile-baobab-bio",
  "slugEn": "organic-baobab-oil",
  "price": 45000,
  "images": [
    "https://res.cloudinary.com/domw8mfsy/image/upload/v123/huile-baobab-1.jpg",
    "https://res.cloudinary.com/domw8mfsy/image/upload/v123/huile-baobab-2.jpg"
  ],
  "category": "Cosmétiques",
  "featured": true,
  "inStock": true,
  "isNew": true,
  "comingSoon": false,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

**Notes** :
- Cette route retourne **tous les champs multilingues** (titleFr, titleEn, descriptionFr, descriptionEn, slug, slugEn)
- Le site principal doit choisir la langue à afficher côté client
- Accepte les slugs français ET anglais

**Erreur** : `404 Not Found`
```json
{
  "error": "Produit introuvable"
}
```

---

### 3. Calculer les prix avec réductions géolocalisées

**Endpoint** : `POST /api/pricing/calculate`

**Description** : Calcule les prix des produits avec les réductions applicables selon la ville.

**Body** :
```json
{
  "productIds": ["clxxx123", "clxxx456"],
  "city": "Tuléar"
}
```

**Réponse** : `200 OK`
```json
{
  "products": [
    {
      "productId": "clxxx123",
      "basePrice": 45000,
      "finalPrice": 40500,
      "discount": 4500,
      "discountType": "PERCENT",
      "discountValue": 10,
      "ruleName": "Réduction Tuléar -10%"
    }
  ]
}
```

**Cache** : ISR avec revalidation toutes les 60 secondes

---

## 🏷️ Badges disponibles

Les produits peuvent avoir plusieurs badges pour améliorer l'affichage :

### `featured` (Vedette)
- **Badge** : ⭐ Vedette
- **Couleur** : Jaune / Doré
- **Usage** : Produits mis en avant, recommandés

### `isNew` (Nouveau)
- **Badge** : 🆕 NOUVEAU
- **Couleur** : Vert clair / Emeraude
- **Usage** : Produits récemment ajoutés (moins de 30 jours)

### `comingSoon` (Bientôt disponible)
- **Badge** : 🔜 BIENTÔT DISPONIBLE
- **Couleur** : Bleu / Info
- **Usage** : Produits en préparation, pas encore en vente
- **Note** : Ces produits ont `inStock: false` mais sont retournés par l'API

### `!inStock` (Rupture de stock)
- **Badge** : ❌ RUPTURE DE STOCK
- **Couleur** : Rouge
- **Usage** : Produits temporairement indisponibles
- **Note** : Ces produits ne sont PAS retournés par l'API publique (sauf si `comingSoon: true`)

---

## 📊 Modèle de données Product

```typescript
interface Product {
  id: string;              // Identifiant unique (cuid)
  titleFr: string;         // Nom du produit (français)
  titleEn: string;         // Product name (English)
  descriptionFr: string;   // Description complète (français)
  descriptionEn: string;   // Full description (English)
  slug: string;            // URL-friendly FR (ex: "huile-baobab-bio")
  slugEn: string;          // URL-friendly EN (ex: "organic-baobab-oil")
  price: number;           // Prix en Ariary (MGA)
  images: string[];        // URLs Cloudinary
  category: string;        // Catégorie ("Produits de Consommation", "Cosmétiques", "Autres")
  featured: boolean;       // Produit vedette
  inStock: boolean;        // Disponibilité en stock
  isNew: boolean;          // Badge "Nouveau"
  comingSoon: boolean;     // Badge "Bientôt disponible"
  createdAt: string;       // Date de création (ISO 8601)
  updatedAt: string;       // Dernière mise à jour (ISO 8601)
}

// Réponse de l'API /api/products/public (avec lang et city)
interface ProductPublicResponse {
  id: string;
  title: string;           // Traduit selon lang
  description: string;     // Traduit selon lang
  slug: string;            // Slug dans la langue demandée
  price: number;           // Prix final (après réduction si city fourni)
  originalPrice?: number;  // Prix original (si réduction appliquée)
  discount?: number;       // Montant de la réduction
  discountReason?: string; // Raison de la réduction (ex: "Réduction Tuléar -10%")
  images: string[];
  category: string;
  categoryTranslated: string; // Catégorie traduite
  featured: boolean;
  inStock: boolean;
  isNew: boolean;
  comingSoon: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 Exemple d'intégration React

### Récupérer tous les produits

```typescript
// services/products.ts
const CMS_URL = "https://zoahary-cms.vercel.app";

export async function getAllProducts(lang: "fr" | "en" = "fr", city?: string) {
  const params = new URLSearchParams({ lang });
  if (city) params.append("city", city);
  
  const response = await fetch(`${CMS_URL}/api/products/public?${params}`, {
    next: { revalidate: 60 }, // Cache Next.js
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des produits");
  }
  
  return response.json();
}

export async function getFeaturedProducts(lang: "fr" | "en" = "fr", city?: string) {
  const params = new URLSearchParams({ lang, featured: "true" });
  if (city) params.append("city", city);
  
  const response = await fetch(`${CMS_URL}/api/products/public?${params}`, {
    next: { revalidate: 60 },
  });
  
  return response.json();
}

export async function getProductsByCategory(
  category: string, 
  lang: "fr" | "en" = "fr",
  city?: string
) {
  const params = new URLSearchParams({ 
    lang, 
    category: encodeURIComponent(category) 
  });
  if (city) params.append("city", city);
  
  const response = await fetch(
    `${CMS_URL}/api/products/public?${params}`,
    { next: { revalidate: 60 } }
  );
  
  return response.json();
}
```

### Récupérer un produit par slug

```typescript
// services/products.ts
export async function getProductBySlug(slug: string) {
  const response = await fetch(
    `${CMS_URL}/api/products/public/${slug}`,
    { next: { revalidate: 60 } }
  );
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Erreur lors de la récupération du produit");
  }
  
  return response.json();
}
```

### Composant ProductCard avec badges

```tsx
// components/ProductCard.tsx
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-200">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Badges en haut à droite */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ⭐ VEDETTE
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              🆕 NOUVEAU
            </span>
          )}
          {product.comingSoon && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              🔜 BIENTÔT
            </span>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mb-2">
          {product.category}
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {product.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          {product.comingSoon ? (
            <span className="text-blue-600 font-semibold">Bientôt disponible</span>
          ) : (
            <span className="text-2xl font-bold text-green-600">
              {product.price.toLocaleString()} Ar
            </span>
          )}
          <span className="text-sm text-gray-500">Voir détails →</span>
        </div>
      </div>
    </Link>
  );
}
```

---

## 🔄 Catégories disponibles

```typescript
export const PRODUCT_CATEGORIES = {
  "Produits de Consommation": {
    fr: "Produits de Consommation",
    en: "Consumer Products",
    icon: "🍯",
  },
  "Cosmétiques": {
    fr: "Cosmétiques",
    en: "Cosmetics",
    icon: "💄",
  },
  "Autres": {
    fr: "Autres",
    en: "Others",
    icon: "📦",
  },
};
```

---

## 📝 Notes importantes

1. **Multilinguisme** : Tous les produits ont des champs FR et EN (titleFr/titleEn, descriptionFr/descriptionEn, slug/slugEn)
2. **Réductions géolocalisées** : Utilisez le paramètre `city` pour obtenir les prix avec réductions (ex: `city=Tuléar`)
3. **Cache ISR** : L'API utilise ISR (Incremental Static Regeneration) avec revalidation toutes les 60 secondes
4. **CORS** : L'API est accessible depuis n'importe quel domaine
5. **Filtrage automatique** : Seuls les produits `inStock: true` sont retournés (sauf si `comingSoon: true`)
6. **Tri** : Les produits sont triés par : vedette > nouveau > date de création
7. **Images** : Toutes les images sont hébergées sur Cloudinary (CDN optimisé)
8. **Prix** : Tous les prix sont en Ariary malgache (MGA)
9. **Slugs bilingues** : Les deux routes `/huile-baobab-bio` (FR) et `/organic-baobab-oil` (EN) fonctionnent

---

## 🌍 Villes supportées pour les réductions

Les villes actuellement supportées pour le paramètre `city` :
- `Tuléar` / `Toliara` : Réduction de 10% sur certains produits
- (D'autres villes peuvent être ajoutées via l'admin du CMS)

---

## 🚀 Migration Prisma

Pour mettre à jour votre base de données avec le nouveau schéma :

```bash
# Exécuter la migration
npx prisma migrate dev --name add_multilingual_and_pricing

# Générer le client Prisma
npx prisma generate

# Pousser vers la base de données (production)
npx prisma db push
```

**Schema Prisma** :
```prisma
model Product {
  id             String   @id @default(cuid())
  titleFr        String
  titleEn        String
  descriptionFr  String
  descriptionEn  String
  slug           String   @unique
  slugEn         String?  @unique
  price          Float
  images         String[]
  category       String
  inStock        Boolean  @default(true)
  featured       Boolean  @default(false)
  isNew          Boolean  @default(false)
  comingSoon     Boolean  @default(false)
  authorId       String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  author         User     @relation(fields: [authorId], references: [id])
  pricingRules   PricingRuleProduct[]

  @@index([slug])
  @@index([slugEn])
  @@index([category])
}

model PricingRule {
  id          String               @id @default(cuid())
  name        String               // Ex: "Réduction Tuléar -10%"
  geoCities   String[]             // Ex: ["Tuléar", "Toliara"]
  enabled     Boolean              @default(true)
  priority    Int                  @default(0)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt
  products    PricingRuleProduct[]

  @@index([enabled])
}

model PricingRuleProduct {
  id            String      @id @default(cuid())
  productId     String
  ruleId        String
  discountType  String      // "FIXED" ou "PERCENT"
  discountValue Float       // Montant fixe ou pourcentage
  product       Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  rule          PricingRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@unique([productId, ruleId])
}
```

---

## 📞 Support

Pour toute question sur l'API :
- Email : contact@zoahary-baobab.mg
- CMS : https://zoahary-cms.vercel.app

**Dernière mise à jour** : 10 novembre 2025
