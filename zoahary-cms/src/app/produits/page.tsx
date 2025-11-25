"use client";

import { useState, useEffect } from "react";
import { getAllProducts, Product } from "@/services/products";
import ProductCard from "@/components/ProductCard";
import LocationSelector from "@/components/LocationSelector";
import Link from "next/link";

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Nos Produits</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌴</span>
              <div>
                <h2 className="text-lg font-semibold text-blue-800">Tarifs spéciaux Tuléar</h2>
                <p className="text-blue-700 text-sm">
                  Découvrez nos prix préférentiels pour les clients de Tuléar (-15%)
                </p>
              </div>
            </div>
            <Link
              href="/produits/tulear"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Voir les tarifs Tuléar →
            </Link>
          </div>
        </div>
      </div>

      <LocationSelector onCityChange={setSelectedCity} selectedCity={selectedCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} city={selectedCity} />
        ))}
      </div>
    </div>
  );
}