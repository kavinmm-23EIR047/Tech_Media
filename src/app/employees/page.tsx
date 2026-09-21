/**
 * Employees & Sales Team Workload Module Page
 * Renders dynamically from backend API records
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { EnquiryStats } from "@/features/enquiries/types/enquiry.types";
import { Briefcase, Award, TrendingUp, CheckCircle2, Clock, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EmployeesPage() {
  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const employeeList = stats?.employeePerformance || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 mb-1">
            <span>CRM Workspace</span>
            <span>/</span>
            <span className="text-slate-500">Sales & Account Team</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Team Performance Matrix</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold border border-violet-200">
              {employeeList.length} Active Officers
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time backend enquiry allocations, deal conversion rates, and handling capacities
          </p>
        </div>

        {/* Employee Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : employeeList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-card">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No employee records in active enquiries</div>
            <div className="text-xs text-slate-500">
              Enquiries registered in your Frappe backend will automatically populate this team matrix.
            </div>
            <Link href="/enquiries">
              <Button variant="primary" size="sm" className="mt-2">
                Go to Enquiries
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employeeList.map((emp) => (
              <div
                key={emp.employee}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 font-extrabold text-base flex items-center justify-center border border-violet-200">
                    {emp.name.split(" ")[0][0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.employee}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Records</span>
                    <span className="font-bold text-slate-900 font-mono">{emp.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Conversion Rate</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {emp.conversion}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-blue-50/80 rounded-lg">
                    <div className="font-bold text-blue-700">{emp.open}</div>
                    <div className="text-[10px] text-blue-600 font-medium">Open</div>
                  </div>
                  <div className="p-2 bg-emerald-50/80 rounded-lg">
                    <div className="font-bold text-emerald-700">{emp.won}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Won</div>
                  </div>
                  <div className="p-2 bg-rose-50/80 rounded-lg">
                    <div className="font-bold text-rose-700">{emp.lost}</div>
                    <div className="text-[10px] text-rose-600 font-medium">Lost</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
