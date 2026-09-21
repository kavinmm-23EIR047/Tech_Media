/**
 * Root Error Boundary for Next.js App Router
 * Catches any unhandled UI or runtime errors gracefully
 */

"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CRM Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 border border-rose-200 shadow-card text-center space-y-4 max-w-md w-full">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">CRM Workspace Encountered an Error</h2>
          <p className="text-xs text-slate-500 mt-1">
            {error?.message || "An unexpected issue occurred while rendering this page."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link href="/enquiries">
            <Button variant="secondary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="shadow-violet-sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
