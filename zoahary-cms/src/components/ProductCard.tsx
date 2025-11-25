"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/services/products";
import { useEffect, useState } from "react";
import { calculatePrices, PriceCalculation } from "@/services/pricing";


interface ProductCardProps {
  product: Product;
  city?: string;
  language?: 'fr' | 'en';
}

export default function ProductCard({ product, city, language = 'fr' }: ProductCardProps) {
  const [pricing, setPricing] = useState<PriceCalculation | null>(null);

  useEffect(() => {
    if (city && city.trim() !== "") {
      calculatePrices([product.id], city).then((calculations) => {
        const calc = calculations.find(c => c.id === product.id);
        setPricing(calc || null);
      }).catch((error) => {
        console.error("Error calculating prices:", error);
        setPricing(null);
      });
    } else {
      setPricing(null);
    }
  }, [product.id, city]);

  const finalPrice = pricing?.discountedPrice || product.price;
  const hasDiscount = pricing?.hasDiscount || false;

  return (
    <Link href={{
      pathname: `/produits/tulear/${product.slug}`,
      query: { lang: language }
    }}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative aspect-square bg-gray-200">
        {product.images.length > 0 && (
          <Image
            src={product.images[0]}
            alt={language === 'en' ? product.titleEn : product.titleFr}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{pricing!.discount.toLocaleString()} Ar
          </div>
        )}

        {product.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ⭐ {language === 'en' ? 'Featured' : 'Vedette'}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {language === 'en' ? product.titleEn : product.titleFr}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {language === 'en' ? product.descriptionEn : product.descriptionFr}
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
                  {pricing!.discountReason || (language === 'en' ? 'Tulear Discount' : 'Réduction Tuléar')}
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