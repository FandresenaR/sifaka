# Système Multilingue - Produits FR/EN

**Version** : 0.6.0  
**Date** : 10 novembre 2025  
**Objectif** : Gérer les traductions FR/EN des produits avec sélecteur de langue dans le header

---

## 📋 Vue d'ensemble

Le système multilingue permet de :
- 🌍 **Traductions complètes** : Titre, description, catégorie
- 🔄 **Switch FR/EN** : Toggle dans le header du site
- 💾 **Persistance** : Sauvegarde préférence utilisateur (localStorage + cookie)
- 🎯 **SEO** : URLs multilingues avec hreflang

---

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CMS Backend                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PostgreSQL (Neon)                                  │    │
│  │  Product {                                          │    │
│  │    titleFr: "Huile de Baobab Bio"                   │    │
│  │    titleEn: "Organic Baobab Oil"                    │    │
│  │    descriptionFr: "Pressée à froid..."             │    │
│  │    descriptionEn: "Cold-pressed..."                │    │
│  │    category: "Produits de Consommation" (clé)      │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Routes                                         │    │
│  │  GET /api/products/public?lang=fr                   │    │
│  │  GET /api/products/public?lang=en                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Site Principal                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Header                                             │    │
│  │  ┌──────────────────────────────────────────┐      │    │
│  │  │ Logo  Nav  [🇫🇷 FR ▼ | 🇬🇧 EN]  Panier │      │    │
│  │  └──────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  Context API (LanguageContext)                               │
│  - Langue courante (fr/en)                                   │
│  - Fonction setLanguage()                                    │
│  - Persistance localStorage + cookie                         │
│                          ↓                                   │
│  Pages produits affichent contenu traduit                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma de base de données

### Modifier le modèle Product

**Fichier** : `prisma/schema.prisma`

```prisma
model Product {
  id          String   @id @default(cuid())
  
  // Champs multilingues
  titleFr       String
  titleEn       String
  descriptionFr String   @db.Text
  descriptionEn String   @db.Text
  
  slug        String   @unique  // Slug principal (FR)
  slugEn      String?  @unique  // Slug anglais (optionnel)
  
  // Champs invariants
  price       Int      // Prix de base en MGA
  images      String[]
  category    String   // Clé de catégorie (ex: "Produits de Consommation")
  featured    Boolean  @default(false)
  inStock     Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pricingRules PricingRuleProduct[]

  @@index([slug])
  @@index([slugEn])
  @@index([category])
}
```

### Migration

```bash
# Créer la migration
npx prisma migrate dev --name add_product_translations

# Générer le client
npx prisma generate
```

---

## 🔧 API Backend

### 1. Modifier l'API publique produits

**Modifier** : `src/app/api/products/public/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const lang = searchParams.get("lang") || "fr"; // fr ou en

    const where: any = {
      inStock: true,
    };

    if (category) {
      where.category = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        titleFr: true,
        titleEn: true,
        descriptionFr: true,
        descriptionEn: true,
        slug: true,
        slugEn: true,
        price: true,
        images: true,
        category: true,
        featured: true,
        inStock: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Formater les produits selon la langue
    const formattedProducts = products.map((p) => ({
      id: p.id,
      title: lang === "en" ? p.titleEn : p.titleFr,
      description: lang === "en" ? p.descriptionEn : p.descriptionFr,
      slug: lang === "en" && p.slugEn ? p.slugEn : p.slug,
      price: p.price,
      images: p.images,
      category: p.category,
      categoryTranslated: PRODUCT_CATEGORIES[p.category]?.[lang] || p.category,
      featured: p.featured,
      inStock: p.inStock,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching public products:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export const revalidate = 60;
```

### 2. Modifier l'API détail produit

**Modifier** : `src/app/api/products/public/[slug]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/lib/categories";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "fr";

    // Chercher par slug FR ou EN
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { slugEn: slug },
        ],
      },
      select: {
        id: true,
        titleFr: true,
        titleEn: true,
        descriptionFr: true,
        descriptionEn: true,
        slug: true,
        slugEn: true,
        price: true,
        images: true,
        category: true,
        featured: true,
        inStock: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    // Formater selon la langue
    const formattedProduct = {
      id: product.id,
      title: lang === "en" ? product.titleEn : product.titleFr,
      description: lang === "en" ? product.descriptionEn : product.descriptionFr,
      slug: lang === "en" && product.slugEn ? product.slugEn : product.slug,
      alternateSlug: lang === "en" ? product.slug : product.slugEn, // Pour hreflang
      price: product.price,
      images: product.images,
      category: product.category,
      categoryTranslated: PRODUCT_CATEGORIES[product.category]?.[lang] || product.category,
      featured: product.featured,
      inStock: product.inStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export const revalidate = 60;
```

---

## 🌐 Site Principal - Frontend

### 1. Context API pour la langue

**Créer** : `src/contexts/LanguageContext.tsx`

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Dictionnaire de traductions UI
const translations = {
  fr: {
    "header.products": "Produits",
    "header.blog": "Blog",
    "header.about": "À propos",
    "header.contact": "Contact",
    "header.cart": "Panier",
    "products.title": "Nos Produits",
    "products.all": "Tous les produits",
    "products.viewDetails": "Voir détails",
    "products.featured": "Produits Vedettes",
    "products.viewAll": "Voir tous les produits",
    "products.outOfStock": "Rupture de stock",
    "products.inStock": "En stock",
    "product.addToCart": "Ajouter au panier",
    "product.buyNow": "Commander maintenant",
    "product.description": "Description",
    "product.specifications": "Caractéristiques",
    "location.title": "Zone de livraison",
    "location.allRegions": "Toutes les régions (prix standard)",
    "location.tulearDiscount": "Réduction spéciale Tuléar appliquée",
    "price.from": "À partir de",
    "price.discount": "Réduction",
  },
  en: {
    "header.products": "Products",
    "header.blog": "Blog",
    "header.about": "About",
    "header.contact": "Contact",
    "header.cart": "Cart",
    "products.title": "Our Products",
    "products.all": "All products",
    "products.viewDetails": "View details",
    "products.featured": "Featured Products",
    "products.viewAll": "View all products",
    "products.outOfStock": "Out of stock",
    "products.inStock": "In stock",
    "product.addToCart": "Add to cart",
    "product.buyNow": "Buy now",
    "product.description": "Description",
    "product.specifications": "Specifications",
    "location.title": "Delivery zone",
    "location.allRegions": "All regions (standard price)",
    "location.tulearDiscount": "Special Tuléar discount applied",
    "price.from": "From",
    "price.discount": "Discount",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    // Charger la langue depuis cookie ou localStorage
    const savedLang = Cookies.get("language") || localStorage.getItem("language");
    if (savedLang === "en" || savedLang === "fr") {
      setLanguageState(savedLang);
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("en")) {
        setLanguageState("en");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    Cookies.set("language", lang, { expires: 365 }); // 1 an
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
```

### 2. Sélecteur de langue dans le Header

**Créer** : `src/components/LanguageSwitcher.tsx`

```typescript
"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  const currentLang = languages.find((l) => l.code === language);

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    setLanguage(code as "fr" | "en");
    setIsOpen(false);
    // Recharger la page pour appliquer les traductions
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Changer de langue"
      >
        <span className="text-xl">{currentLang?.flag}</span>
        <span className="font-medium text-gray-700">{currentLang?.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                language === lang.code ? "bg-green-50" : ""
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium text-gray-700">{lang.label}</span>
              {language === lang.code && (
                <svg className="w-5 h-5 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Header du site avec sélecteur

**Créer** : `src/components/Header.tsx`

```typescript
"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Zoahary Baobab</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/produits" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              {t("header.products")}
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              {t("header.blog")}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              {t("header.about")}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              {t("header.contact")}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-medium">{t("header.cart")}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### 4. Wrapper Layout avec Context

**Modifier** : `src/app/layout.tsx`

```typescript
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Zoahary Baobab - Produits naturels de Madagascar",
  description: "Découvrez nos produits à base de baobab de Madagascar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <LanguageProvider>
          <Header />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
```

### 5. Service API avec langue

**Modifier** : `src/services/products.ts`

```typescript
import { Product } from "@/types/product";

const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_URL || "https://zoahary-cms.vercel.app";

export async function getAllProducts(language: "fr" | "en" = "fr"): Promise<Product[]> {
  const response = await fetch(
    `${CMS_API_URL}/api/products/public?lang=${language}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des produits");
  }

  return response.json();
}

export async function getProductBySlug(
  slug: string,
  language: "fr" | "en" = "fr"
): Promise<Product | null> {
  const response = await fetch(
    `${CMS_API_URL}/api/products/public/${slug}?lang=${language}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Erreur lors de la récupération du produit");
  }

  return response.json();
}
```

### 6. Page produits avec traduction

**Modifier** : `src/app/produits/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/products";
import ProductCard from "@/components/ProductCard";
import LocationSelector from "@/components/LocationSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Product } from "@/types/product";

export default function ProduitsPage() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllProducts(language).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{t("products.title")}</h1>

      <LocationSelector onCityChange={setSelectedCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} city={selectedCity} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun produit trouvé.
        </div>
      )}
    </div>
  );
}
```

### 7. ProductCard avec traductions

**Modifier** : `src/components/ProductCard.tsx`

```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  product: Product;
  city?: string;
}

export default function ProductCard({ product, city }: ProductCardProps) {
  const { t } = useLanguage();

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative aspect-square bg-gray-200">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">No image</span>
          </div>
        )}

        {product.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ⭐
          </div>
        )}

        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {t("products.outOfStock")}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mb-2">
          {product.categoryTranslated || product.category}
        </div>

        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {product.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">
            {product.price.toLocaleString()} Ar
          </span>
          <span className="text-sm text-gray-500">
            {t("products.viewDetails")} →
          </span>
        </div>
      </div>
    </Link>
  );
}
```

---

## 🔄 Migration des données existantes

### Script de migration

**Créer** : `scripts/migrate-products-i18n.js`

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Traductions manuelles des 6 produits existants
const translations = {
  "huile-baobab-bio": {
    titleEn: "Organic Baobab Oil",
    descriptionEn:
      "Pure cold-pressed baobab oil, 100% organic. Rich in vitamins A, D, E, and F. Perfect for skin and hair care. Nourishing, moisturizing, and regenerating properties.",
    slugEn: "organic-baobab-oil",
  },
  "poudre-baobab-pure": {
    titleEn: "Pure Baobab Powder",
    descriptionEn:
      "Natural baobab fruit powder. Excellent source of vitamin C, fiber, and antioxidants. Ideal for smoothies, yogurts, and pastries.",
    slugEn: "pure-baobab-powder",
  },
  "miel-baobab": {
    titleEn: "Baobab Honey",
    descriptionEn:
      "Pure honey harvested from baobab flowers. Unique taste with floral notes. Natural antioxidant and antibacterial properties.",
    slugEn: "baobab-honey",
  },
  "muesli-baobab": {
    titleEn: "Baobab Muesli",
    descriptionEn:
      "Energy-boosting muesli mix with baobab powder, oats, dried fruits, and local seeds. Perfect for a nutritious breakfast.",
    slugEn: "baobab-muesli",
  },
  "pate-fruits-baobab": {
    titleEn: "Baobab Fruit Paste",
    descriptionEn:
      "Natural fruit paste made from baobab pulp. Sweet and tangy taste, rich in vitamin C. Great as a spread or in desserts.",
    slugEn: "baobab-fruit-paste",
  },
  "savon-baobab-bio": {
    titleEn: "Organic Baobab Soap",
    descriptionEn:
      "Natural handmade soap with baobab oil. Gentle cleansing, moisturizing for all skin types. Suitable for sensitive skin.",
    slugEn: "organic-baobab-soap",
  },
};

async function main() {
  console.log("🌍 Migration des produits vers système multilingue...\n");

  const products = await prisma.product.findMany();

  for (const product of products) {
    const translation = translations[product.slug];

    if (!translation) {
      console.log(`⚠️  Pas de traduction pour: ${product.slug}`);
      continue;
    }

    // Mise à jour avec traductions
    await prisma.product.update({
      where: { id: product.id },
      data: {
        titleFr: product.title, // Garder titre actuel comme FR
        titleEn: translation.titleEn,
        descriptionFr: product.description, // Garder description actuelle comme FR
        descriptionEn: translation.descriptionEn,
        slugEn: translation.slugEn,
      },
    });

    console.log(`✅ ${product.title} → ${translation.titleEn}`);
  }

  console.log("\n🎉 Migration terminée !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Exécution** :
```bash
node scripts/migrate-products-i18n.js
```

---

## 🎨 Interface Admin - Formulaire bilingue

### Modifier la page admin produits

**Modifier** : `src/app/admin/products/page.tsx`

Ajouter des champs séparés FR/EN :

```typescript
const [formData, setFormData] = useState({
  titleFr: "",
  titleEn: "",
  descriptionFr: "",
  descriptionEn: "",
  slug: "",
  slugEn: "",
  price: 0,
  images: [""],
  category: "",
  featured: false,
  inStock: true,
});

