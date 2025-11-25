"use client";


import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, Product } from "@/services/products";
import { calculatePrices, PriceCalculation } from "@/services/pricing";
import LocationSelector from "@/components/LocationSelector";
import { use } from "react";



export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("Toliara");
  const [pricing, setPricing] = useState<PriceCalculation | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const searchParams = useSearchParams();
  const initialLang = searchParams?.get('lang');
  const [language, setLanguage] = useState<'fr' | 'en'>(
    initialLang === 'en' ? 'en'
    : initialLang === 'fr' ? 'fr'
    : (typeof window !== 'undefined' && window.navigator.language.startsWith('en') ? 'en' : 'fr')
  );
  const router = useRouter();

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    getProductBySlug(id)
      .then((prod) => setProduct(prod))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product || !selectedCity) {
      setPricing(null);
      return;
    }
    setPriceLoading(true);
    calculatePrices([product.id], selectedCity)
      .then((results) => {
        setPricing(results[0] || null);
      })
      .catch(() => setPricing(null))
      .finally(() => setPriceLoading(false));
  }, [product, selectedCity]);


  if (loading) return <div className="p-8">{language === 'en' ? 'Loading...' : 'Chargement...'}</div>;
  if (!product) return <div className="p-8 text-red-500">{language === 'en' ? 'Product not found.' : 'Produit introuvable.'}</div>;

  return (
    <div className="container mx-auto px-4 py-12 text-gray-900 dark:text-gray-100">
      <button
        className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
        onClick={() => router.back()}
      >
        ← Retour
      </button>

      <div className="mb-6">
        <LocationSelector onCityChange={setSelectedCity} selectedCity={selectedCity} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 w-full md:w-1/3 flex items-center justify-center">
          <Image
            src={product.images?.[0] || "/images/placeholder.png"}
            alt={language === 'en' ? product.titleEn : product.titleFr}
            width={400}
            height={256}
            className="w-full h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-700"
            priority
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">
              {language === 'en' ? product.titleEn : product.titleFr}
            </h1>
            <button
              className={`px-2 py-1 rounded text-xs font-semibold border ${language === 'fr' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              aria-label={language === 'fr' ? 'Afficher en anglais' : 'Show in French'}
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            {language === 'en' ? product.descriptionEn : product.descriptionFr}
          </p>
          <div className="mb-4">
            {priceLoading ? (
              <span className="text-gray-500 dark:text-gray-400">{language === 'en' ? 'Calculating price...' : 'Calcul du prix...'}</span>
            ) : pricing && pricing.hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-green-700 dark:text-green-300 mr-2">
                  {pricing.discountedPrice.toLocaleString()} Ar
                </span>
                <span className="line-through text-gray-400 text-lg mr-2">
                  {pricing.basePrice.toLocaleString()} Ar
                </span>
                <span className="text-sm text-green-700 dark:text-green-300 font-semibold">
                  -{pricing.discount.toLocaleString()} Ar
                </span>
                <div className="mt-2 text-green-700 dark:text-green-300 text-sm">
                  {pricing.discountReason || (language === 'en' ? 'Discount applied' : 'Réduction appliquée')}
                </div>
              </>
            ) : (
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                {product.price.toLocaleString()} Ar
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'en' ? 'Category' : 'Catégorie'} : {product.category || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
