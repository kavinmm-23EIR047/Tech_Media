/**
 * KPI Stats Cards — Image 1 (Customers page) style:
 * 3 horizontal cards in a row:
 * - Total Enquiries  (count + % badge)
 * - Members / Active (In Progress + Open count + % badge)
 * - Won / Active now (count + avatar row from live data)
 */

"use client";

import React from "react";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";
import { EnquiryStats as StatsType, Enquiry, EnquiryStatus } from "@/features/enquiries/types/enquiry.types";

interface EnquiryStatsProps {
  stats: StatsType;
  enquiries?: Enquiry[];
  activeStatusFilter: EnquiryStatus | "All";
  onSelectStatus: (status: EnquiryStatus | "All") => void;
  onOpenCreateModal?: () => void;
  onViewAnalytics?: () => void;
}

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Deterministic pastel color based on a string
function avatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: "bg-violet-100", text: "text-violet-700" },
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-emerald-100", text: "text-emerald-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-rose-100", text: "text-rose-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
    { bg: "bg-teal-100", text: "text-teal-700" },
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

export const EnquiryStats: React.FC<EnquiryStatsProps> = ({
  stats,
  enquiries = [],
  activeStatusFilter,
  onSelectStatus,
}) => {
  // Build a deduplicated list of won-enquiry employee names for avatars
  const wonEmployees = enquiries
    .filter((e) => e.status === "Won")
    .map((e) => e.userEmployeeName || e.customerName || "?")
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  const openPct = stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0;
  const wonPct = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0;
  const totalPct = stats.total > 0 ? 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Card 1 — Total Enquiries */}
      <div
        onClick={() => onSelectStatus("All")}
        className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
          activeStatusFilter === "All"
            ? "border-violet-400 ring-2 ring-violet-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Total enquiries</span>
          <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">{stats.total.toLocaleString()}</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <ArrowUpRight className="w-3 h-3" />
            +{totalPct}%
          </span>
        </div>
      </div>

      {/* Card 2 — Open Enquiries (78) */}
      <div
        onClick={() => onSelectStatus(activeStatusFilter === "Open" ? "All" : "Open")}
        className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
          activeStatusFilter === "Open"
            ? "border-violet-400 ring-2 ring-violet-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Open enquiries</span>
          <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">{stats.open.toLocaleString()}</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <ArrowUpRight className="w-3 h-3" />
            +{openPct}%
          </span>
        </div>
      </div>

      {/* Card 3 — Active now / Won (17) */}
      <div
        onClick={() => onSelectStatus(activeStatusFilter === "Won" ? "All" : "Won")}
        className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
          activeStatusFilter === "Won"
            ? "border-violet-400 ring-2 ring-violet-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Won</span>
          <button className="text-gray-400 hover:text-gray-600 p-0.5 rounded" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-gray-900">{stats.won.toLocaleString()}</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <ArrowUpRight className="w-3 h-3" />
              +{wonPct}%
            </span>
          </div>

          {/* Avatar stack from live won-enquiry employees */}
          {wonEmployees.length > 0 && (
            <div className="flex items-center -space-x-2">
              {wonEmployees.map((name, idx) => {
                const c = avatarColor(name);
                return (
                  <div
                    key={idx}
                    title={name}
                    className={`w-7 h-7 rounded-full border-2 border-white ${c.bg} ${c.text} flex items-center justify-center text-[10px] font-bold ring-0`}
                  >
                    {getInitials(name)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
