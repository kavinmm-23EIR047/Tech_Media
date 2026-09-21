/**
 * Global Toast Notification System with Violet Accent
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, durationMs?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string, durationMs = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastItem = { id, type, title, message, durationMs };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast(message, "success", title),
    [showToast]
  );
  const error = useCallback(
    (message: string, title?: string) => showToast(message, "error", title || "Error", 6000),
    [showToast]
  );
  const info = useCallback(
    (message: string, title?: string) => showToast(message, "info", title),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast(message, "warning", title),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-slide-in-right ${
              toast.type === "success"
                ? "bg-white/95 text-slate-900 border-emerald-200 shadow-emerald-500/10"
                : toast.type === "error"
                ? "bg-white/95 text-slate-900 border-rose-200 shadow-rose-500/10"
                : toast.type === "warning"
                ? "bg-white/95 text-slate-900 border-amber-200 shadow-amber-500/10"
                : "bg-white/95 text-slate-900 border-violet-200 shadow-violet-500/10"
            }`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-600" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-violet-600" />}
            </div>
            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold text-slate-900 mb-0.5">{toast.title}</div>}
              <div className="text-slate-600 leading-snug">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
