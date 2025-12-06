"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Package,
    FileText,
    Users,
    FolderOpen,
    Activity,
    Shield,
    LogOut,
    Menu,
    X,
    User,
    Settings,
    ChevronDown,
    UserCircle
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface AdminHeaderProps {
    projectName?: string;
    projectLogo?: string;
}

export default function AdminHeader({ projectName = "Sifaka CMS", projectLogo }: AdminHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Produits", href: "/admin/products", icon: Package },
        { name: "Blog", href: "/admin/blog", icon: FileText },
        { name: "Médias", href: "/admin/media", icon: FolderOpen },
        { name: "Utilisateurs", href: "/admin/users", icon: Users },
        { name: "Monitoring", href: "/admin/monitoring", icon: Activity },
        { name: "Sécurité", href: "/admin/security", icon: Shield },
    ];

    const profileMenuItems = [
        { name: "Profil", href: "/admin/profile", icon: UserCircle },
        { name: "Paramètres", href: "/admin/settings", icon: Settings },
        { name: "Sécurité", href: "/admin/security", icon: Shield },
    ];

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        await signOut({ callbackUrl: "/auth/signin" });
    };

    // Fermer le menu quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fermer le menu avec Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo & Project Name */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            {projectLogo ? (
                                <img src={projectLogo} alt={projectName} className="h-8 w-8 rounded-lg" />
                            ) : (
                                <div className="h-8 w-8 relative rounded-lg overflow-hidden">
                                    <Image
                                        src="/logo.png"
                                        alt="Sifaka Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <span className="font-semibold text-lg text-gray-900 dark:text-white hidden sm:block">
                                {projectName}
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {user ? (
                            <div className="relative" ref={profileMenuRef}>
                                {/* Profile Button */}
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg py-1.5 pr-2 transition-colors"
                                >
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.name || "Utilisateur"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </p>
                                    </div>

                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name || "Avatar"}
                                            width={32}
                                            height={32}
                                            className="rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                    )}

                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <Image
                                                        src={user.image}
                                                        alt={user.name || "Avatar"}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                        <span className="text-lg font-medium text-blue-600 dark:text-blue-400">
                                                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {user.name || "Utilisateur"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            {profileMenuItems.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => setProfileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                    >
                                                        <Icon className="w-4 h-4 text-gray-400" />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Déconnexion</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Connexion
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {user && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 px-4 mb-3">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name || "Avatar"}
                                                width={40}
                                                height={40}
                                                className="rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <span className="text-lg font-medium text-blue-600 dark:text-blue-400">
                                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.name || "Utilisateur"}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Profile Menu Items (Mobile) */}
                                    <div className="space-y-1 mb-3">
                                        {profileMenuItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                >
                                                    <Icon className="w-5 h-5 text-gray-400" />
                                                    <span>{item.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    {/* Logout Button */}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}
