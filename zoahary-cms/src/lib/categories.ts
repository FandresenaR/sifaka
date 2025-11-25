export const PRODUCT_CATEGORIES = {
  fr: {
    "Produits de Consommation": "Produits de Consommation",
    "Cosmétiques": "Cosmétiques",
    "Autres": "Autres"
  },
  en: {
    "Produits de Consommation": "Consumer Products",
    "Cosmétiques": "Cosmetics",
    "Autres": "Others"
  }
};

export const CATEGORY_OPTIONS_FR = [
  "Produits de Consommation",
  "Cosmétiques",
  "Autres"
];

export const CATEGORY_OPTIONS_EN = [
  "Consumer Products",
  "Cosmetics",
  "Others"
];

// Mappage des anciennes catégories vers les nouvelles
export const CATEGORY_MAPPING: Record<string, string> = {
  "Poudre de Baobab": "Produits de Consommation",
  "Huile de Baobab": "Produits de Consommation",
  "Graines de Baobab": "Produits de Consommation",
  "Feuilles de Baobab": "Produits de Consommation",
  "Cosmétiques": "Cosmétiques",
  "Compléments Alimentaires": "Produits de Consommation",
  "Autres": "Autres"
};