// Dans le formulaire JSX
<div className="grid grid-cols-2 gap-4">
  {/* Colonne FR */}
  <div>
    <h3 className="text-lg font-semibold mb-3 text-blue-600">🇫🇷 Français</h3>
    
    <label className="block mb-2 font-medium">Titre FR *</label>
    <input
      type="text"
      value={formData.titleFr}
      onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg mb-4"
      required
    />

    <label className="block mb-2 font-medium">Description FR *</label>
    <textarea
      value={formData.descriptionFr}
      onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg mb-4"
      rows={4}
      required
    />

    <label className="block mb-2 font-medium">Slug FR *</label>
    <input
      type="text"
      value={formData.slug}
      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg mb-4"
      placeholder="huile-baobab-bio"
      required
    />
  </div>

  {/* Colonne EN */}
  <div>
    <h3 className="text-lg font-semibold mb-3 text-red-600">🇬🇧 English</h3>
    
    <label className="block mb-2 font-medium">Title EN *</label>
    <input
      type="text"
      value={formData.titleEn}
      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg mb-4"
      required
    />

    <label className="block mb-2 font-medium">Description EN *</label>
    <textarea
      value={formData.descriptionEn}
      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg mb-4"
      rows={4}
      required
    />

    <label className="block mb-2 font-medium">Slug EN</label>
    <input
      type="text"
      value={formData.slugEn}
      onChange={(e) => setFormData({ ...formData, slugEn: e.target.value })}
      className="w-full px-4 py-2 border rounded-lg mb-4"
      placeholder="organic-baobab-oil"
    />
  </div>
