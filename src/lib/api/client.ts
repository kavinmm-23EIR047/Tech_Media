/**
 * Reusable CRM HTTP Client with Token Authorization & Interceptors
 */

import { API_CONFIG } from "@/config/api.config";
import { ApiError, normalizeApiError } from "./errors";
import { logger, LogModule } from "./logger";

export interface RequestOptions extends RequestInit {
  module?: LogModule;
  operation?: string;
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  skipErrorLogging?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  durationMs: number;
  requestId: string;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultHeaders = { ...API_CONFIG.headers };
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  public setBaseURL(url: string) {
    this.baseURL = url.replace(/\/+$/, "");
  }

  private getAuthHeaders(): Record<string, string> {
    const authHeaders: Record<string, string> = {};

    const rawToken =
      API_CONFIG.apiToken ||
      (typeof window !== "undefined" ? localStorage.getItem("crm_auth_token") : null) ||
      "";

    if (rawToken && rawToken.trim()) {
      const t = rawToken.trim();
      authHeaders["Authorization"] =
        t.startsWith("token ") || t.startsWith("Bearer ")
          ? t
          : `token ${t}`;
    } else if (API_CONFIG.apiKey && API_CONFIG.apiSecret) {
      authHeaders["Authorization"] = `token ${API_CONFIG.apiKey}:${API_CONFIG.apiSecret}`;
    }

    return authHeaders;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const fullPath = `${this.baseURL}${cleanEndpoint}`;

    let url: URL;
    if (fullPath.startsWith("http://") || fullPath.startsWith("https://")) {
      url = new URL(fullPath);
    } else if (typeof window !== "undefined") {
      url = new URL(fullPath, window.location.origin);
    } else {
      url = new URL(fullPath, "http://localhost:3000");
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  public async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      module = "System",
      operation = "request",
      params,
      timeoutMs = API_CONFIG.timeout,
      headers: customHeaders,
      body,
      method = "GET",
      skipErrorLogging = false,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params);
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();

    const headers: HeadersInit = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      "X-Request-ID": requestId,
      ...customHeaders,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    logger.debug(module, "CLIENT", `[${requestId}] ${method} ${url}`, {
      params,
      payload: body ? (typeof body === "string" ? JSON.parse(body) : body) : undefined,
    });

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);

      let responseData: unknown = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        responseData = await response.text();
      }

      logger.http(
        module,
        method,
        endpoint,
        response.status,
        durationMs,
        body ? (typeof body === "string" ? JSON.parse(body) : body) : undefined,
        responseData
      );

      if (!response.ok) {
        let userMessage = "An error occurred while communicating with the CRM server.";
        let errorCode: any = "SERVER_ERROR";

        if (typeof responseData === "object" && responseData !== null) {
          const resp = responseData as any;
          if (resp.errors && Array.isArray(resp.errors) && resp.errors[0]?.message) {
            userMessage = resp.errors[0].message;
            errorCode = "VALIDATION_ERROR";
          } else if (typeof resp.message === "string" && resp.message) {
            userMessage = resp.message;
            errorCode = "VALIDATION_ERROR";
          } else if (resp._server_messages) {
            try {
              const msgs = JSON.parse(resp._server_messages);
              if (Array.isArray(msgs) && msgs.length > 0) {
                const parsedMsg = typeof msgs[0] === "string" ? JSON.parse(msgs[0]) : msgs[0];
                if (parsedMsg?.message) userMessage = parsedMsg.message;
              }
            } catch {}
          }
        }

        if (userMessage === "An error occurred while communicating with the CRM server.") {
          if (response.status === 400 || response.status === 417) {
            errorCode = "VALIDATION_ERROR";
            userMessage = "The request contained invalid data. Please verify your inputs.";
          } else if (response.status === 401) {
            errorCode = "UNAUTHORIZED";
            userMessage = "Authentication required. Please configure your API tokens in .env.local.";
          } else if (response.status === 403) {
            errorCode = "FORBIDDEN";
            userMessage = "You do not have permission to perform this CRM action.";
          } else if (response.status === 404) {
            errorCode = "NOT_FOUND";
            userMessage = "The requested CRM record was not found on the backend.";
          } else if (response.status >= 500) {
            errorCode = "SERVER_ERROR";
            userMessage = "CRM backend server returned an error. Please check backend logs.";
          }
        }

        const devMessage = typeof responseData === "object" && responseData !== null
          ? JSON.stringify(responseData)
          : response.statusText || `HTTP error ${response.status}`;

        throw new ApiError(
          errorCode,
          userMessage,
          devMessage,
          {
            module,
            operation,
            endpoint,
            status: response.status,
            requestId,
            requestPayload: body,
            originalError: responseData,
          },
          response.status >= 500 || response.status === 408
        );
      }

      return {
        data: responseData as T,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        durationMs,
        requestId,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const durationMs = Math.round(performance.now() - startTime);

      const normalized = normalizeApiError(err, {
        module,
        operation,
        endpoint,
        requestId,
        requestPayload: body,
        originalError: err,
      });

      if (!skipErrorLogging) {
        logger.http(
          module,
          method,
          endpoint,
          normalized.context.status || 0,
          durationMs,
          body,
          undefined,
          normalized.developerMessage
        );
      }

      throw normalized;
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
