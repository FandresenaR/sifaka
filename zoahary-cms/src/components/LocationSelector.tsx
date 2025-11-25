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
  selectedCity?: string;
}

export default function LocationSelector({ onCityChange, selectedCity = "" }: LocationSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    onCityChange(city);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <label htmlFor="city-selector" className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
        📍 Zone de livraison
      </label>
      <select
        id="city-selector"
        value={selectedCity}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      >
        {CITIES.map((city) => (
          <option key={city.value} value={city.value}>
            {city.label}
          </option>
        ))}
      </select>
      {selectedCity === "Toliara" && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            🎉 <strong>Réduction spéciale Tuléar</strong> appliquée sur les produits !
          </p>
        </div>
      )}
    </div>
  );
}