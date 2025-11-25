"use client";

import { useState, useEffect } from "react";
import { getAllProducts, Product } from "@/services/products";
import ProductCard from "@/components/ProductCard";
import LocationSelector from "@/components/LocationSelector";


export default function TulearProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCity, setSelectedCity] = useState("Toliara"); // Pré-sélectionné à Tuléar
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'fr' | 'en'>(typeof window !== 'undefined' && window.navigator.language.startsWith('en') ? 'en' : 'fr');

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">{language === 'en' ? 'Loading...' : 'Chargement...'}</div>;

  return (
    <div className="container mx-auto px-4 py-12 text-gray-900 dark:text-gray-100">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {language === 'en' ? 'Our Products - Tulear Prices' : 'Nos Produits - Tarifs Tuléar'}
          </h1>
          <button
            className={`px-2 py-1 rounded text-xs font-semibold border ${language === 'fr' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            aria-label={language === 'fr' ? 'Show in English' : 'Afficher en français'}
          >
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
        <div className="flex gap-4 mb-4">
          <a
            href="/produits"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            ← {language === 'en' ? 'See all products' : 'Voir tous les produits'}
          </a>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌴</span>
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
              {language === 'en' ? 'Special Tulear Discounts' : 'Réductions spéciales Tuléar'}
            </h2>
          </div>
          <p className="text-green-700 dark:text-green-200">
            {language === 'en'
              ? 'Discover our products with a 15% discount for our customers in Tulear and surrounding areas. Enjoy preferential prices on our full range of organic baobab products!'
              : 'Découvrez nos produits avec 15% de réduction pour nos clients de Tuléar et environs. Profitez de prix préférentiels sur toute notre gamme de produits bio au baobab !'}
          </p>
        </div>
      </div>

      <LocationSelector onCityChange={setSelectedCity} selectedCity={selectedCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} city={selectedCity} language={language} />
        ))}
      </div>

      <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {language === 'en' ? 'About Tulear Prices' : 'À propos des tarifs Tuléar'}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              {language === 'en' ? 'Delivery area' : 'Zone de livraison'}
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• {language === 'en' ? 'Tulear / Toliara' : 'Tuléar / Toliara'}</li>
              <li>• {language === 'en' ? 'Atsimo-Andrefana region' : 'Région Atsimo-Andrefana'}</li>
              <li>• {language === 'en' ? 'Other localities in the region' : 'Autres localités de la région'}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              {language === 'en' ? 'Benefits' : 'Avantages'}
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• {language === 'en' ? '15% discount on all products' : 'Réduction de 15% sur tous les produits'}</li>
              <li>• {language === 'en' ? 'Prices calculated automatically' : 'Prix calculés automatiquement'}</li>
              <li>• {language === 'en' ? 'Delivery throughout the region' : 'Livraison dans toute la région'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}