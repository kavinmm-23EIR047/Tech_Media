/**
 * Customers Directory Module Page
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { Enquiry } from "@/features/enquiries/types/enquiry.types";
import { Users, Search, Phone, Building2, ArrowRight, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CustomersPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [search, setSearch] = useState("");
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
        setEnquiries(res.enquiries);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Group enquiries by unique customer
  const customerMap = new Map<string, { customerName: string; mobile: string; group: string; count: number; lastEnquiry: Enquiry }>();

  enquiries.forEach((e) => {
    const key = e.customerName || e.mobile || "Direct Customer";
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        customerName: e.customerName || "Direct Customer",
        mobile: e.mobile,
        group: e.group,
        count: 1,
        lastEnquiry: e,
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.count += 1;
    }
  });

  const customerList = Array.from(customerMap.values()).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.customerName.toLowerCase().includes(q) || c.mobile.includes(q) || c.group.toLowerCase().includes(q);
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 mb-1">
              <span>CRM Workspace</span>
              <span>/</span>
              <span className="text-slate-500">Customer Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Client Accounts</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold border border-violet-200">
                {customerList.length} Accounts
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Commercial client directory, contact information, and active enquiry histories
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-card">
          <div className="relative">
            <Search className="w-4 h-4 text-violet-600 absolute inset-y-0 left-3.5 my-auto pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by company name, mobile, or business group..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        {/* Customer Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
            ))}
          </div>
        ) : customerList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No customer records found</div>
            <div className="text-xs text-slate-500">Register new customer enquiries to build your CRM account directory.</div>
            <Link href="/enquiries">
              <Button variant="primary" size="sm" className="mt-2">
                Go to Enquiries
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {customerList.map((cust) => (
              <div
                key={cust.customerName + cust.mobile}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center">
                      {cust.customerName[0].toUpperCase()}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                      {cust.group}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                    {cust.customerName}
                  </h3>

                  <div className="space-y-1.5 mt-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-violet-600" />
                      <span className="font-mono text-slate-700">{cust.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.count} Associated Enquir{cust.count > 1 ? "ies" : "y"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/enquiries/${cust.lastEnquiry.name}`}
                    className="text-xs font-bold text-violet-700 hover:text-violet-900 flex items-center gap-1 group-hover:underline"
                  >
                    <span>View Latest ({cust.lastEnquiry.name})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
