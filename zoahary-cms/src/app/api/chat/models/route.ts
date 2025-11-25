import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptApiKey } from "@/lib/encryption";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get API key from DB or env
        let apiKey = process.env.OPENROUTER_API_KEY;
        const settings = await prisma.settings.findFirst();

        if (settings?.openRouterApiKey) {
            try {
                apiKey = decryptApiKey(settings.openRouterApiKey);
            } catch (e) {
                console.error("Error decrypting API key:", e);
            }
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Clé API OpenRouter non configurée" },
                { status: 500 }
            );
        }

        const response = await fetch("https://openrouter.ai/api/v1/models", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des modèles");
        }

        const data = await response.json();

        // Filter free models (pricing.prompt === "0" and pricing.completion === "0")
        const freeModels = data.data
            .filter((model: any) => {
                const prompt = parseFloat(model.pricing?.prompt || "1");
                const completion = parseFloat(model.pricing?.completion || "1");
                return prompt === 0 && completion === 0;
            })
            .map((model: any) => ({
                id: model.id,
                name: model.name,
                description: model.description,
            }))
            .slice(0, 20); // Limit to 20 models for better UX

        return NextResponse.json(
            { models: freeModels },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
                },
            }
        );
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des modèles" },
            { status: 500 }
        );
    }
}
