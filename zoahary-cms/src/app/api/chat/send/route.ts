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
        const { model, messages } = body;

        if (!model || !messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Paramètres invalides" },
                { status: 400 }
            );
        }

        // Format messages for OpenRouter API
        const formattedMessages = messages.map((msg: any) => {
            let content = msg.content;

            // If there's a file, include it in the message
            if (msg.fileData) {
                if (msg.fileData.type.startsWith("image/")) {
                    // For images, use vision-compatible format
                    content = [
                        {
                            type: "text",
                            text: msg.content || "Voici une image:",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${msg.fileData.type};base64,${msg.fileData.data}`,
                            },
                        },
                    ];
                } else {
                    // For text files, append content
                    content = `${msg.content}\n\nContenu du fichier ${msg.fileData.name}:\n${msg.fileData.data}`;
                }
            }

            return {
                role: msg.role,
                content,
            };
        });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
                "X-Title": "Zoahary Baobab CMS",
            },
            body: JSON.stringify({
                model,
                messages: formattedMessages,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OpenRouter API error:", errorData);
            throw new Error(errorData.error?.message || "Erreur de l'API OpenRouter");
        }

        const data = await response.json();

        return NextResponse.json({
            message: data.choices[0]?.message?.content || "Pas de réponse",
            usage: data.usage,
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Erreur lors de l'envoi du message"
            },
            { status: 500 }
        );
    }
}