</div>
```

---

## 📦 Dépendances à installer

```bash
# Cookie management
npm install js-cookie
npm install --save-dev @types/js-cookie
```

---

## ✅ Checklist d'implémentation

### Backend CMS

- [ ] Modifier `prisma/schema.prisma` (champs titleFr, titleEn, etc.)
- [ ] Migration : `npx prisma migrate dev --name add_product_translations`
- [ ] Générer client : `npx prisma generate`
- [ ] Modifier API `/api/products/public` (paramètre lang)
- [ ] Modifier API `/api/products/public/[slug]` (support slugEn)
- [ ] Créer script migration `scripts/migrate-products-i18n.js`
- [ ] Exécuter migration : `node scripts/migrate-products-i18n.js`
- [ ] Modifier formulaire admin (champs bilingues)

### Site Principal

- [ ] Installer dépendances : `npm install js-cookie @types/js-cookie`
- [ ] Créer `LanguageContext.tsx` avec dictionnaire traductions
- [ ] Créer composant `LanguageSwitcher.tsx`
- [ ] Créer/modifier `Header.tsx` avec sélecteur langue
- [ ] Wrapper `layout.tsx` avec `LanguageProvider`
- [ ] Modifier service `products.ts` (paramètre language)
- [ ] Modifier pages produits pour utiliser `useLanguage()`
- [ ] Modifier `ProductCard` avec traductions
- [ ] Tester switch FR ↔ EN

### Tests

- [ ] Créer produit bilingue dans admin
- [ ] Vérifier API retourne bonnes traductions selon lang
- [ ] Toggle FR/EN dans header → Contenu change
- [ ] Préférence langue persistée (refresh page)
- [ ] SEO : vérifier balises hreflang
- [ ] Mobile : dropdown langue responsive

---

## 🌍 URLs multilingues (SEO)

### Option 1 : Query parameter (actuel)

```
FR: /produits?lang=fr
EN: /produits?lang=en
```

### Option 2 : Next.js i18n (recommandé)

**next.config.js**
```javascript
module.exports = {
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
};
```

**URLs générées**
```
FR: /fr/produits
EN: /en/produits

