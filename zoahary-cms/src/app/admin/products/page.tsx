"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CATEGORY_OPTIONS_FR, CATEGORY_OPTIONS_EN } from "@/lib/categories";

interface Product {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  slugEn?: string;
  descriptionFr: string;
  descriptionEn: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  comingSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  
  const CATEGORIES = language === "fr" ? CATEGORY_OPTIONS_FR : CATEGORY_OPTIONS_EN;
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    titleFr: "",
    titleEn: "",
    descriptionFr: "",
    descriptionEn: "",
    slug: "",
    slugEn: "",
    price: 0,
    category: "Produits de Consommation",
    inStock: true,
    featured: false,
    isNew: false,
    comingSoon: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = imageUrls.filter(url => url.trim() !== "");
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, images: validImages }),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      titleFr: product.titleFr,
      titleEn: product.titleEn,
      descriptionFr: product.descriptionFr,
      descriptionEn: product.descriptionEn,
      slug: product.slug,
      slugEn: product.slugEn || "",
      price: product.price,
      category: product.category,
      inStock: product.inStock,
      featured: product.featured,
      isNew: product.isNew,
      comingSoon: product.comingSoon,
    });
    setImageUrls(product.images.length > 0 ? product.images : [""]);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const resetForm = () => {
    setFormData({ 
      titleFr: "", 
      titleEn: "",
      descriptionFr: "", 
      descriptionEn: "",
      slug: "",
      slugEn: "",
      price: 0, 
      category: "Produits de Consommation", 
      inStock: true, 
      featured: false,
      isNew: false,
      comingSoon: false
    });
    setImageUrls([""]);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const addImageField = () => setImageUrls([...imageUrls, ""]);
  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) setImageUrls(imageUrls.filter((_, i) => i !== index));
  };
  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Afficher un loader
    const newUrls = [...imageUrls];
    newUrls[index] = 'UPLOADING...';
    setImageUrls(newUrls);

    try {
      // Upload vers Cloudinary via notre API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const data = await response.json();
      updateImageUrl(index, data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload de l\'image');
      updateImageUrl(index, '');
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold">Produits</h1>
          <p className="mt-2 text-sm">Gestion du catalogue Zoahary Baobab</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <a
            href="/produits/tulear"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            title="Voir les tarifs Tuléar dans une nouvelle fenêtre"
          >
            🌴 Voir Tuléar
          </a>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setLanguage("fr")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                language === "fr"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                language === "en"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
          <button onClick={openCreateModal} className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            {language === "fr" ? "Ajouter un produit" : "Add Product"}
          </button>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">Aucun produit</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <Image 
                    src={product.images[0]} 
                    alt={product.titleFr || product.titleEn || "Image du produit"} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 100vw, 33vw" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl">📦</div>
                )}
                {/* Badges en haut à droite */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.featured && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                      ⭐ Vedette
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                      🆕 Nouveau
                    </span>
                  )}
                  {product.comingSoon && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                      🔜 Bientôt
                    </span>
                  )}
                </div>
                {/* Badge rupture de stock en haut à gauche */}
                {!product.inStock && !product.comingSoon && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                    ❌ Rupture
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {language === "fr" ? product.titleFr : product.titleEn}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {language === "fr" ? product.descriptionFr : product.descriptionEn}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">{product.category}</span>
                  <span className="text-xl font-bold">{product.price.toLocaleString()} Ar</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(product)} className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100">Modifier</button>
                  <button onClick={() => handleDelete(product.id)} className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100">Supprimer</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{editingProduct ? "Modifier le produit" : "Nouveau produit"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">🇫🇷 Titre (Français)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.titleFr} 
                      onChange={(e) => setFormData({...formData, titleFr: e.target.value})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      placeholder="Ex: Huile de Baobab Bio" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">🇬🇧 Title (English)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.titleEn} 
                      onChange={(e) => setFormData({...formData, titleEn: e.target.value})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      placeholder="Ex: Organic Baobab Oil" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">🇫🇷 Description (Français)</label>
                    <textarea 
                      required 
                      rows={4} 
                      value={formData.descriptionFr} 
                      onChange={(e) => setFormData({...formData, descriptionFr: e.target.value})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      placeholder="Description en français..." 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">🇬🇧 Description (English)</label>
                    <textarea 
                      required 
                      rows={4} 
                      value={formData.descriptionEn} 
                      onChange={(e) => setFormData({...formData, descriptionEn: e.target.value})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      placeholder="Description in English..." 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">🇫🇷 Slug (Français)</label>
                    <input 
                      type="text" 
                      value={formData.slug || ""} 
                      onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      placeholder="huile-baobab-bio (auto-généré)" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">🇬🇧 Slug (English)</label>
                    <input 
                      type="text" 
                      value={formData.slugEn} 
                      onChange={(e) => setFormData({...formData, slugEn: e.target.value})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      placeholder="organic-baobab-oil (auto-generated)" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prix (Ar)</label>
                    <input 
                      type="number" 
                      required 
                      min="0" 
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      placeholder="Ex: 25000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select 
                      required 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})} 
                      className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2"
                      title="Catégorie du produit"
                    >
                      {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Images</label>
                    <button type="button" onClick={addImageField} className="text-sm text-blue-600 hover:text-blue-700">
                      ➕ Ajouter un champ
                    </button>
                  </div>
                  {imageUrls.map((url, index) => (
                    <div key={index} className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder={`URL de l'image ${index + 1}`} 
                          value={url} 
                          onChange={(e) => updateImageUrl(index, e.target.value)} 
                          className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm" 
                        />
                        {imageUrls.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeImageField(index)} 
                            className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                            title="Supprimer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">ou</span>
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, index)}
                            className="hidden"
                            id={`file-upload-${index}`}
                          />
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                            📁 Choisir depuis l&apos;ordinateur
                          </span>
                        </label>
                      </div>
                      {url && url !== 'UPLOADING...' && (
                        <div className="mt-2">
                          <Image 
                            src={url} 
                            alt={`Aperçu ${index + 1}`} 
                            width={100} 
                            height={100} 
                            className="rounded-md object-cover border border-gray-200 dark:border-gray-600"
                            onError={() => {
                              console.log('Image error for:', url);
                            }}
                          />
                        </div>
                      )}
                      {url === 'UPLOADING...' && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Upload en cours vers Cloudinary...
                        </div>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Vous pouvez entrer une URL ou uploader une image depuis votre ordinateur (max 5MB)
                  </p>
                </div>
                <div className="flex items-center space-x-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} className="rounded h-4 w-4" />
                    <span className="ml-2 text-sm">En stock</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="rounded h-4 w-4" />
                    <span className="ml-2 text-sm">⭐ Vedette</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isNew} onChange={(e) => setFormData({...formData, isNew: e.target.checked})} className="rounded h-4 w-4" />
                    <span className="ml-2 text-sm">🆕 Nouveau</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.comingSoon} onChange={(e) => setFormData({...formData, comingSoon: e.target.checked})} className="rounded h-4 w-4" />
                    <span className="ml-2 text-sm">🔜 Bientôt disponible</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditingProduct(null); resetForm(); }} className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 border rounded-md">Annuler</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">{editingProduct ? "Enregistrer" : "Créer"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
