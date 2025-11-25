import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/db-info
 * Retourne les informations de connexion à la base de données
 * Accessible uniquement aux SUPER_ADMIN
 */
export async function GET() {
    try {
        const session = await auth();

        // Vérifier l'authentification
        if (!session) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        // Vérifier que l'utilisateur est SUPER_ADMIN
        if (session.user?.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { error: "Accès refusé. Réservé aux super administrateurs." },
                { status: 403 }
            );
        }

        const databaseUrl = process.env.DATABASE_URL || "";

        // Parser l'URL de la base de données
        let dbInfo = {
            type: "PostgreSQL",
            host: "Non configuré",
            port: "N/A",
            database: "N/A",
            isLocal: false,
            isNeon: false,
        };

        if (databaseUrl) {
            try {
                // Format: postgresql://user:password@host:port/database
                const url = new URL(databaseUrl);

                dbInfo.host = url.hostname;
                dbInfo.port = url.port || "5432";
                dbInfo.database = url.pathname.replace("/", "").split("?")[0];
                dbInfo.isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
                dbInfo.isNeon = url.hostname.includes("neon.tech");
            } catch (error) {
                console.error("Erreur lors du parsing de DATABASE_URL:", error);
            }
        }

        return NextResponse.json(dbInfo);
    } catch (error) {
        console.error("Erreur lors de la récupération des infos DB:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
