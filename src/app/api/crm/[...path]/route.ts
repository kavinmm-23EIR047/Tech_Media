/**
 * Next.js Server-Side API Route Proxy for Frappe CRM
 * Prevents browser CORS issues and securely injects Authorization tokens from .env.local
 */

import { NextRequest, NextResponse } from "next/server";

function formatToken(raw?: string): string {
  if (!raw || !raw.trim()) return "";
  const t = raw.trim();
  if (t.startsWith("token ") || t.startsWith("Bearer ")) {
    return t;
  }
  return `token ${t}`;
}

function getAuthHeader(method: string, path: string[]): { header: string; source: string } {
  const methodUpper = method.toUpperCase();
  const pathStr = (path || []).join("/").toLowerCase();

  let targetToken = "";
  let source = "NONE";

  // 1. API 1: List Enquiries (POST /method/frappe.client.get_list)
  if (pathStr.includes("frappe.client.get_list") || pathStr.includes("get_list")) {
    targetToken =
      process.env.FRAPPE_TOKEN_GET_LIST ||
      process.env.NEXT_PUBLIC_TOKEN_GET_LIST ||
      process.env.FRAPPE_API_TOKEN_LIST ||
      "";
    if (targetToken) source = "FRAPPE_TOKEN_GET_LIST";
  }
  // 2. API 3: Create Enquiry (POST /document/Enquiry)
  else if (methodUpper === "POST" && (pathStr === "document/enquiry" || pathStr.endsWith("/document/enquiry"))) {
    targetToken =
      process.env.FRAPPE_TOKEN_CREATE ||
      process.env.NEXT_PUBLIC_TOKEN_CREATE ||
      process.env.FRAPPE_API_TOKEN_CREATE ||
      "";
    if (targetToken) source = "FRAPPE_TOKEN_CREATE";
  }
  // 3. API 4: Update Enquiry (PUT /document/Enquiry/:id)
  else if (methodUpper === "PUT" && pathStr.includes("document/enquiry")) {
    targetToken =
      process.env.FRAPPE_TOKEN_UPDATE ||
      process.env.NEXT_PUBLIC_TOKEN_UPDATE ||
      process.env.FRAPPE_API_TOKEN_UPDATE ||
      "";
    if (targetToken) source = "FRAPPE_TOKEN_UPDATE";
  }
  // 4. API 2: Read Enquiry by ID (GET /document/Enquiry/:id)
  else if (methodUpper === "GET" && pathStr.includes("document/enquiry")) {
    targetToken =
      process.env.FRAPPE_TOKEN_GET_BY_ID ||
      process.env.FRAPPE_TOKEN_READ ||
      process.env.NEXT_PUBLIC_TOKEN_GET_BY_ID ||
      process.env.FRAPPE_API_TOKEN_READ ||
      "";
    if (targetToken) source = "FRAPPE_TOKEN_GET_BY_ID";
  }
  // 5. Delete Enquiry (DELETE /document/Enquiry/:id)
  else if (methodUpper === "DELETE" && pathStr.includes("document/enquiry")) {
    targetToken =
      process.env.FRAPPE_TOKEN_DELETE ||
      process.env.NEXT_PUBLIC_TOKEN_DELETE ||
      "";
    if (targetToken) source = "FRAPPE_TOKEN_DELETE";
  }

  // Fallback to General token if specific token above is not set
  if (!targetToken) {
    targetToken =
      process.env.FRAPPE_API_TOKEN ||
      process.env.NEXT_PUBLIC_API_TOKEN ||
      "";
    if (targetToken) source = "FRAPPE_API_TOKEN (Fallback)";
  }

  if (targetToken) {
    return { header: formatToken(targetToken), source };
  }

  // Fallback to Key & Secret
  const key = process.env.FRAPPE_API_KEY || process.env.NEXT_PUBLIC_API_KEY;
  const secret = process.env.FRAPPE_API_SECRET || process.env.NEXT_PUBLIC_API_SECRET;

  if (key && secret) {
    return { header: `token ${key}:${secret}`, source: "FRAPPE_API_KEY:SECRET" };
  }

  return { header: "", source: "NONE" };
}

function getTargetBaseUrl(): string {
  const base =
    process.env.FRAPPE_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://logicx.tmnext.in/api/v2";
  return base.replace(/\/+$/, "");
}

async function forwardRequest(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path || [];
  const pathStr = path.join("/");
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${getTargetBaseUrl()}/${pathStr}${searchParams ? `?${searchParams}` : ""}`;

  const { header: authHeader, source: tokenSource } = getAuthHeader(req.method, path);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  // Also forward any client Authorization header if present
  const clientAuth = req.headers.get("authorization");
  if (clientAuth && !authHeader) {
    headers["Authorization"] = clientAuth;
  }

  let body: string | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: { "Content-Type": contentType },
      });
    }
  } catch (error: any) {
    console.error(`[Frappe Proxy Error] ${req.method} ${targetUrl}:`, error);
    return NextResponse.json(
      {
        error: "Proxy Request Failed",
        message: error.message || "Failed to reach Frappe backend.",
        targetUrl,
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(req, context);
}

export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(req, context);
}

export async function PUT(req: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(req, context);
}

export async function DELETE(req: NextRequest, context: { params: { path: string[] } }) {
  return forwardRequest(req, context);
}
