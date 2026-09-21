/**
 * Global Error Component for Next.js App Router Root
 */

"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl p-8 border border-rose-200 shadow-xl text-center space-y-4 max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Error</h2>
            <p className="text-xs text-slate-500 mt-1">
              {error?.message || "An unexpected error occurred. Please refresh or try again."}
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            Reload CRM
          </button>
        </div>
      </body>
    </html>
  );
}
