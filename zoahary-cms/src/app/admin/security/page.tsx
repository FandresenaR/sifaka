import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

import AIConfigSection from "./AIConfigSection";

export const metadata = {
    title: "Sécurité | Zoahary CMS",
    description: "Gérez la sécurité de votre compte.",
};

export default async function SecurityPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect("/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        redirect("/auth/signin");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sécurité du compte
            </h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Configuration IA */}
                <div className="md:col-span-2">
                    <AIConfigSection />
                </div>

                {/* Authentification à deux facteurs */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Authentification à deux facteurs (2FA)
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Ajoutez une couche de sécurité supplémentaire à votre compte.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <span className={`inline-flex h-3 w-3 rounded-full mr-2 ${user.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                            </span>
                        </div>
                        <Link
                            href="/admin/2fa"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {user.twoFactorEnabled ? 'Gérer' : 'Configurer'}
                        </Link>
                    </div>
                </div>

                {/* Mot de passe (Placeholder pour future implémentation) */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 opacity-75">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11l-.757.757a4.482 4.482 0 00-1.414 3.242V15c0 .552.448 1 1 1h1a1 1 0 001-1v-1a1 1 0 011-1h1a1 1 0 001-1v-1a1 1 0 011-1h1.172a3 3 0 002.12-.879l.83-.828A1 1 0 0119.828 4H20a1 1 0 011 1v2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Mot de passe
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Géré via votre fournisseur d&apos;authentification.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button disabled className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed">
                            Modifier le mot de passe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
