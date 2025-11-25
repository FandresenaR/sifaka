'use client'

import { useState } from 'react';
import { blockIp, unblockIp } from './actions';

interface BlockedIp {
    id: string;
    ip: string;
    reason: string | null;
    createdAt: Date;
}

export default function BlockedIpManager({ blockedIps }: { blockedIps: BlockedIp[] }) {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    🚫 IPs Bloquées
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    {isAdding ? 'Annuler' : 'Bloquer une IP'}
                </button>
            </div>

            {isAdding && (
                <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <form action={async (formData) => {
                        await blockIp(formData);
                        setIsAdding(false);
                    }} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-auto">
                            <label htmlFor="ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse IP</label>
                            <input type="text" name="ip" id="ip" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2" placeholder="192.168.1.1" />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Raison</label>
                            <input type="text" name="reason" id="reason" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2" placeholder="Comportement suspect..." />
                        </div>
                        <button type="submit" className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none">
                            Confirmer
                        </button>
                    </form>
                </div>
            )}

            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {blockedIps.length === 0 ? (
                    <li className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">Aucune IP bloquée.</li>
                ) : (
                    blockedIps.map((item) => (
                        <li key={item.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{item.ip}</p>
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                        Bloqué
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {item.reason || 'Aucune raison spécifiée'} • Ajouté le {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => unblockIp(item.ip)}
                                className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Débloquer cette IP"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
