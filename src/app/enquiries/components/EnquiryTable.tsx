/**
 * Enquiry Data Table — Image 1 (Customers page) style
 * - No checkbox, no delete (no delete API exists)
 * - Edit icon: prominent violet colored button
 * - Responsive: shows card grid on mobile/tablet (< lg), table on desktop
 * - Columns: Company | Status | About | Users | License use | Edit
 * - Pagination: Previous | Page N of M | Next
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, ExternalLink } from "lucide-react";
import { Enquiry, EnquiryPagination, EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import { formatDate, stripHtmlTags } from "@/features/enquiries/utils/enquiry.utils";

interface EnquiryTableProps {
  enquiries: Enquiry[];
  pagination: EnquiryPagination;
  sortBy: "creation" | "date" | "name" | "status";
  sortOrder: "asc" | "desc";
  onSort: (field: "creation" | "date" | "name" | "status") => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditEnquiry: (enquiry: Enquiry) => void;
  onQuickStatusChange: (id: string, newStatus: EnquiryStatus) => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_BG_COLORS = [
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-indigo-100 text-indigo-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_BG_COLORS[Math.abs(hash) % AVATAR_BG_COLORS.length];
}

function statusBadge(status: EnquiryStatus) {
  switch (status) {
    case "Won":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    case "In Progress":
      return "bg-blue-50 text-blue-700 border border-blue-200/60";
    case "Lost":
      return "bg-red-50 text-red-700 border border-red-200/60";
    case "Open":
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200/60";
  }
}

function groupBarWidth(group: string, allGroups: string[]): number {
  if (!group || allGroups.length === 0) return 40;
  const idx = allGroups.indexOf(group);
  return Math.min(100, Math.max(25, Math.round(((idx + 1) / allGroups.length) * 100)));
}

// ── Mobile Card ────────────────────────────────────────────────────────────

const MobileEnquiryCard: React.FC<{
  enquiry: Enquiry;
  onEdit: () => void;
}> = ({ enquiry, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cleanDetails = stripHtmlTags(enquiry.enquiryDetails) || "";
  const isLong = cleanDetails.length > 70;
  const avatarName = enquiry.userEmployeeName || enquiry.name;
  const badgeCls = statusBadge(enquiry.status);
  const avatarCls = avatarColor(avatarName);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 hover:border-violet-200 hover:shadow-sm transition-all">
      {/* Top row: Company + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${avatarColor(enquiry.customerName || enquiry.name)} flex items-center justify-center text-sm font-bold shrink-0`}>
            {getInitials(enquiry.customerName || enquiry.name)}
          </div>
          <div className="min-w-0">
            <Link href={`/enquiries/${enquiry.name}`} className="font-semibold text-gray-900 hover:text-violet-700 transition-colors text-sm leading-tight block truncate">
              {enquiry.customerName || "—"}
            </Link>
            <span className="text-xs text-gray-400 font-mono">{enquiry.name}</span>
          </div>
        </div>
        <span className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
          {enquiry.status}
        </span>
      </div>

      {/* About */}
      {cleanDetails && (
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700 leading-relaxed transition-all">
          <p className={!isExpanded ? "line-clamp-2" : "whitespace-pre-wrap break-words"}>
            {cleanDetails}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline mt-1.5 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              {isExpanded ? (
                <>
                  See less <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  See more <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer: date + officer + group + edit */}
      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Officer avatar */}
          <div title={avatarName} className={`w-7 h-7 rounded-full border-2 border-white ${avatarCls} flex items-center justify-center text-[10px] font-bold shrink-0`}>
            {getInitials(avatarName)}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-500 truncate">{enquiry.group || "—"}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(enquiry.date)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <Link
            href={`/enquiries/${enquiry.name}`}
            className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Main Table Component ───────────────────────────────────────────────────

export const EnquiryTable: React.FC<EnquiryTableProps> = ({
  enquiries,
  pagination,
  onPageChange,
  onEditEnquiry,
}) => {
  const allGroups = Array.from(new Set(enquiries.map((e) => e.group).filter(Boolean))).sort();

  return (
    <div className="space-y-3">
      {/* ── Mobile / Tablet Card Grid (hidden on lg+) ── */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {enquiries.map((enquiry) => (
          <MobileEnquiryCard
            key={enquiry.name}
            enquiry={enquiry}
            onEdit={() => onEditEnquiry(enquiry)}
          />
        ))}
      </div>

      {/* ── Desktop Table (hidden below lg) ── */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="py-3 px-4 font-semibold text-gray-500 text-xs">Company</th>
                <th className="py-3 px-3 font-semibold text-gray-500 text-xs">Status</th>
                <th className="py-3 px-3 font-semibold text-gray-500 text-xs">About</th>
                <th className="py-3 px-3 font-semibold text-gray-500 text-xs">Users</th>
                <th className="py-3 px-3 font-semibold text-gray-500 text-xs">License use</th>
                <th className="py-3 px-3 w-24" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {enquiries.map((enquiry) => {
                const badgeCls = statusBadge(enquiry.status);
                const cleanDetails = stripHtmlTags(enquiry.enquiryDetails) || "";
                const firstLine = cleanDetails.split(/[\n.]/)[0].trim();
                const secondLine = cleanDetails.slice(firstLine.length).replace(/^[\s.]+/, "").split(/[\n.]/)[0].trim();
                const avatarName = enquiry.userEmployeeName || enquiry.name;
                const avatarCls = avatarColor(avatarName);
                const companyInitials = getInitials(enquiry.customerName || enquiry.name);
                const companyCls = avatarColor(enquiry.customerName || enquiry.name);
                const barPct = groupBarWidth(enquiry.group || "", allGroups);

                return (
                  <tr key={enquiry.name} className="hover:bg-gray-50/70 transition-colors group">
                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <Link href={`/enquiries/${enquiry.name}`} className="flex items-center gap-3 group/link">
                        <div className={`w-9 h-9 rounded-lg ${companyCls} flex items-center justify-center text-xs font-bold shrink-0`}>
                          {companyInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover/link:text-violet-700 transition-colors leading-tight text-sm">
                            {enquiry.customerName || "—"}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{enquiry.name}</div>
                        </div>
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
                        {enquiry.status}
                      </span>
                    </td>

                    {/* About */}
                    <td className="py-3.5 px-3 max-w-xs" title={cleanDetails}>
                      {firstLine ? (
                        <div>
                          <div className="text-gray-800 font-medium text-sm leading-tight truncate max-w-[260px]">{firstLine}</div>
                          {secondLine && (
                            <div className="text-gray-400 text-xs mt-0.5 truncate max-w-[260px]">{secondLine}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>

                    {/* Users */}
                    <td className="py-3.5 px-3">
                      <div
                        title={avatarName}
                        className={`w-7 h-7 rounded-full border-2 border-white ${avatarCls} flex items-center justify-center text-[10px] font-bold`}
                      >
                        {getInitials(avatarName)}
                      </div>
                    </td>

                    {/* License use */}
                    <td className="py-3.5 px-3 min-w-[140px]">
                      <div className="flex flex-col gap-1">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400">{enquiry.group || "—"}</div>
                      </div>
                    </td>

                    {/* Edit action — visible violet button */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditEnquiry(enquiry)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          title="Edit Enquiry"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <Link
                          href={`/enquiries/${enquiry.name}`}
                          className="p-1.5 text-gray-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination — Previous | Page N of M | Next */}
      <div className="flex items-center justify-between px-1 py-2">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page <span className="font-semibold text-gray-900">{pagination.page}</span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">{Math.max(pagination.totalPages, 1)}</span>
        </span>

        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
