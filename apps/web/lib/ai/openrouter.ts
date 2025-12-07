import OpenAI from "openai";
import { getAIConfig } from "./config";

export async function generateWithOpenRouter(prompt: string, systemPrompt?: string) {
    const config = await getAIConfig("openrouter");

    if (!config) {
        throw new Error("OpenRouter configuration not found or disabled");
    }

    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: config.apiKey,
        defaultHeaders: {
            "HTTP-Referer": process.env.NEXTAUTH_URL,
            "X-Title": "Sifaka CMS",
        },
    });

    const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
            { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
            { role: "user", content: prompt },
        ],
    });

    return response.choices[0].message.content;
}
