/**
 * Reports & Analytics Dashboard Module Page
 */

"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { EnquiryStats } from "@/features/enquiries/types/enquiry.types";
import { EnquiryCharts } from "../enquiries/components/EnquiryCharts";
import { BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = () => {
    setIsLoading(true);
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
        { page: 1, pageSize: 100 }
      )
      .then((res) => {
        setStats(res.stats);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 mb-1">
              <span>CRM Workspace</span>
              <span>/</span>
              <span className="text-slate-500">Business Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Executive Reports & KPIs</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pipeline distribution, win velocity, group metrics, and team conversion rates
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchStats}
            isLoading={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh Data
          </Button>
        </div>

        {/* Charts Container */}
        {stats && <EnquiryCharts stats={stats} />}
      </div>
    </AppShell>
  );
}
