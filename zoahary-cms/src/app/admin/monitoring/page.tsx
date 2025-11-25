import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlockedIpManager from "./BlockedIpManager";

export const metadata = {
    title: "Monitoring Sécurité | Zoahary CMS",
    description: "Suivi des activités suspectes et blocages API.",
};

interface SecurityLog {
    id: string;
    type: string;
    message: string;
    ip: string | null;
    endpoint: string | null;
    createdAt: Date;
}

export default async function MonitoringPage() {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/admin");
    }

    // Récupérer les logs des dernières 24h
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const logs = await prisma.securityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    const blockedIps = await prisma.blockedIp.findMany({
        orderBy: { createdAt: 'desc' },
    });

    const stats = {
        total24h: await prisma.securityLog.count({
            where: { createdAt: { gte: last24h } }
        }),
        rateLimit24h: await prisma.securityLog.count({
            where: {
                type: 'RATE_LIMIT',
                createdAt: { gte: last24h }
            }
        }),
        uniqueIps24h: (await prisma.securityLog.groupBy({
            by: ['ip'],
            where: { createdAt: { gte: last24h } },
        })).length,
        blockedCount: await prisma.blockedIp.count()
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🛡️ Monitoring Sécurité
                </h1>
                <span className="text-sm text-gray-500">
                    Dernière mise à jour : {new Date().toLocaleTimeString()}
                </span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Incidents (24h)
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                            {stats.total24h}
                        </dd>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Rate Limits (24h)
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
                            {stats.rateLimit24h}
                        </dd>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            IPs Suspectes (24h)
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-orange-600 dark:text-orange-400">
                            {stats.uniqueIps24h}
                        </dd>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            IPs Bloquées
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-400">
                            {stats.blockedCount}
                        </dd>
                    </div>
                </div>
            </div>

            {/* Gestion des IPs bloquées */}
            <BlockedIpManager blockedIps={blockedIps} />

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Derniers événements
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Message
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    IP / Endpoint
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Aucun événement de sécurité enregistré.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: SecurityLog) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.type === 'RATE_LIMIT'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {log.message}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.ip || 'N/A'}</span>
                                                <span className="text-xs text-gray-400">{log.endpoint}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
