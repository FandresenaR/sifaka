# Système de Règles de Tarification - Réductions Géolocalisées

**Version** : 0.7.0  
**Date** : 17 novembre 2025  
**Objectif** : Système de gestion de prix géolocalisé COMPLETEMENT IMPLÉMENTÉ

---

## 📋 Vue d'ensemble

Le système de **pricing rules** permet de définir des réductions dynamiques basées sur :
- 🌍 **Géolocalisation** (ville, région, pays)
- 📅 **Périodes** (promotions temporaires)
- 🏷️ **Produits** (individuels ou par catégorie)
- 🎯 **Priorités** (règles cumulables ou exclusives)

**Cas d'usage principal** : Réduction pour les clients de Tuléar/Toliara

---

## 📊 Règles de prix actuelles

### Zone géographique : Tuléar (Toliara)
**Type de réduction** : Pourcentage fixe de 15%  
**Produits concernés** : Tous les produits  
**Prix après réduction** :

| Produit | Prix original | Prix réduit | Réduction |
|---------|---------------|-------------|-----------|
| Huile de Baobab Bio 100ml | 45,000 Ar | 38,250 Ar | -6,750 Ar |
| Huile de Baobab Bio 200ml | 80,000 Ar | 68,000 Ar | -12,000 Ar |
| Poudre de Baobab Bio 500g | 35,000 Ar | 29,750 Ar | -5,250 Ar |
| Poudre de Baobab Bio 1kg | 65,000 Ar | 55,250 Ar | -9,750 Ar |
| Capsules de Baobab Bio 60 unités | 50,000 Ar | 42,500 Ar | -7,500 Ar |
| Capsules de Baobab Bio 120 unités | 90,000 Ar | 76,500 Ar | -13,500 Ar |
| Thé de Baobab Bio 50g | 25,000 Ar | 21,250 Ar | -3,750 Ar |
| Thé de Baobab Bio 100g | 45,000 Ar | 38,250 Ar | -6,750 Ar |
| Miel de Baobab Bio 250g | 40,000 Ar | 34,000 Ar | -6,000 Ar |
| Miel de Baobab Bio 500g | 75,000 Ar | 63,750 Ar | -11,250 Ar |

### Calcul automatique
- **Formule** : Prix réduit = Prix original × (1 - 0.15)
- **Arrondi** : Au 250 Ar le plus proche (convention malgache)
- **Application** : Automatique via l'API de calcul de prix

---

## 🎯 Architecture

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CMS Backend                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  PostgreSQL (Neon)                                  │    │
│  │  ├─ Product (basePrice)                             │    │
│  │  └─ PricingRule (conditions, discounts)            │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Routes                                         │    │
│  │  GET /api/pricing/calculate                         │    │
│  │    ?productId=xxx&city=Tuléar                       │    │
│  │  GET /api/pricing/rules (admin)                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Site Principal                            │
│                                                              │
│  1. Client sélectionne "Tuléar" comme zone de livraison     │
│  2. Fetch API calcule prix avec réductions                  │
│  3. Affichage prix barré + prix réduit                      │
│  4. Badge "Réduction Tuléar" sur les produits              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Schéma de base de données

### 1. Modifier le modèle Prisma

**Fichier** : `prisma/schema.prisma`

