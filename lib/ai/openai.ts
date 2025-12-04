import OpenAI from "openai";
import { getAIConfig } from "./config";

export async function generateWithOpenAI(prompt: string, systemPrompt?: string) {
    const config = await getAIConfig("openai");

    if (!config) {
        throw new Error("OpenAI configuration not found or disabled");
    }

    const openai = new OpenAI({
        apiKey: config.apiKey,
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
