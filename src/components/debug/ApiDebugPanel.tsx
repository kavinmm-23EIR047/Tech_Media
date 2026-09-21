/**
 * Developer API Debug Panel
 * Real-time Frappe HTTP log inspector, latency monitor, and authorization status
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal,
  X,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Key,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { logger, LogEntry } from "@/lib/api/logger";
import { API_CONFIG } from "@/config/api.config";

interface ApiDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDebugPanel: React.FC<ApiDebugPanelProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "http" | "service">("all");

  useEffect(() => {
    setLogs(logger.getLogs());

    const unsubscribe = logger.subscribe((entry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 149)]);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (activeTab === "http") return log.layer === "API" || log.layer === "CLIENT" || !!log.httpMeta;
    if (activeTab === "service") return log.layer === "SERVICE" || log.layer === "HOOK";
    return true;
  });

  const hasApiKey = Boolean(API_CONFIG.apiKey || API_CONFIG.apiToken);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[540px] md:w-[620px] h-[520px] bg-slate-900 text-slate-100 shadow-2xl border-t sm:border-l border-slate-700 flex flex-col font-mono text-xs rounded-tl-2xl overflow-hidden animate-slide-in-right">
      {/* Panel Header */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-slate-200">Frappe API Live Debug Panel</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
            Direct API
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auth Token Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
              hasApiKey
                ? "bg-emerald-950/70 border-emerald-700 text-emerald-300"
                : "bg-amber-950/70 border-amber-700 text-amber-300"
            }`}
            title="Authentication status configured in .env.local"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasApiKey ? "Token Active" : "No Token (.env.local)"}</span>
          </div>

          <button
            onClick={() => {
              logger.clearLogs();
              setLogs([]);
              setSelectedLog(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Base URL Info Bar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "all" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("http")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "http" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            HTTP / API
          </button>
          <button
            onClick={() => setActiveTab("service")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "service" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Service & Hooks
          </button>
        </div>
        <div className="text-[10px] text-violet-400 truncate max-w-[220px]" title={API_CONFIG.baseURL}>
          Target: {API_CONFIG.baseURL}
        </div>
      </div>

      {/* Main Body: Split View (Logs list & Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Logs List */}
        <div className="w-1/2 border-r border-slate-800 overflow-y-auto divide-y divide-slate-800/60">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No API events recorded yet. Perform CRM actions to inspect live HTTP traffic.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              const isError = log.level === "error" || (log.httpMeta?.status ?? 200) >= 400;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-2.5 cursor-pointer hover:bg-slate-800/80 transition-colors ${
                    isSelected ? "bg-slate-800 border-l-2 border-violet-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="text-violet-400 font-semibold">[{log.layer}]</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    {isError ? (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                    <span
                      className={`truncate font-medium ${
                        isError ? "text-rose-300" : "text-slate-200"
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>

                  {log.durationMs !== undefined && (
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {log.durationMs}ms
                      </span>
                      {log.httpMeta?.status !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded ${
                            log.httpMeta.status < 300
                              ? "bg-emerald-950 text-emerald-300"
                              : "bg-rose-950 text-rose-300"
                          }`}
                        >
                          HTTP {log.httpMeta.status}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Log Inspector */}
        <div className="w-1/2 p-3 overflow-y-auto bg-slate-950 text-[11px] space-y-3">
          {selectedLog ? (
            <div>
              <div className="font-bold text-slate-200 border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                <span>Payload & Detail Inspector</span>
                <span className="text-[10px] text-slate-400">{selectedLog.id}</span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500">Module:</span>{" "}
                  <span className="text-violet-300 font-semibold">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-slate-500">Layer:</span>{" "}
                  <span className="text-slate-300">{selectedLog.layer}</span>
                </div>
                <div>
                  <span className="text-slate-500">Message:</span>{" "}
                  <span className="text-slate-200">{selectedLog.message}</span>
                </div>

                {selectedLog.httpMeta && (
                  <div className="mt-3 pt-2 border-t border-slate-800 space-y-2">
                    <div className="text-violet-400 font-bold">HTTP Request Information</div>
                    <div>
                      <span className="text-slate-500">Method:</span>{" "}
                      <span className="text-emerald-400 font-bold">{selectedLog.httpMeta.method}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Endpoint:</span>{" "}
                      <span className="text-slate-200 break-all">{selectedLog.httpMeta.url}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>{" "}
                      <span className="text-slate-200">{selectedLog.httpMeta.status || "N/A"}</span>
                    </div>

                    {Boolean(selectedLog.httpMeta.requestPayload) && (
                      <div>
                        <div className="text-slate-500 mb-1">Request Payload:</div>
                        <pre className="p-2 bg-slate-900 rounded-lg text-[10px] text-emerald-300 overflow-x-auto border border-slate-800">
                          {JSON.stringify(selectedLog.httpMeta.requestPayload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {Boolean(selectedLog.httpMeta.responsePayload) && (
                      <div>
                        <div className="text-slate-500 mb-1">Response Data:</div>
                        <pre className="p-2 bg-slate-900 rounded-lg text-[10px] text-violet-300 overflow-x-auto border border-slate-800">
                          {JSON.stringify(selectedLog.httpMeta.responsePayload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {Boolean(selectedLog.data) && (
                  <div className="mt-3 pt-2 border-t border-slate-800">
                    <div className="text-slate-500 mb-1">Log Context Data:</div>
                    <pre className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-300 overflow-x-auto border border-slate-800">
                      {JSON.stringify(selectedLog.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4">
              <Layers className="w-8 h-8 text-slate-700 mb-2" />
              <div>Select any log entry on the left to inspect request metadata, headers, and JSON payloads.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
