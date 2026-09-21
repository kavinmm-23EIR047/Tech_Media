/**
 * Enquiry Card & Kanban Board Component for Visual CRM Pipeline View
 * Exactly styled after Reference Image 2 (LeadNest) and Image 3 (BizLink):
 * - Status column headers with count badges: Open, In Progress, Won, Lost
 * - Card elements: Top tag badge (New lead, Priority, Returning), customer title in 16px bold, details excerpt, assigned officer with avatar, date, comments icon, 3-dots menu
 * - Priority deal action widget inspired by LeadNest
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Calendar,
  Building2,
  ArrowRight,
  Edit,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  User,
  Eye,
  MoreVertical,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Enquiry, EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import { formatDate, timeAgo, stripHtmlTags } from "@/features/enquiries/utils/enquiry.utils";
import { useToast } from "@/components/ui/Toast";

interface EnquiryCardGridProps {
  enquiries: Enquiry[];
  onEditEnquiry: (enquiry: Enquiry) => void;
  onQuickStatusChange: (id: string, newStatus: EnquiryStatus) => void;
}

// ── Kanban Card Item ────────────────────────────────────────────────────────

const KanbanCardItem: React.FC<{
  enquiry: Enquiry;
  onEditEnquiry: (enquiry: Enquiry) => void;
  onQuickStatusChange: (id: string, newStatus: EnquiryStatus) => void;
  onCopyId: (e: React.MouseEvent, id: string) => void;
}> = ({ enquiry, onEditEnquiry, onQuickStatusChange, onCopyId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cleanDetails = stripHtmlTags(enquiry.enquiryDetails) || "";
  const isLong = cleanDetails.length > 80;

  const initials = (enquiry.assignedToEmployeeName || enquiry.userEmployeeName || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const getCardTagBadge = (e: Enquiry) => {
    if (e.status === "Won") {
      return { text: "Closed Deal", class: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
    if (e.status === "In Progress") {
      return { text: "Priority Lead", class: "bg-violet-100 text-violet-800 border-violet-200" };
    }
    if (e.group === "Stores" || e.group === "DELL") {
      return { text: e.group, class: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    return { text: "New Lead", class: "bg-slate-100 text-slate-800 border-slate-200" };
  };

  const tag = getCardTagBadge(enquiry);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group space-y-3 relative">
      <div>
        {/* Top Tag & 3-Dots Menu */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${tag.class}`}>
            {tag.text}
          </span>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Action Popover */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 text-xs text-left animate-fade-in-up">
                  <button
                    onClick={(e) => {
                      onCopyId(e, enquiry.name);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy ID</span>
                  </button>
                  <button
                    onClick={() => {
                      onEditEnquiry(enquiry);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2 text-slate-700 font-bold hover:bg-slate-50"
                  >
                    <Edit className="w-4 h-4 text-slate-400" />
                    <span>Edit Enquiry</span>
                  </button>
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                    Move Stage
                  </div>
                  {(["Open", "In Progress", "Won", "Lost"] as EnquiryStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onQuickStatusChange(enquiry.name, st);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-1.5 flex items-center justify-between text-slate-600 font-bold hover:bg-slate-50 ${
                        enquiry.status === st ? "text-violet-700 bg-violet-50/50" : ""
                      }`}
                    >
                      <span>{st}</span>
                      {enquiry.status === st && (
                        <Check className="w-3.5 h-3.5 text-violet-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Customer Title & ID */}
        <div className="mb-2">
          <Link
            href={`/enquiries/${enquiry.name}`}
            className="font-black text-slate-900 hover:text-violet-700 text-base leading-snug transition-colors group-hover:underline block"
          >
            {enquiry.customerName || "Direct Commercial Customer"}
          </Link>
          <span className="text-xs font-mono font-bold text-violet-700 mt-0.5 inline-block">
            {enquiry.name}
          </span>
        </div>

        {/* Requirement Details snippet */}
        <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200/50 leading-relaxed mb-3">
          <p className={`text-xs font-medium text-slate-600 ${!isExpanded ? "line-clamp-3" : "whitespace-pre-wrap break-words"}`}>
            {cleanDetails || "No specifications logged for this enquiry."}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="text-[11px] font-semibold text-violet-600 hover:text-violet-800 hover:underline mt-1.5 inline-flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              {isExpanded ? (
                <>
                  See less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  See more <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Contact Info & Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
            <Phone className="w-3.5 h-3.5 text-violet-600" />
            {enquiry.mobile}
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(enquiry.date)}
          </span>
        </div>
      </div>

      {/* Bottom Officer & Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Officer Avatar & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center border border-violet-200 shrink-0 shadow-2xs">
            {initials}
          </div>
          <div className="truncate max-w-[120px]">
            <div className="text-xs font-bold text-slate-900 truncate">
              {enquiry.assignedToEmployeeName || enquiry.userEmployeeName}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Officer
            </div>
          </div>
        </div>

        {/* Quick Edit & Open Link */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditEnquiry(enquiry)}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit Enquiry"
          >
            <Edit className="w-4 h-4" />
          </button>
          <Link
            href={`/enquiries/${enquiry.name}`}
            className="p-1.5 text-violet-700 hover:text-violet-900 rounded-lg hover:bg-violet-50 transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const EnquiryCardGrid: React.FC<EnquiryCardGridProps> = ({
  enquiries,
  onEditEnquiry,
  onQuickStatusChange,
}) => {
  const { success } = useToast();

  const statuses: Array<{
    key: EnquiryStatus;
    label: string;
    headerBg: string;
    headerText: string;
    badgeBg: string;
    badgeText: string;
  }> = [
    {
      key: "Open",
      label: "Open Enquiries",
      headerBg: "bg-blue-50/80 border-blue-200/80",
      headerText: "text-blue-900",
      badgeBg: "bg-blue-600 text-white",
      badgeText: "bg-blue-100 text-blue-800",
    },
    {
      key: "In Progress",
      label: "In Negotiation",
      headerBg: "bg-amber-50/80 border-amber-200/80",
      headerText: "text-amber-900",
      badgeBg: "bg-amber-600 text-white",
      badgeText: "bg-amber-100 text-amber-800",
    },
    {
      key: "Won",
      label: "Deals Closed / Won",
      headerBg: "bg-emerald-50/80 border-emerald-200/80",
      headerText: "text-emerald-900",
      badgeBg: "bg-emerald-600 text-white",
      badgeText: "bg-emerald-100 text-emerald-800",
    },
    {
      key: "Lost",
      label: "Lost / Dropped",
      headerBg: "bg-rose-50/80 border-rose-200/80",
      headerText: "text-rose-900",
      badgeBg: "bg-rose-600 text-white",
      badgeText: "bg-rose-100 text-rose-800",
    },
  ];

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    success(`Enquiry ID "${id}" copied.`);
  };

  return (
    <div className="space-y-6">
      {/* 4 Pipeline Columns Grid (LeadNest / BizLink CRM layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {statuses.map(({ key: status, label, headerBg, headerText, badgeBg }) => {
          const columnItems = enquiries.filter((e) => e.status === status);

          return (
            <div
              key={status}
              className="flex flex-col rounded-2xl bg-slate-100/70 p-4 border border-slate-200/80 min-h-[600px]"
            >
              {/* Column Header (LeadNest style) */}
              <div
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl border mb-4 font-black text-sm shadow-2xs ${headerBg} ${headerText}`}
              >
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-black text-xs shadow-xs ${badgeBg}`}>
                  {columnItems.length}
                </span>
              </div>

              {/* Column Items */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {columnItems.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-xs font-bold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
                    <span>No {status.toLowerCase()} enquiries</span>
                  </div>
                ) : (
                  columnItems.map((enquiry) => (
                    <KanbanCardItem
                      key={enquiry.name}
                      enquiry={enquiry}
                      onEditEnquiry={onEditEnquiry}
                      onQuickStatusChange={onQuickStatusChange}
                      onCopyId={handleCopyId}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Deal Widget (LeadNest Style bottom banner) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-violet-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-violet-400">
            <Sparkles className="w-4 h-4" />
            <span>Priority Deals & Active Pipeline</span>
          </div>
          <h3 className="text-lg font-black text-white">
            Need to assign an officer or update high-value leads?
          </h3>
          <p className="text-xs text-slate-300">
            Keep pipeline momentum strong by reviewing pending customer requirements and logging internal audit updates.
          </p>
        </div>

        <button
          onClick={() => {
            const firstInProg = enquiries.find((e) => e.status === "In Progress" || e.status === "Open");
            if (firstInProg) {
              onEditEnquiry(firstInProg);
            }
          }}
          className="px-5 py-2.5 bg-white hover:bg-violet-50 text-slate-950 rounded-xl font-extrabold text-sm transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
        >
          Assign & Review
        </button>
      </div>
    </div>
  );
};
