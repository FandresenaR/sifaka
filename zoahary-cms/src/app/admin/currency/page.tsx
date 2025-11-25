"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ExchangeRate {
    rate: number;
    source: string;
    createdAt: string;
}

interface CurrentRate {
    from: string;
    to: string;
    rate: number;
    source: string;
    cached: boolean;
    timestamp: number;
}

export default function CurrencyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [eurToUsd, setEurToUsd] = useState<CurrentRate | null>(null);
    const [usdToEur, setUsdToEur] = useState<CurrentRate | null>(null);
    const [history, setHistory] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Manual update form
    const [manualFrom, setManualFrom] = useState("EUR");
    const [manualTo, setManualTo] = useState("USD");
    const [manualRate, setManualRate] = useState("");

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Fetch current rates
    const fetchRates = async () => {
        try {
            const [eurUsdRes, usdEurRes] = await Promise.all([
                fetch("/api/exchange-rate?from=EUR&to=USD"),
                fetch("/api/exchange-rate?from=USD&to=EUR")
            ]);

            if (eurUsdRes.ok && usdEurRes.ok) {
                setEurToUsd(await eurUsdRes.json());
                setUsdToEur(await usdEurRes.json());
            }
        } catch (error) {
            console.error("Error fetching rates:", error);
        }
    };

    // Fetch rate history
    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/exchange-rate/history?from=EUR&to=USD&limit=30");
            if (res.ok) {
                const data = await res.json();
                setHistory(data.history);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    // Initial load
    useEffect(() => {
        if (status === "authenticated") {
            Promise.all([fetchRates(), fetchHistory()]).finally(() => setLoading(false));
        }
    }, [status]);

    // Update rates from API
    const handleUpdateFromAPI = async () => {
        setUpdating(true);
        try {
            const res = await fetch("/api/exchange-rate/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source: "API" })
            });

            if (res.ok) {
                await Promise.all([fetchRates(), fetchHistory()]);
                alert("✅ Taux mis à jour avec succès depuis l'API");
            } else {
                const error = await res.json();
                alert(`❌ Erreur: ${error.error}`);
            }
        } catch (error) {
            alert("❌ Erreur lors de la mise à jour");
        } finally {
            setUpdating(false);
        }
    };

    // Manual rate update
    const handleManualUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const rate = parseFloat(manualRate);
        if (isNaN(rate) || rate <= 0) {
            alert("❌ Taux invalide");
            return;
        }

        setUpdating(true);
        try {
            const res = await fetch("/api/exchange-rate/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: "MANUAL",
                    from: manualFrom,
                    to: manualTo,
                    rate
                })
            });

            if (res.ok) {
                await Promise.all([fetchRates(), fetchHistory()]);
                setManualRate("");
                alert("✅ Taux manuel enregistré");
            } else {
                const error = await res.json();
                alert(`❌ Erreur: ${error.error}`);
            }
        } catch (error) {
            alert("❌ Erreur lors de l'enregistrement");
        } finally {
            setUpdating(false);
        }
    };

    // Format timestamp
    const formatTime = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return "À l'instant";
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        return new Date(timestamp).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        💱 Gestion des Devises
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Gérez les taux de change EUR/USD pour votre boutique
                    </p>
                </div>

                {/* Current Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* EUR to USD */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                EUR → USD
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${eurToUsd?.source === 'API'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                }`}>
                                {eurToUsd?.source === 'API' ? '🟢 API' : '🔵 ' + eurToUsd?.source}
                            </span>
                        </div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {eurToUsd?.rate.toFixed(4) || '—'}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {eurToUsd && formatTime(eurToUsd.timestamp)}
                            {eurToUsd?.cached && ' (cache)'}
                        </p>
                    </div>

                    {/* USD to EUR */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                USD → EUR
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${usdToEur?.source === 'API'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                }`}>
                                {usdToEur?.source === 'API' ? '🟢 API' : '🔵 ' + usdToEur?.source}
                            </span>
                        </div>
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                            {usdToEur?.rate.toFixed(4) || '—'}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {usdToEur && formatTime(usdToEur.timestamp)}
                            {usdToEur?.cached && ' (cache)'}
                        </p>
                    </div>
                </div>

                {/* Update from API Button */}
                <div className="mb-8">
                    <button
                        onClick={handleUpdateFromAPI}
                        disabled={updating}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {updating ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Mise à jour...
                            </>
                        ) : (
                            <>
                                🔄 Mettre à jour depuis l&apos;API
                            </>
                        )}
                    </button>
                </div>

                {/* Manual Update Form */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Mise à Jour Manuelle
                    </h3>
                    <form onSubmit={handleManualUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    De
                                </label>
                                <select
                                    value={manualFrom}
                                    onChange={(e) => setManualFrom(e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                                >
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Vers
                                </label>
                                <select
                                    value={manualTo}
                                    onChange={(e) => setManualTo(e.target.value)}
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Taux
                                </label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={manualRate}
                                    onChange={(e) => setManualRate(e.target.value)}
                                    placeholder="1.0950"
                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={updating}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            Enregistrer
                        </button>
                    </form>
                </div>

                {/* History Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Historique EUR → USD (30 derniers jours)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Taux
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Source
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            Aucun historique disponible
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {new Date(item.createdAt).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {item.rate.toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.source === 'API'
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                                    }`}>
                                                    {item.source}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
