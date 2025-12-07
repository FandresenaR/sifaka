"use client"

import { useState } from "react"
import { 
  DollarSign, 
  Plus,
  Trash2,
  Edit,
  Percent,
  Calendar,
  Tag
} from "lucide-react"

interface PricingRule {
  id: string
  name: string
  type: "discount" | "markup" | "tax"
  value: number
  isPercentage: boolean
  appliesTo: string
  active: boolean
  startDate?: string
  endDate?: string
}

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  const currencies = [
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "USD", symbol: "$", name: "Dollar US" },
    { code: "MGA", symbol: "Ar", name: "Ariary" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-teal-500" />
            Gestion des Prix
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Multi-devises, réductions et règles de tarification
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle règle
        </button>
      </div>

      {/* Currency Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Devises disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <div key={currency.code} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 font-bold">
                  {currency.symbol}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{currency.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currency.code}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Tag className="w-4 h-4" />
            <span className="text-sm">Règles actives</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {rules.filter(r => r.active).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Percent className="w-4 h-4" />
            <span className="text-sm">Réductions</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {rules.filter(r => r.type === "discount").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Taxes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {rules.filter(r => r.type === "tax").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Temporaires</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {rules.filter(r => r.startDate || r.endDate).length}
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Règles de tarification
          </h3>
        </div>
        
        {rules.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune règle configurée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Créez des règles de réduction, taxes ou majorations.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer une règle
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{rule.name}</td>
                  <td className="px-6 py-4">{rule.type}</td>
                  <td className="px-6 py-4">{rule.value}{rule.isPercentage ? "%" : "€"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${rule.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {rule.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-600 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nouvelle règle de tarification
              </h2>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom de la règle
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="Ex: Soldes d'été -20%"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <option value="discount">Réduction</option>
                    <option value="markup">Majoration</option>
                    <option value="tax">Taxe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valeur
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700"
                      placeholder="20"
                    />
                    <select className="px-3 border-y border-r border-gray-300 dark:border-gray-600 rounded-r-lg bg-gray-50 dark:bg-gray-600">
                      <option value="%">%</option>
                      <option value="fixed">€</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">
                Créer la règle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
