/**
 * Enquiry Filters Bar — Image 1 (Customers page) style:
 * Row 1: Overview | Table | List view | Segment | Custom  (tab underline style)
 * Row 2: [All time ×] [Status ×] [More filters ▼]   ──   [🔍 Search]
 */

"use client";

import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Calendar, Building2, User, RotateCcw } from "lucide-react";
import { EnquiryFilters as FiltersType, EnquiryStatus, Enquiry, EnquiryStats } from "@/features/enquiries/types/enquiry.types";
import { ViewMode } from "@/features/enquiries/hooks/useEnquiries";

type PageTab = "overview" | "table" | "listview" | "segment" | "custom";

interface EnquiryFiltersProps {
  filters: FiltersType;
  onSearchChange: (val: string) => void;
  onStatusChange: (status: EnquiryStatus | "All") => void;
  onGroupChange: (group: string | "All") => void;
  onEmployeeChange: (emp: string | "All") => void;
  onDateRangeChange: (start: string, end: string) => void;
  onResetFilters: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFiltered: number;
  allEnquiries?: Enquiry[];
  stats?: EnquiryStats;
  onOpenCreateModal?: () => void;
  onExportCsv?: () => void;
}

export const EnquiryFilters: React.FC<EnquiryFiltersProps> = ({
  filters,
  onSearchChange,
  onStatusChange,
  onGroupChange,
  onEmployeeChange,
  onDateRangeChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  allEnquiries = [],
}) => {
  const [activeTab, setActiveTab] = useState<PageTab>("overview");
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  const dynamicGroups = useMemo(() => {
    const groups = new Set<string>();
    allEnquiries.forEach((e) => { if (e.group) groups.add(e.group); });
    return Array.from(groups).sort();
  }, [allEnquiries]);

  const dynamicEmployees = useMemo(() => {
    const map = new Map<string, string>();
    allEnquiries.forEach((e) => {
      if (e.userEmployee) map.set(e.userEmployee, e.userEmployeeName || e.userEmployee);
    });
    return Array.from(map.entries());
  }, [allEnquiries]);

  const hasDateFilter = !!(filters.startDate || filters.endDate);
  const hasStatusFilter = filters.status !== "All";
  const hasGroupFilter = filters.group !== "All";
  const hasEmployeeFilter = filters.employee !== "All";
  const hasAnyChip = hasDateFilter || hasStatusFilter || hasGroupFilter || hasEmployeeFilter;

  const tabs: Array<{ key: PageTab; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "table", label: "Table" },
    { key: "listview", label: "List view" },
    { key: "segment", label: "Segment" },
    { key: "custom", label: "Custom" },
  ];

  // When tab changes, sync to viewMode
  const handleTabClick = (tab: PageTab) => {
    setActiveTab(tab);
    if (tab === "table") onViewModeChange("table");
    else if (tab === "listview") onViewModeChange("cards");
    else if (tab === "segment") onViewModeChange("analytics");
    else onViewModeChange("table");
  };

  return (
    <div className="mb-4 w-full">
      {/* Row 1: Page Tabs (underline style, scrollable on mobile) */}
      <div className="flex items-center gap-0 border-b border-gray-200 mb-4 overflow-x-auto no-scrollbar w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 relative ${
                isActive
                  ? "text-gray-900 font-semibold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Row 2: Filter chips + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
        <div className="flex flex-wrap items-center gap-2">
          {/* All time chip */}
          <button
            onClick={() => { if (hasDateFilter) onDateRangeChange("", ""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium hover:border-gray-300 transition-colors cursor-pointer shadow-xs"
          >
            <span>{hasDateFilter ? `${filters.startDate || "…"} → ${filters.endDate || "…"}` : "All time"}</span>
            {hasDateFilter && <X className="w-3.5 h-3.5 text-gray-400" onClick={() => onDateRangeChange("", "")} />}
          </button>

          {/* Status chip */}
          {hasStatusFilter && (
            <button
              onClick={() => onStatusChange("All")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium hover:border-gray-300 transition-colors cursor-pointer shadow-xs"
            >
              <span>{filters.status}</span>
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}

          {/* Group chip */}
          {hasGroupFilter && (
            <button
              onClick={() => onGroupChange("All")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium hover:border-gray-300 transition-colors cursor-pointer shadow-xs"
            >
              <span>{filters.group}</span>
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}

          {/* Employee chip */}
          {hasEmployeeFilter && (
            <button
              onClick={() => onEmployeeChange("All")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium hover:border-gray-300 transition-colors cursor-pointer shadow-xs"
            >
              <span>{filters.employee}</span>
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}

          {/* More filters button */}
          <button
            onClick={() => setIsMoreFiltersOpen((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-sm font-medium transition-colors cursor-pointer shadow-xs ${
              isMoreFiltersOpen || hasAnyChip
                ? "bg-violet-50 border-violet-300 text-violet-700"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More filters</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMoreFiltersOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Reset all — only shown when filters active */}
          {hasAnyChip && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-56 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search enquiries…"
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all shadow-2xs"
          />
          {filters.search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded More Filters panel */}
      {isMoreFiltersOpen && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onStatusChange(e.target.value as EnquiryStatus | "All")}
              className="w-full text-sm py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-violet-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {(["Open", "In Progress", "Won", "Lost"] as EnquiryStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Business Group */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-violet-500" />
              Business Group
            </label>
            <select
              value={filters.group}
              onChange={(e) => onGroupChange(e.target.value)}
              className="w-full text-sm py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-violet-400 cursor-pointer"
            >
              <option value="All">All Groups</option>
              {dynamicGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Handling Officer */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-500" />
              Handling Officer
            </label>
            <select
              value={filters.employee}
              onChange={(e) => onEmployeeChange(e.target.value)}
              className="w-full text-sm py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-violet-400 cursor-pointer"
            >
              <option value="All">All Officers</option>
              {dynamicEmployees.map(([empId, empName]) => (
                <option key={empId} value={empId}>{empName}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
              Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onDateRangeChange(e.target.value, filters.endDate)}
                className="text-sm py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-violet-400 cursor-pointer"
              />
              <span className="text-gray-400 font-medium text-sm">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onDateRangeChange(filters.startDate, e.target.value)}
                className="text-sm py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-violet-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
