/**
 * Modern CRM Analytics & Charts Component
 * Styled exactly after Reference Image 2 (Pivora CRM Platform):
 * - Middle Left: Pipeline Volume Bar Chart with timeframe tabs (1D, 1W, 1M, 6M, 1Y, ALL) and capped bars
 * - Middle Right: Calendar & Team Activity Schedule Widget with date selector and meeting cards
 * - Bottom Row:
 *   1. Leads Management Horizontal Progress Bars (Status, Sources, Qualification)
 *   2. Top Business Groups Volume Matrix with percentage bars
 *   3. Retention & Team Conversion Rate chart
 */

"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  Sparkles,
  Users,
  Video,
  MessageSquare,
  Building2,
  TrendingUp,
} from "lucide-react";
import { EnquiryStats } from "@/features/enquiries/types/enquiry.types";

interface EnquiryChartsProps {
  stats: EnquiryStats;
}

export const EnquiryCharts: React.FC<EnquiryChartsProps> = ({ stats }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1Y");
  const [activeTab, setActiveTab] = useState<"Status" | "Sources" | "Qualification">("Status");
  const [selectedDate, setSelectedDate] = useState(8);

  const months = [
    { name: "Mar", value: 45, max: 100 },
    { name: "Apr", value: 30, max: 100 },
    { name: "May", value: 65, max: 100 },
    { name: "Jun", value: 40, max: 100 },
    { name: "Jul", value: 75, max: 100 },
    { name: "Aug", value: 25, max: 100 },
    { name: "Sept", value: 85, max: 100 },
    { name: "Oct", value: 60, max: 100 },
    { name: "Nov", value: 90, max: 100 },
    { name: "Dec", value: 35, max: 100 },
    { name: "Jan", value: 28, max: 100 },
    { name: "Feb", value: 50, max: 100 },
  ];

  const groupEntries = Object.entries(stats.byGroup || {}).sort((a, b) => b[1] - a[1]);
  const maxGroupCount = Math.max(...groupEntries.map(([, c]) => c), 1);

  const calendarDays = [
    { day: "Su", date: 5 },
    { day: "Mo", date: 6 },
    { day: "Tu", date: 7 },
    { day: "We", date: 8 },
    { day: "Th", date: 9 },
    { day: "Fr", date: 10 },
    { day: "Sa", date: 11 },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* 1. Middle 2-Column Section (Exact Layout of Image 2 Pivora CRM) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card (2/3 width): Volume & Pipeline Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-card flex flex-col justify-between">
          {/* Header Row: Title, Total Value & Timeframe Filter Tabs */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Enquiries Volume & Pipeline Flow</span>
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {stats.total} Records
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    +100% vs last month
                  </span>
                </div>
              </div>

              {/* Timeframe Tabs: 1D 1W 1M 6M 1Y ALL (Image 2 style) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
                {["1D", "1W", "1M", "6M", "1Y", "ALL"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      selectedTimeframe === tf
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle / Key Guideline */}
            <div className="text-xs text-slate-400 font-semibold mb-6 flex items-center justify-between">
              <span>Monthly commercial inquiries distribution</span>
              <span className="flex items-center gap-1.5 text-violet-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-violet-600" />
                Live Inflow Velocity
              </span>
            </div>
          </div>

          {/* Bar Chart Area (Matching Image 2's custom purple capped bar design) */}
          <div className="relative pt-6 pb-2">
            {/* Dashed Grid Line */}
            <div className="absolute top-10 inset-x-0 border-b border-dashed border-slate-200" />

            <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56">
              {months.map((m) => (
                <div key={m.name} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg relative overflow-hidden transition-all group-hover:bg-violet-100 flex flex-col justify-end" style={{ height: `${m.value}%` }}>
                    {/* Purple Top Cap Outline (Image 2 style) */}
                    <div className="h-1.5 w-full bg-violet-600 rounded-t-lg shadow-xs" />
                    <div className="flex-1 bg-violet-50/60 group-hover:bg-violet-200/60 transition-colors" />
                  </div>

                  {/* Month Label */}
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-violet-700 transition-colors">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card (1/3 width): Calendar & Team Meeting Schedule (Image 2 style) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            {/* Top Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-black text-slate-900">October 2026</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 7 Days Mini Calendar Row */}
            <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-slate-100 mb-5">
              {calendarDays.map((d) => (
                <div
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className="flex flex-col items-center gap-1 cursor-pointer py-1.5 rounded-xl transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{d.day}</span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      selectedDate === d.date
                        ? "bg-violet-600 text-white shadow-violet-sm"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {d.date}
                  </span>
                </div>
              ))}
            </div>

            {/* Meeting & Follow-up Cards (Image 2 style) */}
            <div className="space-y-3">
              {/* Meeting Card 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-slate-900">
                    Team Pipeline Review
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                    <span>9:00 am - 10:00 am</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 border border-white text-[10px] font-bold flex items-center justify-center">
                      R
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 border border-white text-[10px] font-bold flex items-center justify-center">
                      P
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                    Google Meet
                  </span>
                </div>
              </div>

              {/* Meeting Card 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-slate-900">
                    Client Proposal Follow-up
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">
                    <span>10:15 am - 11:45 am</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 border border-white text-[10px] font-bold flex items-center justify-center">
                      A
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-md">
                    Slack
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-center">
            <span className="text-xs font-bold text-violet-700 hover:underline cursor-pointer">
              + Schedule Follow-up Meeting
            </span>
          </div>
        </div>
      </div>

      {/* 2. Bottom 3-Widget Row (Exact Layout of Image 2 Pivora CRM) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Leads Management Horizontal Bars */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">Leads Management</h3>
              <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            {/* Sub-tabs: Status, Sources, Qualification (Image 2 style) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
              {(["Status", "Sources", "Qualification"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Progress Bars (Image 2 style) */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Open Leads</span>
                  <span className="text-violet-700 font-mono">{stats.open} records</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.open / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">In Negotiation</span>
                  <span className="text-violet-700 font-mono">{stats.inProgress} records</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Won / Deals Closed</span>
                  <span className="text-emerald-700 font-mono">{stats.won} records</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.won / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Lost / Dropped</span>
                  <span className="text-rose-600 font-mono">{stats.lost} records</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.total > 0 ? (stats.lost / stats.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: Top Business Groups Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">Top Groups & Units</h3>
              <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="space-y-3.5 py-1">
              {groupEntries.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">No group data available</div>
              ) : (
                groupEntries.slice(0, 5).map(([group, count], idx) => {
                  const percent = Math.round((count / maxGroupCount) * 100);

                  return (
                    <div key={group} className="flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 font-bold text-slate-400">{idx + 1}.</span>
                        <span className="font-bold text-slate-800 truncate">{group}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-mono font-black text-slate-900 w-8 text-right">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button className="text-xs font-bold text-violet-700 hover:underline cursor-pointer">
              View all business categories →
            </button>
          </div>
        </div>

        {/* Widget 3: Retention & Employee Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">Conversion Velocity</h3>
              <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="mb-4">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.conversionRate}%
              </div>
              <div className="text-xs font-bold text-emerald-600">
                +{stats.conversionRate}% vs target benchmark
              </div>
            </div>

            <div className="space-y-3">
              {stats.employeePerformance.slice(0, 3).map((emp) => (
                <div key={emp.employee} className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{emp.name}</span>
                    <span className="font-extrabold text-violet-700">{emp.conversion}% Win</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-600 rounded-full"
                      style={{ width: `${emp.conversion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-xs font-bold text-slate-400">
              Live updates synced from Frappe CRM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
