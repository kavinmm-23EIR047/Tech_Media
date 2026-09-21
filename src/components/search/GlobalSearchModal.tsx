/**
 * Global CRM Command Palette (Ctrl + K)
 * Fast navigation and cross-module search
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Inbox, Plus, ArrowRight, User, Hash, Tag } from "lucide-react";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { Enquiry } from "@/features/enquiries/types/enquiry.types";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateModal?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateModal,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      // Fetch fresh enquiry list for quick lookup
      enquiryService
        .getEnquiries(
          {
            search: "",
            status: "All",
            group: "All",
            employee: "All",
            startDate: "",
            endDate: "",
            sortBy: "creation",
            sortOrder: "desc",
          },
          { page: 1, pageSize: 50 }
        )
        .then((res) => setEnquiries(res.enquiries))
        .catch(() => {});
    }
  }, [isOpen]);

  const filteredEnquiries = useMemo(() => {
    if (!query.trim()) return enquiries.slice(0, 5);
    const q = query.toLowerCase().trim();
    return enquiries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.mobile.includes(q) ||
        e.group.toLowerCase().includes(q) ||
        e.userEmployeeName.toLowerCase().includes(q) ||
        e.enquiryDetails.toLowerCase().includes(q)
    );
  }, [query, enquiries]);

  if (!isOpen) return null;

  const handleSelectEnquiry = (id: string) => {
    onClose();
    router.push(`/enquiries/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-fade-in-up">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-violet-600 mr-3 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search enquiries, customers, mobile numbers, employees..."
            className="w-full py-4 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {/* Quick Actions */}
          {onOpenCreateModal && (
            <div
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-violet-50 text-slate-700 hover:text-violet-700 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-violet-700">
                    Create New Enquiry
                  </div>
                  <div className="text-xs text-slate-400">Add a new customer requirement</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-transform group-hover:translate-x-1" />
            </div>
          )}

          <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {query ? "Matching Enquiries" : "Recent Enquiries"}
          </div>

          {filteredEnquiries.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredEnquiries.map((e) => (
              <div
                key={e.name}
                onClick={() => handleSelectEnquiry(e.name)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 group-hover:text-violet-700 transition-colors">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-700">{e.name}</span>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {e.customerName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          e.status === "Won"
                            ? "bg-emerald-50 text-emerald-700"
                            : e.status === "Lost"
                            ? "bg-rose-50 text-rose-700"
                            : e.status === "In Progress"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {e.enquiryDetails}
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400 flex-shrink-0 pl-2">
                  <div>{e.group}</div>
                  <div>{e.mobile}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">Enter</kbd>
          </div>
          <div>Press ESC to close</div>
        </div>
      </div>
    </div>
  );
};
