"use client";

import { useState } from "react";
import Link from "next/link";

export default function ApiDocPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/products/public",
      description: "Récupérer tous les produits avec traductions et prix géolocalisés",
      params: [
        { name: "lang", type: "query", required: false, description: '"fr" ou "en" (défaut: "fr")' },
        { name: "city", type: "query", required: false, description: 'Ville pour réductions (ex: "Tuléar")' },
        { name: "category", type: "query", required: false, description: "Filtrer par catégorie" },
        { name: "featured", type: "query", required: false, description: '"true" pour produits vedettes' },
      ],
      examples: [
        { label: "Tous les produits FR", url: "/api/products/public?lang=fr" },
        { label: "Produits EN", url: "/api/products/public?lang=en" },
        { label: "Prix Tuléar", url: "/api/products/public?lang=fr&city=Tuléar" },
        { label: "Vedettes EN", url: "/api/products/public?lang=en&featured=true" },
      ],
    },
    {
      method: "GET",
      path: "/api/products/public/[slug]",
      description: "Récupérer un produit par slug (FR ou EN)",
      params: [
        { name: "slug", type: "path", required: true, description: "Slug du produit (français ou anglais)" },
      ],
      examples: [
        { label: "Slug FR", url: "/api/products/public/huile-baobab-bio" },
        { label: "Slug EN", url: "/api/products/public/organic-baobab-oil" },
      ],
    },
    {
      method: "POST",
      path: "/api/pricing/calculate",
      description: "Calculer les prix avec réductions géolocalisées",
      params: [
        { name: "productIds", type: "body", required: true, description: "Array d'IDs de produits" },
        { name: "city", type: "body", required: true, description: "Ville (ex: 'Tuléar')" },
      ],
      examples: [],
    },
    {
      method: "GET",
      path: "/api/exchange-rate",
      description: "Récupérer le taux de change EUR/USD en temps réel",
      params: [
        { name: "from", type: "query", required: false, description: '"EUR" ou "USD" (défaut: "EUR")' },
        { name: "to", type: "query", required: false, description: '"USD" ou "EUR" (défaut: "USD")' },
      ],
      examples: [
        { label: "EUR vers USD", url: "/api/exchange-rate?from=EUR&to=USD" },
        { label: "USD vers EUR", url: "/api/exchange-rate?from=USD&to=EUR" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📚 Documentation API Produits
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                API publique pour le site principal zoahary-baobab.mg
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              ← Retour
            </Link>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Base URL
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/40 px-3 py-2 rounded">
                  https://zoahary-cms.vercel.app
                </div>
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Version 2.0.0 • Authentification : Aucune (API publique) • Cache ISR : 60 secondes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((endpoint, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded ${endpoint.method === "GET"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                      {endpoint.path}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {copiedEndpoint === endpoint.path ? "✓ Copié" : "📋 Copier"}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {endpoint.description}
                </p>
              </div>

              <div className="px-6 py-4">
                {/* Paramètres */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Paramètres
                  </h4>
                  <div className="space-y-2">
                    {endpoint.params.map((param, pidx) => (
                      <div
                        key={pidx}
                        className="flex items-start space-x-3 text-sm"
                      >
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${param.type === "query"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : param.type === "body"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {param.type}
                        </span>
                        <code className="font-mono text-gray-900 dark:text-gray-100">
                          {param.name}
                        </code>
                        {param.required && (
                          <span className="text-red-600 dark:text-red-400 text-xs font-semibold">
                            *requis
                          </span>
                        )}
                        <span className="text-gray-600 dark:text-gray-400">
                          {param.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exemples */}
                {endpoint.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Exemples
                    </h4>
                    <div className="space-y-2">
                      {endpoint.examples.map((example, eidx) => (
                        <div
                          key={eidx}
                          className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {example.label}
                            </span>
                            <button
                              onClick={() => copyToClipboard(example.url, example.label)}
                              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {copiedEndpoint === example.label ? "✓ Copié" : "📋 Copier"}
                            </button>
                          </div>
                          <code className="text-xs font-mono text-gray-800 dark:text-gray-200 block break-all">
                            {example.url}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modèle de données Product */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Modèle de données Product
          </h2>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs">
            {`interface ProductPublicResponse {
  id: string;
  
  // Champs traduits automatiquement selon lang
  title: string;           // titleFr ou titleEn selon lang
  description: string;     // descriptionFr ou descriptionEn selon lang
  slug: string;            // slug ou slugEn selon lang
  categoryTranslated: string; // Traduit selon lang
  
  // Champs originaux (toujours présents)
  titleFr: string;         // Titre français original
  titleEn: string;         // Titre anglais original
  
  // Prix et réductions
  price: number;           // Prix final (après réduction)
  originalPrice?: number;  // Prix original (si réduction)
  discount?: number;       // Montant de la réduction
  discountReason?: string; // Nom de la règle appliquée (ex: "Réduction Tuléar")
  
  // Autres champs
  images: string[];
  category: string;        // Catégorie originale (non traduite)
  featured: boolean;
  inStock: boolean;
  isNew: boolean;
  comingSoon: boolean;
  createdAt: string;
  updatedAt: string;
}`}
          </pre>
        </div>

        {/* Modèle de données ExchangeRate */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            💱 Modèle de données ExchangeRate
          </h2>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs">
            {`interface ExchangeRateResponse {
  from: string;           // Devise source (EUR, USD)
  to: string;             // Devise cible (EUR, USD)
  rate: number;           // Taux de change (ex: 1.0950)
  source: string;         // Source du taux (API, DB, MANUAL)
  cached: boolean;        // Taux provient du cache
  timestamp: number;      // Timestamp de récupération
}

// Exemple de réponse
{
  "from": "EUR",
  "to": "USD",
  "rate": 1.0950,
  "source": "API",
  "cached": true,
  "timestamp": 1700000000000
}`}
          </pre>
        </div>

        {/* Notes importantes */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-4">
            📝 Notes importantes
          </h2>
          <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Multilinguisme :</strong> Tous les produits ont des champs FR et EN
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Traduction automatique :</strong> Le paramètre <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">lang=fr</code> ou <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">lang=en</code> traduit automatiquement :
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">title</code> : titleFr → titleEn</li>
                  <li>• <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">description</code> : descriptionFr → descriptionEn</li>
                  <li>• <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">slug</code> : slug → slugEn (ex: huile-baobab-bio → organic-baobab-oil)</li>
                  <li>• <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">categoryTranslated</code> : Cosmétiques → Cosmetics</li>
                </ul>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Champs originaux conservés :</strong> Les réponses incluent aussi <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">titleFr</code> et <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">titleEn</code> pour permettre le changement de langue côté client
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Règles de Tarification :</strong> Le système applique automatiquement les règles de prix actives (priorité, région, ville) configurées dans le CMS. Utilisez le paramètre <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">city=Tuléar</code> pour voir les prix ajustés selon les règles locales.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Cache ISR :</strong> Revalidation toutes les 60 secondes
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Slugs bilingues :</strong> Les routes FR et EN fonctionnent (<code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">/huile-baobab-bio</code> et <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">/organic-baobab-oil</code>)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Prix :</strong> Tous les prix sont en Ariary malgache (MGA)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Taux de change :</strong> Les taux EUR/USD sont mis à jour quotidiennement depuis ExchangeRate-API et cachés pendant 1 heure
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Conversion de prix :</strong> Utilisez <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">/api/exchange-rate</code> pour convertir les prix en USD pour vos clients internationaux
              </span>
            </li>
          </ul>
        </div>

        {/* Documentation complète */}
        <div className="mt-8 text-center">
          <a
            href="/docs/API-PRODUCTS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📄 Voir la documentation complète (Markdown)
          </a>
        </div>
      </div>
    </div>
  );
}
