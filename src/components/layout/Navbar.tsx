/**
 * Modern CRM Top Navigation Bar
 * Styled after Reference Image 2 (Pivora CRM Platform):
 * - Clean search bar with Ctrl+K shortcut
 * - Notification bell with badge counter
 * - Quick Share button
 * - Solid violet "+ New Enquiry" action
 * - User Profile Avatar
 */

"use client";

import React from "react";
import { Search, Plus, Menu, Bell, Share2 } from "lucide-react";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";

interface NavbarProps {
  onOpenSidebar?: () => void;
  onOpenSearch?: () => void;
  onOpenCreateModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  onOpenSearch,
  onOpenCreateModal,
}) => {
  const { success } = useToast();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      success("Workspace link copied to clipboard.");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Matching Image 2 Search AI Mode input) */}
        <button
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full max-w-md px-3.5 py-2.5 bg-slate-50/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200/90 text-xs sm:text-sm transition-all text-left group shadow-2xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-violet-600 group-hover:scale-105 transition-transform" />
            <span className="text-slate-500 group-hover:text-slate-800 font-semibold truncate">
              Search CRM records, customer, mobile (Ctrl + K)...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Action Icons & User Avatar (Image 2 style) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="Share page link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Notification Bell with Badge */}
        <button
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Create Enquiry Primary Action (Solid Violet) */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-violet-sm hover:shadow-violet active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Enquiry</span>
          </button>
        )}

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 text-violet-700 flex items-center justify-center font-black text-xs shadow-2xs">
            RK
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-black text-slate-800 leading-none">Rajesh Kumar</div>
            <div className="text-[10px] text-slate-400 font-medium">Sales Director</div>
          </div>
        </div>
      </div>
    </header>
  );
};
