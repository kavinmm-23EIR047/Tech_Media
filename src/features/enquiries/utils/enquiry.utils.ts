/**
 * CRM Enquiry Utilities, Formatters, Constants, and Export Helpers
 */

import { Enquiry, EnquiryStatus } from "../types/enquiry.types";

export const CRM_GROUPS = [
  "Stores",
  "DELL",
  "Corporate",
  "Retail",
  "Enterprise",
  "Online",
  "Government",
] as const;

export const CRM_EMPLOYEES = [
  { id: "HR-EMP-00003", name: "Rajesh Kumar", role: "Senior Sales Lead", department: "Stores & Direct" },
  { id: "HR-EMP-00012", name: "Priya Sharma", role: "Account Director", department: "DELL & Enterprise" },
  { id: "HR-EMP-00007", name: "Anand Verma", role: "Key Accounts Lead", department: "Corporate & Govt" },
  { id: "HR-EMP-00015", name: "Sneha Patel", role: "Enterprise Executive", department: "Cloud & Infrastructure" },
] as const;

export const CRM_STATUS_CONFIG: Record<
  EnquiryStatus,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
    badgeClass: string;
    iconName: "Clock" | "TrendingUp" | "CheckCircle2" | "XCircle";
  }
> = {
  Open: {
    label: "Open",
    bgClass: "bg-blue-50/80",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    iconName: "Clock",
  },
  "In Progress": {
    label: "In Progress",
    bgClass: "bg-violet-50/80",
    textClass: "text-violet-700",
    borderClass: "border-violet-200",
    dotClass: "bg-violet-600",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    iconName: "TrendingUp",
  },
  Won: {
    label: "Won",
    bgClass: "bg-emerald-50/80",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
    dotClass: "bg-emerald-600",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconName: "CheckCircle2",
  },
  Lost: {
    label: "Lost",
    bgClass: "bg-rose-50/80",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
    dotClass: "bg-rose-500",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    iconName: "XCircle",
  },
};

/**
 * Format date string into human friendly format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format datetime string into friendly full format
 */
export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return "—";
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateTimeString;
  }
}

/**
 * Strip HTML tags (e.g. Quill/Frappe editor tags) and return clean plain text
 */
export function stripHtmlTags(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Relative time ago formatter
 */
export function timeAgo(dateTimeString?: string): string {
  if (!dateTimeString) return "";
  try {
    const d = new Date(dateTimeString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(dateTimeString);
  } catch {
    return "";
  }
}

/**
 * Export enquiries list to downloadable CSV
 */
export function exportEnquiriesToCsv(enquiries: Enquiry[], filename = "enquiries_export.csv") {
  const headers = [
    "Enquiry ID",
    "Customer Name",
    "Mobile",
    "Status",
    "Group",
    "Employee ID",
    "Employee Name",
    "Enquiry Date",
    "Created Date",
    "Enquiry Details",
    "Status Details",
  ];

  const rows = enquiries.map((e) => [
    `"${e.name}"`,
    `"${(e.customerName || "").replace(/"/g, '""')}"`,
    `"${e.mobile}"`,
    `"${e.status}"`,
    `"${e.group}"`,
    `"${e.userEmployee}"`,
    `"${(e.userEmployeeName || "").replace(/"/g, '""')}"`,
    `"${e.date}"`,
    `"${e.creation}"`,
    `"${(e.enquiryDetails || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
    `"${(e.statusDetails || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