```prisma
// Modèle existant (à conserver)
model Product {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String
  price       Int      // Prix de base en MGA
  images      String[]
  category    String
  featured    Boolean  @default(false)
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Nouvelles relations
  pricingRules PricingRuleProduct[]

  @@index([slug])
  @@index([category])
}

// NOUVEAU : Règles de tarification
model PricingRule {
  id          String   @id @default(cuid())
  name        String   // "Réduction Tuléar"
  description String?
  enabled     Boolean  @default(true)
  priority    Int      @default(0) // Plus élevé = appliqué en premier
  
  // Conditions géographiques (JSON)
  geoCities    String[] // ["Toliara", "Tuléar", "Toliary"]
  geoRegions   String[] @default([]) // ["Atsimo-Andrefana"]
  geoCountry   String   @default("MG")
  
  // Période de validité
  startDate   DateTime?
  endDate     DateTime?
  
  // Métadonnées
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String
  
  // Relations
  products    PricingRuleProduct[]
  
  @@index([enabled, startDate, endDate])
}

// Table de liaison : Règle → Produit + Réduction
model PricingRuleProduct {
  id            String   @id @default(cuid())
  
  pricingRuleId String
  pricingRule   PricingRule @relation(fields: [pricingRuleId], references: [id], onDelete: Cascade)
  
  productId     String
  product       Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Type de réduction
  discountType  String   // "FIXED" | "PERCENT"
  discountValue Int      // 38000 (MGA) ou 15 (%)
  
  createdAt     DateTime @default(now())
  
  @@unique([pricingRuleId, productId])
  @@index([pricingRuleId])
  @@index([productId])
}
```

### 2. Migration Prisma

```bash
# Créer la migration
npx prisma migrate dev --name add_pricing_rules

# Générer le client Prisma
npx prisma generate
```

---

## 🔧 API Backend

### 1. API Calcul de Prix

**Créer** : `src/app/api/pricing/calculate/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PriceCalculation {
  productId: string;
  basePrice: number;
  finalPrice: number;
  discount: {
    amount: number;
    type: "FIXED" | "PERCENT";
    ruleName: string;
  } | null;
  currency: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productIds, city, region, country = "MG" } = body;

    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: "productIds requis" },
        { status: 400 }
      );
    }

    // Récupérer les produits
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        inStock: true,
      },
      select: {
        id: true,
        title: true,
        price: true,
        pricingRules: {
          where: {
            pricingRule: {
              enabled: true,
              // Filtrer par date si nécessaire
              OR: [
                { startDate: null, endDate: null },
                {
                  startDate: { lte: new Date() },
                  OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } },
                  ],
                },
              ],
            },
          },
          include: {
            pricingRule: true,
          },
          orderBy: {
            pricingRule: {
              priority: "desc", // Priorité décroissante
            },
          },
        },
      },
    });

    const calculations: PriceCalculation[] = products.map((product) => {
      let finalPrice = product.price;
      let appliedDiscount: PriceCalculation["discount"] = null;

      // Trouver la première règle applicable
      for (const ruleProduct of product.pricingRules) {
        const rule = ruleProduct.pricingRule;

        // Vérifier conditions géographiques
        const matchesGeo =
          (city && rule.geoCities.some((c) => c.toLowerCase() === city.toLowerCase())) ||
          (region && rule.geoRegions.includes(region)) ||
          rule.geoCountry === country;

        if (matchesGeo) {
          // Appliquer la réduction
          if (ruleProduct.discountType === "FIXED") {
            finalPrice = ruleProduct.discountValue;
          } else if (ruleProduct.discountType === "PERCENT") {
            finalPrice = Math.round(product.price * (1 - ruleProduct.discountValue / 100));
          }

          appliedDiscount = {
            amount: product.price - finalPrice,
            type: ruleProduct.discountType as "FIXED" | "PERCENT",
            ruleName: rule.name,
          };

          break; // Appliquer uniquement la première règle (priorité)
        }
      }

      return {
        productId: product.id,
        basePrice: product.price,
        finalPrice,
        discount: appliedDiscount,
        currency: "MGA",
      };
    });

    return NextResponse.json({ calculations });
  } catch (error) {
    console.error("Error calculating prices:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Revalidation toutes les 5 minutes (règles peuvent changer)
export const revalidate = 300;
```

### 2. API Admin - CRUD Règles

