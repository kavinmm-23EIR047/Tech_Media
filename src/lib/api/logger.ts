/**
 * Structured CRM Debug Logging System
 * Format: [CRM][Module][Layer] Message
 * 
 * Provides structured console output and real-time subscription for the developer Debug Panel.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";
export type LogLayer = "API" | "SERVICE" | "HOOK" | "UI" | "ERROR" | "CLIENT";
export type LogModule = "Enquiry" | "Customer" | "Lead" | "Order" | "Employee" | "Auth" | "System";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: LogModule;
  layer: LogLayer;
  message: string;
  data?: unknown;
  durationMs?: number;
  httpMeta?: {
    method: string;
    url: string;
    status?: number;
    requestPayload?: unknown;
    responsePayload?: unknown;
  };
}

type LogListener = (entry: LogEntry) => void;

class LoggerService {
  private isEnabled: boolean = true;
  private logStore: LogEntry[] = [];
  private maxLogs: number = 100;
  private listeners: Set<LogListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.isEnabled = process.env.NODE_ENV !== "production" || localStorage.getItem("crm_debug") === "true";
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_debug", enabled ? "true" : "false");
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logStore];
  }

  public clearLogs() {
    this.logStore = [];
    this.notifyListeners({
      id: `clear-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "info",
      module: "System",
      layer: "UI",
      message: "Log history cleared",
    });
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(entry: LogEntry) {
    this.listeners.forEach((fn) => {
      try {
        fn(entry);
      } catch (err) {
        console.error("Logger listener error:", err);
      }
    });
  }

  private addLog(entry: Omit<LogEntry, "id" | "timestamp">): LogEntry {
    const fullEntry: LogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.logStore.unshift(fullEntry);
    if (this.logStore.length > this.maxLogs) {
      this.logStore.pop();
    }

    if (this.isEnabled) {
      const tag = `[CRM][${fullEntry.module}][${fullEntry.layer}]`;
      const time = new Date().toLocaleTimeString();

      switch (fullEntry.level) {
        case "error":
          console.error(`%c${time} ${tag}`, "color: #ef4444; font-weight: bold;", fullEntry.message, fullEntry.data || "");
          break;
        case "warn":
          console.warn(`%c${time} ${tag}`, "color: #f59e0b; font-weight: bold;", fullEntry.message, fullEntry.data || "");
          break;
        case "debug":
          console.debug(`%c${time} ${tag}`, "color: #8b5cf6; font-weight: bold;", fullEntry.message, fullEntry.data || "");
          break;
        default:
          console.log(`%c${time} ${tag}`, "color: #7c3aed; font-weight: bold;", fullEntry.message, fullEntry.data || "");
      }
    }

    this.notifyListeners(fullEntry);
    return fullEntry;
  }

  public log(module: LogModule, layer: LogLayer, message: string, data?: unknown) {
    return this.addLog({ level: "info", module, layer, message, data });
  }

  public debug(module: LogModule, layer: LogLayer, message: string, data?: unknown) {
    return this.addLog({ level: "debug", module, layer, message, data });
  }

  public warn(module: LogModule, layer: LogLayer, message: string, data?: unknown) {
    return this.addLog({ level: "warn", module, layer, message, data });
  }

  public error(module: LogModule, layer: LogLayer, message: string, data?: unknown) {
    return this.addLog({ level: "error", module, layer, message, data });
  }

  public http(
    module: LogModule,
    method: string,
    url: string,
    status: number,
    durationMs: number,
    requestPayload?: unknown,
    responsePayload?: unknown,
    error?: unknown
  ) {
    const isErr = status >= 400 || status === 0;
    const message = `${method.toUpperCase()} ${url} -> ${status || "FAILED"} (${durationMs}ms)`;

    return this.addLog({
      level: isErr ? "error" : "info",
      module,
      layer: isErr ? "ERROR" : "API",
      message,
      durationMs,
      data: error,
      httpMeta: {
        method,
        url,
        status,
        requestPayload,
        responsePayload,
      },
    });
  }
}

export const logger = new LoggerService();
