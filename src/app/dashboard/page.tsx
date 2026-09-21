/**
 * CRM Dashboard — Welcome page with:
 * 1. Time-based greeting ("Good morning/afternoon/evening, Sales Team")
 * 2. Live KPI summary from Frappe API
 * 3. Recent enquiries preview table
 * 4. Status distribution overview
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useEnquiries } from "@/features/enquiries/hooks/useEnquiries";
import { stripHtmlTags, formatDate } from "@/features/enquiries/utils/enquiry.utils";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// ── time-based greeting helper ─────────────────────────────────────────────

function getGreeting(): { greeting: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { greeting: "Good morning", emoji: "🌅" };
  if (h < 17) return { greeting: "Good afternoon", emoji: "☀️" };
  if (h < 20) return { greeting: "Good evening", emoji: "🌇" };
  return { greeting: "Good night", emoji: "🌙" };
}

function avatarColor(name: string): string {
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

function statusBadge(status: string): string {
  switch (status) {
    case "Open": return "text-blue-600 bg-blue-50 border border-blue-200";
    case "In Progress": return "text-amber-600 bg-amber-50 border border-amber-200";
    case "Won": return "text-emerald-600 bg-emerald-50 border border-emerald-200";
    case "Lost": return "text-gray-500 bg-gray-100 border border-gray-200";
    default: return "text-gray-500 bg-gray-100 border border-gray-200";
  }
}

// ── Dashboard Component ────────────────────────────────────────────────────

export default function DashboardPage() {
  const { enquiries, stats, isLoading, isError, refetch } = useEnquiries(5);
  const [{ greeting, emoji }, setGreeting] = useState(getGreeting);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock update every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setGreeting(getGreeting());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const kpiCards = [
    {
      label: "Total Enquiries",
      value: stats.total,
      icon: Inbox,
      color: "text-violet-600",
      bg: "bg-violet-50",
      bar: stats.total > 0 ? 100 : 0,
      barColor: "bg-violet-500",
    },
    {
      label: "Open",
      value: stats.open,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      bar: stats.total > 0 ? Math.round((stats.open / stats.total) * 100) : 0,
      barColor: "bg-blue-500",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
      bar: stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0,
      barColor: "bg-amber-500",
    },
    {
      label: "Won",
      value: stats.won,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      bar: stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0,
      barColor: "bg-emerald-500",
    },
    {
      label: "Lost",
      value: stats.lost,
      icon: XCircle,
      color: "text-gray-500",
      bg: "bg-gray-50",
      bar: stats.total > 0 ? Math.round((stats.lost / stats.total) * 100) : 0,
      barColor: "bg-gray-400",
    },
  ];

  return (
    <AppShell>
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {emoji} {greeting},
          </div>
          <div className="text-3xl font-bold text-gray-900">Sales Team</div>
          <div className="text-sm text-gray-500 mt-1">{dateStr} · {timeStr}</div>
        </div>
        <Link
          href="/enquiries"
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          Manage Enquiries
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</div>
              )}
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${card.barColor} rounded-full transition-all duration-700`}
                    style={{ width: isLoading ? "0%" : `${card.bar}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">{card.bar}% of total</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Two-column layout: Recent Enquiries + Status breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Enquiries</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest records from Frappe CRM</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <Link
                href="/enquiries"
                className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Unable to load enquiries.{" "}
              <button onClick={refetch} className="text-violet-600 underline cursor-pointer">Retry</button>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">No enquiries found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {enquiries.map((enq) => {
                const cleanDetails = stripHtmlTags(enq.enquiryDetails) || "";
                const snippet = cleanDetails.split(/[\n.]/)[0].trim();
                const avatarName = enq.userEmployeeName || enq.name;
                const companyCls = avatarColor(enq.customerName || enq.name);
                const badgeCls = statusBadge(enq.status);

                return (
                  <div key={enq.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    {/* Company initials */}
                    <div className={`w-9 h-9 rounded-lg ${companyCls} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {(enq.customerName || enq.name).split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/enquiries/${enq.name}`}
                          className="text-sm font-medium text-gray-900 hover:text-violet-700 transition-colors truncate"
                        >
                          {enq.customerName || "—"}
                        </Link>
                        <span className="text-xs font-mono text-gray-400 shrink-0">{enq.name}</span>
                      </div>
                      {snippet && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">{snippet}</div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-gray-400 shrink-0 hidden sm:block">
                      {formatDate(enq.date)}
                    </div>

                    {/* Status badge */}
                    <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badgeCls}`}>
                      {enq.status}
                    </span>

                    {/* Link */}
                    <Link
                      href={`/enquiries/${enq.name}`}
                      className="p-1 text-gray-300 hover:text-violet-600 transition-colors shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status breakdown panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Pipeline Status</h2>
            <p className="text-xs text-gray-400 mt-0.5">Distribution by stage</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-1.5 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-100 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-8" />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Open", value: stats.open, color: "bg-blue-500", text: "text-blue-600" },
                { label: "In Progress", value: stats.inProgress, color: "bg-amber-500", text: "text-amber-600" },
                { label: "Won", value: stats.won, color: "bg-emerald-500", text: "text-emerald-600" },
                { label: "Lost", value: stats.lost, color: "bg-gray-400", text: "text-gray-500" },
              ].map((item) => {
                const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className={`font-bold ${item.text}`}>
                        {item.value} <span className="text-gray-400 font-normal text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Conversion rate highlight */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</div>
                <div className="text-xs text-gray-400 mt-1">Conversion Rate (Won)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