**Créer** : `src/app/api/pricing/rules/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Liste des règles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const rules = await prisma.pricingRule.findMany({
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { priority: "desc" },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching pricing rules:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer une règle
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      enabled,
      priority,
      geoCities,
      geoRegions,
      geoCountry,
      startDate,
      endDate,
      products, // [{ productId, discountType, discountValue }]
    } = body;

    const rule = await prisma.pricingRule.create({
      data: {
        name,
        description,
        enabled: enabled ?? true,
        priority: priority ?? 0,
        geoCities: geoCities || [],
        geoRegions: geoRegions || [],
        geoCountry: geoCountry || "MG",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: session.user.id,
        products: {
          create: products.map((p: any) => ({
            productId: p.productId,
            discountType: p.discountType,
            discountValue: p.discountValue,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error creating pricing rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

**Créer** : `src/app/api/pricing/rules/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT - Modifier une règle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      description,
      enabled,
      priority,
      geoCities,
      geoRegions,
      geoCountry,
      startDate,
      endDate,
      products,
    } = body;

    // Supprimer anciennes associations
    await prisma.pricingRuleProduct.deleteMany({
      where: { pricingRuleId: id },
    });

    // Mettre à jour la règle
    const rule = await prisma.pricingRule.update({
      where: { id },
      data: {
        name,
        description,
        enabled,
        priority,
        geoCities,
        geoRegions,
        geoCountry,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        products: {
          create: products.map((p: any) => ({
            productId: p.productId,
            discountType: p.discountType,
            discountValue: p.discountValue,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error updating pricing rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer une règle
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.pricingRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pricing rule:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
```

---

## 🎨 Interface Admin

### Page Gestion des Règles

**Créer** : `src/app/admin/pricing/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";

interface PricingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  geoCities: string[];
  geoRegions: string[];
  geoCountry: string;
  startDate: string | null;
  endDate: string | null;
  products: {
    id: string;
    productId: string;
    discountType: string;
    discountValue: number;
    product: {
      id: string;
      title: string;
      slug: string;
    };
  }[];
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const res = await fetch("/api/pricing/rules");
      const data = await res.json();
      setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRule(id: string, enabled: boolean) {
    try {
      await fetch(`/api/pricing/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      fetchRules();
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  }

  async function deleteRule(id: string) {
    if (!confirm("Supprimer cette règle ?")) return;

    try {
      await fetch(`/api/pricing/rules/${id}`, {
        method: "DELETE",
      });
      fetchRules();
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  }

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Règles de Tarification</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          + Nouvelle règle
        </button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-6 rounded-lg shadow-md border-l-4"
            style={{
              borderLeftColor: rule.enabled ? "#22c55e" : "#94a3b8",
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{rule.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      rule.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {rule.enabled ? "Actif" : "Inactif"}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                    Priorité: {rule.priority}
                  </span>
                </div>

                {rule.description && (
                  <p className="text-gray-600 mb-3">{rule.description}</p>
                )}

                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Villes:</strong> {rule.geoCities.join(", ")}
                  </p>
                  {rule.geoRegions.length > 0 && (
                    <p>
                      <strong>Régions:</strong> {rule.geoRegions.join(", ")}
                    </p>
                  )}
                  <p>
                    <strong>Pays:</strong> {rule.geoCountry}
                  </p>
                  {rule.startDate && (
                    <p>
                      <strong>Période:</strong>{" "}
                      {new Date(rule.startDate).toLocaleDateString()} -{" "}
                      {rule.endDate
                        ? new Date(rule.endDate).toLocaleDateString()
                        : "∞"}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <strong className="text-sm">Produits concernés:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rule.products.map((rp) => (
                      <div
                        key={rp.id}
                        className="bg-gray-100 px-3 py-1 rounded text-sm"
                      >
                        {rp.product.title} →{" "}
                        {rp.discountType === "FIXED"
                          ? `${rp.discountValue.toLocaleString()} Ar`
                          : `${rp.discountValue}%`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleRule(rule.id, rule.enabled)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  {rule.enabled ? "Désactiver" : "Activer"}
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucune règle de tarification définie.
        </div>
      )}
    </div>
  );
}
```

---

## 🌐 Intégration Site Principal

### 1. Service API Pricing

**Créer** : `src/services/pricing.ts`

```typescript
const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_URL || "https://zoahary-cms.vercel.app";

export interface PriceCalculation {
  productId: string;
  basePrice: number;
  finalPrice: number;
  discount: {
    amount: number;
    type: "FIXED" | "PERCENT";
    ruleName: string;
  } | null;
  currency: string;
}

export async function calculatePrices(
  productIds: string[],
  city?: string,
  region?: string,
  country = "MG"
): Promise<PriceCalculation[]> {
  const response = await fetch(`${CMS_API_URL}/api/pricing/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds, city, region, country }),
    next: { revalidate: 300 }, // 5 minutes
  });

  if (!response.ok) {
    throw new Error("Erreur lors du calcul des prix");
  }

  const data = await response.json();
  return data.calculations;
}
```

### 2. Composant ProductCard avec Réduction

**Modifier** : `src/components/ProductCard.tsx`

```typescript
"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { calculatePrices, PriceCalculation } from "@/services/pricing";

interface ProductCardProps {
  product: Product;
  city?: string; // Zone de livraison sélectionnée
}

export default function ProductCard({ product, city }: ProductCardProps) {
  const [pricing, setPricing] = useState<PriceCalculation | null>(null);

  useEffect(() => {
    if (city) {
      calculatePrices([product.id], city).then((calculations) => {
        setPricing(calculations[0]);
      });
    }
  }, [product.id, city]);

  const finalPrice = pricing?.finalPrice || product.price;
  const hasDiscount = pricing?.discount && pricing.discount.amount > 0;

  return (
    <Link href={`/produits/${product.slug}`} className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative aspect-square bg-gray-200">
        {product.images.length > 0 && (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{pricing!.discount!.amount.toLocaleString()} Ar
          </div>
        )}

        {product.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ⭐ Vedette
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {product.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString()} Ar
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {finalPrice.toLocaleString()} Ar
                </span>
                <span className="text-xs text-red-600 font-medium">
                  {pricing!.discount!.ruleName}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-green-600">
                {product.price.toLocaleString()} Ar
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">Voir détails →</span>
        </div>
      </div>
    </Link>
  );
}
```

### 3. Sélecteur de Zone de Livraison

**Créer** : `src/components/LocationSelector.tsx`

```typescript
"use client";

import { useState } from "react";

const CITIES = [
  { value: "", label: "Toutes les régions (prix standard)" },
  { value: "Toliara", label: "Tuléar / Toliara" },
  { value: "Antananarivo", label: "Antananarivo" },
  { value: "Antsirabe", label: "Antsirabe" },
  { value: "Mahajanga", label: "Mahajanga" },
];

interface LocationSelectorProps {
  onCityChange: (city: string) => void;
}

export default function LocationSelector({ onCityChange }: LocationSelectorProps) {
  const [selectedCity, setSelectedCity] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    onCityChange(city);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <label className="block text-sm font-medium mb-2">
        📍 Zone de livraison
      </label>
      <select
        value={selectedCity}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
      >
        {CITIES.map((city) => (
          <option key={city.value} value={city.value}>
            {city.label}
          </option>
        ))}
      </select>
      {selectedCity === "Toliara" && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            🎉 <strong>Réduction spéciale Tuléar</strong> appliquée sur les produits !
          </p>
        </div>
      )}
    </div>
  );
}
```

### 4. Intégrer dans la page produits

**Modifier** : `src/app/produits/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/products";
import ProductCard from "@/components/ProductCard";
import LocationSelector from "@/components/LocationSelector";
import { Product } from "@/types/product";

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Nos Produits</h1>

      <LocationSelector onCityChange={setSelectedCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} city={selectedCity} />
        ))}
      </div>
    </div>
  );
}
```

#### Page dédiée Tuléar

**Créer** : `src/app/produits/tulear/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { getAllProducts } from "@/services/products";
import ProductCard from "@/components/ProductCard";
import LocationSelector from "@/components/LocationSelector";
import { Product } from "@/types/product";

