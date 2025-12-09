"use client";

import Link from "next/link";
import NextImage from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, Settings, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Header() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fermer le menu quand on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isMenuOpen]);

    const handleSignOut = () => {
        setIsMenuOpen(false);
        signOut({ redirect: true, redirectTo: "/auth/signin" });
    };

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
                            
                            {/* User Avatar Button with Dropdown Menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    aria-label="Menu utilisateur"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white overflow-hidden">
                                        {session.user.image ? (
                                            <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                        {/* Profile Option */}
                                        <Link
                                            href="/admin/users"
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <UserIcon className="w-4 h-4" />
                                            <span className="text-sm font-medium">Profil</span>
                                        </Link>

                                        {/* Settings Option */}
                                        <Link
                                            href="/admin/security"
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span className="text-sm font-medium">Paramètres</span>
                                        </Link>

                                        {/* Logout Option */}
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm font-medium">Déconnexion</span>
                                        </button>
                                    </div>
                                )}
                            </div>
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
