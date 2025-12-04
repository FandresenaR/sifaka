import { useState, useEffect } from "react";

export type ToastType = "error" | "warning" | "info" | "success";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (type: ToastType, message: string, duration = 5000) => {
        const id = Date.now().toString();
        const toast: Toast = { id, type, message, duration };

        setToasts((prev) => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, addToast, removeToast };
}

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case "error":
                return "bg-red-500 text-white";
            case "warning":
                return "bg-yellow-500 text-white";
            case "success":
                return "bg-green-500 text-white";
            case "info":
            default:
                return "bg-blue-500 text-white";
        }
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case "error":
                return "⚠️";
            case "warning":
                return "⚡";
            case "success":
                return "✓";
            case "info":
            default:
                return "ℹ️";
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${getToastStyles(toast.type)} px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in`}
                >
                    <span className="text-lg flex-shrink-0">{getIcon(toast.type)}</span>
                    <p className="flex-1 text-sm">{toast.message}</p>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="flex-shrink-0 hover:opacity-75 transition-opacity"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