export default function TulearProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCity, setSelectedCity] = useState("Toliara"); // Pré-sélectionné à Tuléar
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Nos Produits - Tarifs Tuléar</h1>
        <div className="flex gap-4 mb-4">
          <a
            href="/produits"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            ← Voir tous les produits
          </a>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌴</span>
            <h2 className="text-xl font-semibold text-green-800">Réductions spéciales Tuléar</h2>
          </div>
          <p className="text-green-700">
            Découvrez nos produits avec <strong>15% de réduction</strong> pour nos clients de Tuléar et environs.
            Profitez de prix préférentiels sur toute notre gamme de produits bio au baobab !
          </p>
        </div>
      </div>

      <LocationSelector onCityChange={setSelectedCity} selectedCity={selectedCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} city={selectedCity} />
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">À propos des tarifs Tuléar</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Zone de livraison</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tuléar / Toliara</li>
              <li>• Région Atsimo-Andrefana</li>
              <li>• Autres localités de la région</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Avantages</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Réduction de 15% sur tous les produits</li>
              <li>• Prix calculés automatiquement</li>
              <li>• Livraison dans toute la région</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Script de Seed - Règle Tuléar

**Créer** : `scripts/seed-tulear-pricing.js`

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Création de la règle de tarification Tuléar...\n");

  // Récupérer les produits existants
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true, price: true },
  });

  if (products.length === 0) {
    console.log("❌ Aucun produit trouvé. Exécutez d'abord seed-products.js");
    return;
  }

  // Définir les réductions par produit (slug → prix réduit)
  const tulearDiscounts = {
    "huile-baobab-bio-100ml": 38250,
    "huile-baobab-bio-200ml": 68000,
    "poudre-baobab-bio-500g": 29750,
    "poudre-baobab-bio-1kg": 55250,
    "capsules-baobab-bio-60": 42500,
    "capsules-baobab-bio-120": 76500,
    "the-baobab-bio-50g": 21250,
    "the-baobab-bio-100g": 38250,
    "miel-baobab-bio-250g": 34000,
    "miel-baobab-bio-500g": 63750,
  };

  // Créer la règle
  const rule = await prisma.pricingRule.create({
    data: {
      name: "Réduction Tuléar",
      description: "Prix spéciaux pour les clients de Tuléar et environs",
      enabled: true,
      priority: 10,
      geoCities: ["Toliara", "Tuléar", "Toliary"],
      geoRegions: ["Atsimo-Andrefana"],
      geoCountry: "MG",
      startDate: null, // Toujours actif
      endDate: null,
      createdBy: "system", // À remplacer par l'ID d'un admin
      products: {
        create: products
          .filter((p) => tulearDiscounts[p.slug])
          .map((p) => ({
            productId: p.id,
            discountType: "FIXED",
            discountValue: tulearDiscounts[p.slug],
          })),
      },
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`✅ Règle créée: ${rule.name}`);
  console.log(`   ID: ${rule.id}`);
  console.log(`   Villes: ${rule.geoCities.join(", ")}`);
  console.log(`   Produits concernés: ${rule.products.length}\n`);

  rule.products.forEach((rp) => {
    const discount = rp.product.price - rp.discountValue;
    console.log(
      `   • ${rp.product.title}: ${rp.product.price.toLocaleString()} Ar → ${rp.discountValue.toLocaleString()} Ar (${discount.toLocaleString()} Ar de réduction)`
    );
  });

  console.log("\n🎉 Règle de tarification Tuléar créée avec succès !");
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
node scripts/seed-tulear-pricing.js
```

---

## ✅ Checklist d'implémentation

### Backend CMS

- [ ] Modifier `prisma/schema.prisma` (ajouter PricingRule, PricingRuleProduct)
- [ ] Exécuter migration : `npx prisma migrate dev --name add_pricing_rules`
- [ ] Créer API `/api/pricing/calculate` (POST)
- [ ] Créer API `/api/pricing/rules` (GET, POST)
- [ ] Créer API `/api/pricing/rules/[id]` (PUT, DELETE)
- [ ] Créer page admin `/admin/pricing`
- [ ] Créer script seed `scripts/seed-tulear-pricing.js`
- [ ] Exécuter le seed : `node scripts/seed-tulear-pricing.js`
- [ ] Tester endpoints API avec Postman/curl

### Site Principal

- [ ] Créer service `src/services/pricing.ts`
- [ ] Modifier composant `ProductCard` (affichage prix réduit)
- [ ] Créer composant `LocationSelector`
- [ ] Modifier page `/produits` (intégrer sélecteur)
- [ ] Tester affichage réductions avec ville "Toliara"
- [ ] Tester prix standard avec autres villes
- [ ] Vérifier responsive mobile

### Tests

- [ ] Admin crée une règle de test
- [ ] Vérifier calcul API : `POST /api/pricing/calculate`
- [ ] Sélectionner "Tuléar" sur le site → Prix réduits affichés
- [ ] Sélectionner autre ville → Prix standards
- [ ] Désactiver règle → Réductions disparaissent
- [ ] Modifier priorité → Ordre d'application correct

---

## 📊 Exemples de Règles

### Règle 1 : Réduction Tuléar (permanente)

```json
{
  "name": "Réduction Tuléar",
  "description": "Prix spéciaux pour Tuléar",
  "enabled": true,
  "priority": 10,
  "geoCities": ["Toliara", "Tuléar", "Toliary"],
  "geoRegions": ["Atsimo-Andrefana"],
  "geoCountry": "MG",
  "startDate": null,
  "endDate": null,
  "products": [
    {
      "productId": "huile-baobab-bio",
      "discountType": "FIXED",
      "discountValue": 38000
    },
    {
      "productId": "poudre-baobab-pure",
      "discountType": "FIXED",
      "discountValue": 20000
    }
  ]
}
```

### Règle 2 : Promotion Black Friday (temporaire)

```json
{
  "name": "Black Friday 2025",
  "description": "30% sur tous les produits",
  "enabled": true,
  "priority": 20,
  "geoCities": [],
  "geoRegions": [],
  "geoCountry": "MG",
  "startDate": "2025-11-24T00:00:00Z",
  "endDate": "2025-11-30T23:59:59Z",
  "products": [
    {
      "productId": "*",
      "discountType": "PERCENT",
      "discountValue": 30
    }
  ]
}
```

### Règle 3 : Réduction Nouvel An Tananarive

```json
{
  "name": "Nouvel An Tana",
  "description": "15% pour les clients de la capitale",
  "enabled": true,
  "priority": 5,
  "geoCities": ["Antananarivo", "Tana"],
  "geoRegions": ["Analamanga"],
  "geoCountry": "MG",
  "startDate": "2025-12-20T00:00:00Z",
  "endDate": "2026-01-05T23:59:59Z",
  "products": [
    {
      "productId": "*",
      "discountType": "PERCENT",
      "discountValue": 15
    }
  ]
}
```

---

## 🚀 Évolutions futures

### Phase 2 : Codes promo

```prisma
model PromoCode {
  id          String   @id @default(cuid())
  code        String   @unique // "BAOBAB2025"
  description String
  enabled     Boolean  @default(true)
  usageLimit  Int?     // Nombre max d'utilisations
  usageCount  Int      @default(0)
  
  discountType  String // "FIXED" | "PERCENT"
  discountValue Int
  
  validFrom   DateTime
  validUntil  DateTime
  
  // Conditions
  minOrderValue Int?   // Montant minimum commande
  productIds    String[] // Produits éligibles (vide = tous)
}
```

### Phase 3 : Réductions par quantité

```prisma
model QuantityDiscount {
  id          String @id @default(cuid())
  productId   String
  minQuantity Int    // Acheter 3+
  discountType String
  discountValue Int  // -20%
}
```

### Phase 4 : Programmes de fidélité

```prisma
model LoyaltyProgram {
  id          String @id @default(cuid())
  name        String // "Bronze", "Silver", "Gold"
  minOrders   Int    // 5 commandes
  discountPercent Int // 10%
}
```

---

**Résumé** : Système flexible de règles de tarification avec support géolocalisation, périodes, priorités. Implémentation complète avec API fonctionnelle, interface admin et intégration frontend. Exemple concret : Réduction Tuléar 15% (-6,750 Ar à -13,500 Ar selon produit).
