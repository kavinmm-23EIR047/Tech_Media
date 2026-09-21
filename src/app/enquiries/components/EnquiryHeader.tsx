/**
 * Enquiry List Page Header
 * Styled after Reference Image 1 (Customers page):
 * - Left: Big "Customer Enquiries" title
 * - Right: [Import] [+ Add Enquiry] buttons
 */

"use client";

import React from "react";
import { Download, Plus, RefreshCw } from "lucide-react";

interface EnquiryHeaderProps {
  onOpenCreateModal: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const EnquiryHeader: React.FC<EnquiryHeaderProps> = ({
  onOpenCreateModal,
  onExportCsv,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      {/* Left: Page Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Customer Enquiries</h1>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Import / Export */}
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Import</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-2.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>

        {/* Add Enquiry — Primary violet CTA */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Enquiry</span>
        </button>
      </div>
    </div>
  );
};
