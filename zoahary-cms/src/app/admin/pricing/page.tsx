"use client";

import { useState, useEffect } from "react";
import { getAllProducts, Product } from "@/services/products";

interface PricingRule {
  id: string;
  name: string;
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
  }[];
}

export default function PricingRulesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    priority: 1,
    geoCities: '',
    geoRegions: '',
    geoCountry: '',
    startDate: '',
    endDate: '',
    products: [] as string[],
    discountType: 'FIXED',
    discountValue: 0,
  });

  useEffect(() => {
    fetchRules();
    getAllProducts().then(setProducts).catch(() => setProducts([]));
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

  async function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch('/api/pricing/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          priority: formState.priority,
          geoCities: formState.geoCities.split(',').map(s => s.trim()),
          geoRegions: formState.geoRegions.split(',').map(s => s.trim()),
          geoCountry: formState.geoCountry,
          startDate: formState.startDate || null,
          endDate: formState.endDate || null,
          products: formState.products.map(pid => ({ productId: pid, discountType: formState.discountType, discountValue: formState.discountValue })),
        }),
      });
      setShowForm(false);
      setFormState({
        name: '', priority: 1, geoCities: '', geoRegions: '', geoCountry: '', startDate: '', endDate: '', products: [], discountType: 'FIXED', discountValue: 0
      });
      fetchRules();
    } catch (error) {
      alert('Erreur lors de l\'ajout de la règle');
    }
  }

  return (
    <div className="p-8">
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleAddRule} className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-lg space-y-4">
            <h2 className="text-2xl font-bold mb-4">Nouvelle règle de tarification</h2>
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Nom de la règle" value={formState.name} onChange={e => setFormState(f => ({...f, name: e.target.value}))} required />
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Priorité (nombre)" type="number" value={formState.priority} onChange={e => setFormState(f => ({...f, priority: Number(e.target.value)}))} required />
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Villes (séparées par des virgules)" value={formState.geoCities} onChange={e => setFormState(f => ({...f, geoCities: e.target.value}))} />
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Régions (séparées par des virgules)" value={formState.geoRegions} onChange={e => setFormState(f => ({...f, geoRegions: e.target.value}))} />
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Pays" value={formState.geoCountry} onChange={e => setFormState(f => ({...f, geoCountry: e.target.value}))} />
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Date de début (YYYY-MM-DD)" type="date" value={formState.startDate} onChange={e => setFormState(f => ({...f, startDate: e.target.value}))} />
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Date de fin (YYYY-MM-DD)" type="date" value={formState.endDate} onChange={e => setFormState(f => ({...f, endDate: e.target.value}))} />
            <div className="mb-2">
              <label className="block font-medium mb-1">Produits concernés</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-900">
                {products.map((prod) => (
                  <label key={prod.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.products.includes(prod.id)}
                      onChange={e => {
                        setFormState(f => ({
                          ...f,
                          products: e.target.checked
                            ? [...f.products, prod.id]
                            : f.products.filter(pid => pid !== prod.id)
                        }));
                      }}
                    />
                    <span className="text-sm font-normal text-gray-900 dark:text-gray-100">{prod.titleFr}</span>
                  </label>
                ))}
              </div>
            </div>
            <select className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={formState.discountType} onChange={e => setFormState(f => ({...f, discountType: e.target.value}))} title="Type de remise">
              <option value="FIXED">Remise fixe (Ar)</option>
              <option value="PERCENT">Remise en %</option>
            </select>
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400" placeholder="Valeur de la remise" type="number" value={formState.discountValue} onChange={e => setFormState(f => ({...f, discountValue: Number(e.target.value)}))} required />
            <div className="flex gap-4 justify-end mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-gray-100" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Ajouter</button>
            </div>
          </form>
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Règles de Tarification</h1>
          <p className="text-gray-500 dark:text-gray-300 mt-2 text-lg">Gestion des remises géolocalisées</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/produits/tulear"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold text-base shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            title="Voir les tarifs Tuléar dans une nouvelle fenêtre"
          >
            🌴 Aperçu Tuléar
          </a>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold text-base shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            + Nouvelle règle
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border-l-8 ${
              rule.enabled ? "border-l-green-500" : "border-l-gray-400"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">{rule.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold tracking-wide border ${
                      rule.enabled
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {rule.enabled ? "Actif" : "Inactif"}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold border border-blue-300">
                    Priorité: {rule.priority}
                  </span>
                </div>

                <div className="text-base text-gray-700 dark:text-gray-200 space-y-1 mb-2">
                  <p>
                    <span className="font-semibold text-gray-900 dark:text-white">Villes :</span> {rule.geoCities.join(", ")}
                  </p>
                  {rule.geoRegions.length > 0 && (
                    <p>
                      <span className="font-semibold text-gray-900 dark:text-white">Régions :</span> {rule.geoRegions.join(", ")}
                    </p>
                  )}
                  {rule.startDate && (
                    <p>
                      <span className="font-semibold text-gray-900 dark:text-white">Période :</span>{" "}
                      {new Date(rule.startDate).toLocaleDateString()} -{" "}
                      {rule.endDate
                        ? new Date(rule.endDate).toLocaleDateString()
                        : "∞"}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <span className="text-base font-bold text-gray-900 dark:text-white">Produits concernés :</span>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {rule.products.map((rp) => (
                      <div
                        key={rp.id}
                        className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg text-base font-semibold text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Produit</span> <span className="font-mono text-blue-700 dark:text-blue-300">{rp.productId}</span> <span className="text-gray-500">→</span> <span className="text-green-700 dark:text-green-300 font-bold">{rp.discountType === "FIXED"
                          ? `${rp.discountValue.toLocaleString()} Ar`
                          : `${rp.discountValue}%`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleRule(rule.id, rule.enabled)}
                  className={`px-5 py-2 rounded-lg font-semibold text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors ${rule.enabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
                  disabled={rule.enabled}
                >
                  {rule.enabled ? "Désactiver" : "Activer"}
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="px-5 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-semibold text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
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