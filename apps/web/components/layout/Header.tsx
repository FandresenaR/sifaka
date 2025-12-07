"use client";

import Link from "next/link";
import NextImage from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSession } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";

export function Header() {
    const { data: session } = useSession();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                            <NextImage
                                src="/logo.png"
                                alt="Sifaka Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Sifaka CMS
                        </h1>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                                {session.user.name}
                            </span>
                            {/* Avatar or Icon if image missing */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white overflow-hidden">
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-4 h-4" />
                                )}
                            </div>
                            <Link
                                href="/api/auth/signout"
                                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/admin"
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Dashboard
                        </Link>
                    )}

                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
