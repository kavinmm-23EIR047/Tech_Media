/**
 * Mobile Bottom Navigation Bar (md:hidden)
 * Balanced layout with dead-centered "+" create button.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Plus, Search } from "lucide-react";

interface BottomNavProps {
  onOpenCreate: () => void;
  onOpenSearch: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenCreate,
  onOpenSearch,
}) => {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isEnquiries = pathname.startsWith("/enquiries");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] md:hidden px-3 pt-1 pb-2 safe-area-bottom"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        {/* 1. Dashboard */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 ${
            isDashboard
              ? "text-violet-700 font-semibold"
              : "text-gray-500 hover:text-gray-900 active:scale-95"
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {isDashboard && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-tight tracking-tight">Dashboard</span>
        </Link>

        {/* 2. Enquiries */}
        <Link
          href="/enquiries"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 ${
            isEnquiries
              ? "text-violet-700 font-semibold"
              : "text-gray-500 hover:text-gray-900 active:scale-95"
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5" />
            {isEnquiries && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-tight tracking-tight">Enquiries</span>
        </Link>

        {/* 3. Center Create Action Button */}
        <div className="flex justify-center items-center">
          <button
            onClick={onOpenCreate}
            aria-label="Create new enquiry"
            className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-violet-600 group-hover:bg-violet-700 text-white flex items-center justify-center shadow-lg shadow-violet-500/40 ring-4 ring-white active:scale-90 transition-all duration-200">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[9px] text-gray-500 font-semibold mt-0.5 group-hover:text-violet-700 transition-colors">
              New
            </span>
          </button>
        </div>

        {/* 4. Global Search */}
        <button
          onClick={onOpenSearch}
          aria-label="Search"
          className="flex flex-col items-center justify-center py-1 rounded-xl text-gray-500 hover:text-gray-900 active:scale-95 transition-all cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-tight tracking-tight">Search</span>
        </button>
      </div>
    </nav>
  );
};
