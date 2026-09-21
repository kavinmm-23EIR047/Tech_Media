/**
 * Accessible Animated Modal Dialog Component with Violet Accents
 */

"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
    "2xl": "max-w-4xl",
    full: "max-w-[95vw] h-[90vh]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-200 z-10 my-8`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 max-h-[calc(85vh-130px)] overflow-y-auto">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
