/**
 * Centralized API Configuration for Frappe CRM v2
 */

// In the browser: route through the Next.js server proxy (/api/crm) to bypass browser CORS policy.
// On the server: call Frappe remote URL directly.
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "/api/crm";
  }
  return (
    process.env.FRAPPE_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://logicx.tmnext.in/api/v2"
  ).replace(/\/+$/, "");
};

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  targetServerUrl: "https://logicx.tmnext.in/api/v2",
  apiToken:
    process.env.NEXT_PUBLIC_API_TOKEN ||
    process.env.FRAPPE_API_TOKEN ||
    "2676688c2ba5d43:bab959c6d549ca8",
  apiKey: process.env.NEXT_PUBLIC_API_KEY || process.env.FRAPPE_API_KEY || "",
  apiSecret: process.env.NEXT_PUBLIC_API_SECRET || process.env.FRAPPE_API_SECRET || "",
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  endpoints: {
    enquiry: {
      list: "/method/frappe.client.get_list",
      document: "/document/Enquiry",
      detail: (id: string) => `/document/Enquiry/${encodeURIComponent(id)}`,
      create: "/document/Enquiry",
      update: (id: string) => `/document/Enquiry/${encodeURIComponent(id)}`,
      delete: (id: string) => `/document/Enquiry/${encodeURIComponent(id)}`,
    },
  },
  fields: [
    "name",
    "date",
    "creation",
    "status",
    "group",
    "customer.customer_name",
    "user_employee.employee_name as user_employee_name",
    "enquiry_details",
  ],
  pagination: {
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
  },
  debug: {
    enabled: true,
    maxLogs: 150,
  },
} as const;

export type ApiConfig = typeof API_CONFIG;
