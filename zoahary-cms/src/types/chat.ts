export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    fileData?: ChatFile;
}

export interface ChatFile {
    name: string;
    type: string;
    data: string; // base64 or text content
    size: number;
}

export interface ChatModel {
    id: string;
    name: string;
    description?: string;
    created?: number; // Unix timestamp de création du modèle
    pricing?: {
        prompt: string;
        completion: string;
    };
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
    model: string;
}

export interface ConversationSummary {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messageCount: number;
}

export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    pricing: {
        prompt: string;
        completion: string;
    };
    context_length: number;
    created?: number; // Unix timestamp
}
