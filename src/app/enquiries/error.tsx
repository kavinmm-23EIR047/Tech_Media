/**
 * Enquiries Route Error Boundary
 */

"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EnquiryRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Enquiries Error]", error);
  }, [error]);

  return (
    <div className="bg-white rounded-2xl p-8 border border-rose-200 shadow-card text-center space-y-4 max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">Enquiry Service Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1">
          {error?.message || "Failed to communicate with Frappe CRM backend. Please check your credentials in .env.local."}
        </p>
      </div>
      <Button
        variant="primary"
        onClick={() => reset()}
        leftIcon={<RefreshCw className="w-4 h-4" />}
        className="shadow-violet-sm"
      >
        Retry Request
      </Button>
    </div>
  );
}
