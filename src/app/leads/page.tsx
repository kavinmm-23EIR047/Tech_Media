/**
 * Leads Module Page
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { Enquiry } from "@/features/enquiries/types/enquiry.types";
import { UserCheck, ArrowRight, Phone, Calendar, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/features/enquiries/utils/enquiry.utils";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    enquiryService
      .getEnquiries(
        {
          search: "",
          status: "Open",
          group: "All",
          employee: "All",
          startDate: "",
          endDate: "",
          sortBy: "creation",
          sortOrder: "desc",
        },
        { page: 1, pageSize: 50 }
      )
      .then((res) => {
        setLeads(res.enquiries);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 mb-1">
              <span>CRM Workspace</span>
              <span>/</span>
              <span className="text-slate-500">Lead Inflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Unqualified & Active Leads</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
                {leads.length} Open
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Initial customer enquiries awaiting qualification and technical scope review
            </p>
          </div>

          <Link href="/enquiries">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Lead
            </Button>
          </Link>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Lead ID</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Group</th>
                  <th className="py-3.5 px-4">Handler</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No open leads pending qualification.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-violet-700">
                        <Link href={`/enquiries/${lead.name}`} className="hover:underline">
                          {lead.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{lead.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lead.mobile}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                          {lead.group}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">{lead.userEmployeeName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(lead.date)}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={`/enquiries/${lead.name}`}
                          className="inline-flex items-center gap-1 text-violet-700 hover:text-violet-900 font-bold"
                        >
                          <span>Qualify</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