FR: /fr/produits/huile-baobab-bio
EN: /en/produits/organic-baobab-oil
```

### Balises hreflang

```html
<head>
  <link rel="alternate" hreflang="fr" href="https://zoahary-baobab.mg/fr/produits/huile-baobab-bio" />
  <link rel="alternate" hreflang="en" href="https://zoahary-baobab.mg/en/produits/organic-baobab-oil" />
  <link rel="alternate" hreflang="x-default" href="https://zoahary-baobab.mg/fr/produits/huile-baobab-bio" />
</head>
```

---

## 🎯 Exemple de workflow

### 1. Utilisateur visite le site

```
1. Page charge → LanguageContext détecte langue
   - Cookie "language" existe ? → Utiliser
   - Sinon : navigator.language (fr/en)
   - Défaut : "fr"

2. Header affiche : 🇫🇷 FR ▼

3. Produits affichés en français
```

### 2. Utilisateur clique sur 🇫🇷 FR

```
1. Dropdown s'ouvre :
   ✓ 🇫🇷 Français
     🇬🇧 English

2. Clic sur English

3. setLanguage("en") appelé
   - localStorage.setItem("language", "en")
   - Cookie.set("language", "en")
   - window.location.reload()

4. Page recharge en anglais
   - Header : 🇬🇧 EN ▼
   - Produits : titres/descriptions EN
   - Catégories : "Consumer Products", "Cosmetics"
```

---

## 📊 Tableau de traductions produits

| Slug FR | Titre FR | Slug EN | Titre EN |
|---------|----------|---------|----------|
| `huile-baobab-bio` | Huile de Baobab Bio | `organic-baobab-oil` | Organic Baobab Oil |
| `poudre-baobab-pure` | Poudre de Baobab Pure | `pure-baobab-powder` | Pure Baobab Powder |
| `miel-baobab` | Miel de Baobab | `baobab-honey` | Baobab Honey |
| `muesli-baobab` | Muesli au Baobab | `baobab-muesli` | Baobab Muesli |
| `pate-fruits-baobab` | Pâte de Fruits Baobab | `baobab-fruit-paste` | Baobab Fruit Paste |
| `savon-baobab-bio` | Savon au Baobab Bio | `organic-baobab-soap` | Organic Baobab Soap |

---

**Résumé** : Système multilingue complet avec Context API, sélecteur header, persistance cookie/localStorage, traductions produits FR/EN, et interface admin bilingue.
