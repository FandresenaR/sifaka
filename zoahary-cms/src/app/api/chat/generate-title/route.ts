import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptApiKey } from "@/lib/encryption";

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages requis" },
                { status: 400 }
            );
        }

        // Take first 2-3 messages for context
        const contextMessages = messages.slice(0, 3);

        // Create a prompt to generate a short title
        const titlePrompt = {
            role: "user",
            content: `Génère un titre court et descriptif (maximum 50 caractères) pour cette conversation. Réponds uniquement avec le titre, sans guillemets ni ponctuation finale :\n\n${contextMessages.map((m: any) => `${m.role}: ${m.content.substring(0, 200)}`).join('\n')}`
        };

        // Use a fast, free model for title generation
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
                "X-Title": "Zoahary Baobab CMS - Title Generation",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.2-3b-instruct:free", // Fast and free model
                messages: [titlePrompt],
                max_tokens: 50,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la génération du titre");
        }

        const data = await response.json();
        let title = data.choices[0]?.message?.content?.trim() || "";

        // Clean up the title
        title = title.replace(/^["']|["']$/g, ""); // Remove quotes
        title = title.replace(/[.!?]+$/, ""); // Remove trailing punctuation

        // Limit to 50 characters
        if (title.length > 50) {
            title = title.substring(0, 47) + "...";
        }

        // Fallback if title is empty or too short
        if (!title || title.length < 3) {
            const date = new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
            });
            title = `Conversation du ${date}`;
        }

        return NextResponse.json({ title });
    } catch (error) {
        console.error("Error generating title:", error);

        // Fallback title
        const date = new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });

        return NextResponse.json({
            title: `Conversation du ${date}`,
        });
    }
}
