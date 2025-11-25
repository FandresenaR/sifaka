"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatFile, ConversationSummary } from "@/types/chat";
import ModelSelector from "./ModelSelector";
import MessageContent from "./MessageContent";
import { useToast, ToastContainer } from "./Toast";
import ConversationHistory from "./ConversationHistory";
import {
    saveConversation,
    getConversation,
    getAllConversations,
    deleteConversation,
    generateConversationId,
} from "@/utils/conversationStorage";

interface ChatWindowProps {
    onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [conversationTitle, setConversationTitle] = useState<string>("Nouvelle conversation");
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { toasts, addToast, removeToast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch available models and conversations on mount
    useEffect(() => {
        fetchAvailableModels();
        loadConversations();
    }, []);

    // Load conversations list
    const loadConversations = () => {
        const allConvs = getAllConversations();
        setConversations(allConvs);
    };

    // Save current conversation
    const saveCurrentConversation = React.useCallback(async () => {
        if (!currentConversationId || messages.length === 0) return;

        saveConversation({
            id: currentConversationId,
            title: conversationTitle,
            messages,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            model: selectedModel,
        });

        loadConversations();
    }, [currentConversationId, messages, conversationTitle, selectedModel]);

    // Generate title for conversation
    const generateTitle = React.useCallback(async () => {
        if (messages.length < 2) return;

        try {
            const response = await fetch("/api/chat/generate-title", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: messages.slice(0, 3) }),
            });

            if (response.ok) {
                const { title } = await response.json();
                setConversationTitle(title);
            }
        } catch (error) {
            console.error("Error generating title:", error);
        }
    }, [messages]);

    // Auto-save after messages change
    useEffect(() => {
        if (messages.length > 0) {
            saveCurrentConversation();

            // Generate title after first exchange (2 messages: user + assistant)
            if (messages.length === 2 && conversationTitle === "Nouvelle conversation") {
                generateTitle();
            }
        }
    }, [messages, conversationTitle, saveCurrentConversation, generateTitle]);

    // Create new conversation
    const handleNewConversation = () => {
        setMessages([]);
        setCurrentConversationId(generateConversationId());
        setConversationTitle("Nouvelle conversation");
        setSelectedFile(null);
        setInput("");
        addToast("info", "Nouvelle conversation créée");
    };

    // Load existing conversation
    const handleSelectConversation = (id: string) => {
        const conv = getConversation(id);
        if (conv) {
            setMessages(conv.messages);
            setCurrentConversationId(conv.id);
            setConversationTitle(conv.title);
            setSelectedModel(conv.model);
            setIsHistoryOpen(false);
            addToast("success", `Conversation "${conv.title}" chargée`);
        }
    };

    // Delete conversation
    const handleDeleteConversation = (id: string) => {
        deleteConversation(id);
        loadConversations();

        // If deleted conversation was active, create new one
        if (id === currentConversationId) {
            handleNewConversation();
        }

        addToast("success", "Conversation supprimée");
    };

    const fetchAvailableModels = async () => {
        try {
            const response = await fetch('/api/chat/models');
            if (response.ok) {
                const data = await response.json();
                const modelIds = data.models?.map((m: any) => m.id) || [];
                setAvailableModels(modelIds);
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    const switchToNextModel = (currentModel: string): string | null => {
        const currentIndex = availableModels.indexOf(currentModel);
        if (currentIndex === -1 || currentIndex === availableModels.length - 1) {
            return availableModels[0] || null;
        }
        return availableModels[currentIndex + 1];
    };

    const uploadFile = async (file: File) => {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            addToast("error", "Le fichier est trop volumineux (max 5MB)");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/chat/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'upload du fichier");
            }

            const fileData = await response.json();
            setSelectedFile(fileData);
            addToast("success", `Fichier "${fileData.name}" ajouté avec succès`);
        } catch (error) {
            console.error("Error uploading file:", error);
            addToast("error", "Erreur lors de l'upload du fichier");
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;

        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault(); // Prevent default paste behavior if we handle a file
                    await uploadFile(file);
                    return; // Only handle one file at a time
                }
            }
        }
    };

    const sendMessageWithRetry = async (userMessage: ChatMessage, modelToUse: string, retryCount = 0): Promise<boolean> => {
        try {
            const response = await fetch("/api/chat/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: modelToUse,
                    messages: [...messages, userMessage],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check for specific error types
                if (response.status === 401) {
                    window.location.href = "/auth/signin";
                    throw new Error("UNAUTHORIZED");
                } else if (response.status === 429) {
                    throw new Error("RATE_LIMIT");
                } else if (response.status === 503) {
                    throw new Error("MODEL_UNAVAILABLE");
                } else if (data.error?.includes("quota") || data.error?.includes("token")) {
                    throw new Error("QUOTA_EXCEEDED");
                }
                throw new Error(data.error || "Erreur lors de l'envoi du message");
            }

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: data.message,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            return true;
        } catch (error: any) {
            const errorType = error.message;

            // Handle specific errors with auto-switching
            if ((errorType === "RATE_LIMIT" || errorType === "MODEL_UNAVAILABLE" || errorType === "QUOTA_EXCEEDED") && retryCount < 3) {
                const nextModel = switchToNextModel(modelToUse);

                if (nextModel && nextModel !== modelToUse) {
                    const errorMessages = {
                        "RATE_LIMIT": "Limite de requêtes atteinte",
                        "MODEL_UNAVAILABLE": "Modèle non disponible",
                        "QUOTA_EXCEEDED": "Quota de tokens épuisé"
                    };

                    addToast("warning", `${errorMessages[errorType as keyof typeof errorMessages] || "Erreur"}. Basculement vers un autre modèle...`);
                    setSelectedModel(nextModel);

                    // Retry with next model
                    return await sendMessageWithRetry(userMessage, nextModel, retryCount + 1);
                }
            }

            // If all retries failed or other error
            console.error("Error sending message:", error);

            const errorMessages: Record<string, string> = {
                "RATE_LIMIT": "Limite de requêtes atteinte pour tous les modèles disponibles",
                "MODEL_UNAVAILABLE": "Aucun modèle disponible actuellement",
                "QUOTA_EXCEEDED": "Quota épuisé pour tous les modèles"
            };

            addToast("error", errorMessages[errorType] || "Une erreur s'est produite. Veuillez réessayer.");

            const errorMessage: ChatMessage = {
                role: "assistant",
                content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);

            return false;
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedFile) return;
        if (!selectedModel) {
            addToast("warning", "Veuillez sélectionner un modèle");
            return;
        }

        // Create new conversation if none exists
        if (!currentConversationId) {
            setCurrentConversationId(generateConversationId());
        }

        const userMessage: ChatMessage = {
            role: "user",
            content: input.trim(),
            timestamp: Date.now(),
            fileData: selectedFile || undefined,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setSelectedFile(null);
        setLoading(true);

        await sendMessageWithRetry(userMessage, selectedModel);
        setLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handlePrePrompt = () => {
        const prePromptText = 'Traduit cet article en Anglais, garde la mise en forme actuelle et veille à optimiser la traduction pour le SEO : ""';
        setInput(prePromptText);
        // Focus on input and place cursor before the closing quotes
        if (inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => {
                const cursorPos = prePromptText.length - 1;
                inputRef.current?.setSelectionRange(cursorPos, cursorPos);
            }, 0);
        }
    };

    // Copy entire message content
    const handleCopyMessage = async (content: string, index: number) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedMessageIndex(index);
            addToast("success", "Message copié !");
            setTimeout(() => setCopiedMessageIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            addToast("error", "Erreur lors de la copie");
        }
    };

    // Regenerate AI response
    const handleRegenerateResponse = async (messageIndex: number) => {
        // Find the user message that triggered this response
        if (messageIndex === 0 || messages[messageIndex - 1].role !== "user") {
            addToast("error", "Impossible de régénérer cette réponse");
            return;
        }

        const userMessage = messages[messageIndex - 1];

        // Remove the AI response and all subsequent messages
        const updatedMessages = messages.slice(0, messageIndex);
        setMessages(updatedMessages);
        setLoading(true);

        // Regenerate the response
        await sendMessageWithRetry(userMessage, selectedModel);
        setLoading(false);
    };

    return (
        <>
            {/* Conversation History Panel */}
            {isHistoryOpen && (
                <ConversationHistory
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={handleSelectConversation}
                    onDeleteConversation={handleDeleteConversation}
                    onNewConversation={handleNewConversation}
                    onClose={() => setIsHistoryOpen(false)}
                />
            )}

            <div className={`fixed ${isExpanded ? 'inset-4' : 'bottom-20 right-4 w-96 h-[600px]'} bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 z-50 animate-slide-up overflow-hidden transition-all duration-300`}>
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    {/* Title and Buttons */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {conversationTitle}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* History Button */}
                            <button
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                aria-label="Historique"
                                title="Historique des conversations"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            {/* Expand/Collapse Button */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                aria-label={isExpanded ? "Réduire" : "Agrandir"}
                                title={isExpanded ? "Réduire" : "Agrandir"}
                            >
                                {isExpanded ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                )}
                            </button>
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                aria-label="Fermer le chat"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {/* Model Selector */}
                    <div className="px-4 pb-3">
                        <ModelSelector
                            selectedModel={selectedModel}
                            onModelChange={setSelectedModel}
                        />
                    </div>
                    {/* Pre-prompt Button */}
                    <div className="px-4 pb-3">
                        <button
                            onClick={handlePrePrompt}
                            className="w-full text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                            title="Insérer le prompt de traduction SEO"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            Traduction SEO EN
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                            <p>Commencez une conversation avec l&apos;IA</p>
                            <p className="text-sm mt-2">Sélectionnez un modèle et posez votre question</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div className="max-w-[85%] relative group">
                                <div
                                    className={`rounded-lg px-4 py-2 ${message.role === "user"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        }`}
                                >
                                    {message.fileData && (
                                        <div className="mb-2 text-xs opacity-75 flex items-center gap-1">
                                            📎 {message.fileData.name}
                                            <span className="text-xs opacity-60">
                                                ({(message.fileData.size / 1024).toFixed(1)} KB)
                                            </span>
                                        </div>
                                    )}
                                    <MessageContent content={message.content} role={message.role} />
                                </div>

                                {/* Action buttons for assistant messages */}
                                {message.role === "assistant" && (
                                    <div className="absolute -bottom-6 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Copy button */}
                                        <button
                                            onClick={() => handleCopyMessage(message.content, index)}
                                            className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-xs flex items-center gap-1"
                                            title="Copier la réponse"
                                        >
                                            {copiedMessageIndex === index ? (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Copié</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>Copier</span>
                                                </>
                                            )}
                                        </button>

                                        {/* Regenerate button */}
                                        <button
                                            onClick={() => handleRegenerateResponse(index)}
                                            className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-xs flex items-center gap-1"
                                            title="Régénérer la réponse"
                                            disabled={loading}
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>Régénérer</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {selectedFile && (
                        <div className="mb-2 flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded">
                            <span className="flex items-center gap-1">
                                📎 {selectedFile.name}
                                <span className="text-xs opacity-75">
                                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </span>
                            </span>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="ml-auto text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.txt,.md"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            aria-label="Ajouter un fichier"
                            title="Ajouter un fichier (max 5MB)"
                            disabled={loading}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                            </svg>
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onPaste={handlePaste}
                            placeholder="Tapez votre message..."
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || (!input.trim() && !selectedFile)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
}
