/**
 * Orders & Won Conversions Module Page
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { Enquiry } from "@/features/enquiries/types/enquiry.types";
import { ShoppingBag, ArrowRight, CheckCircle2, Phone, Calendar } from "lucide-react";
import { formatDate } from "@/features/enquiries/utils/enquiry.utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    enquiryService
      .getEnquiries(
        {
          search: "",
          status: "Won",
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
        setOrders(res.enquiries);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 mb-1">
            <span>CRM Workspace</span>
            <span>/</span>
            <span className="text-slate-500">Commercial Deals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Won Orders & Closed Deals</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
              {orders.length} Converted
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Commercial purchase orders and successful customer conversion records
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Record</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Group</th>
                  <th className="py-3.5 px-4">Closed By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status Notes</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No converted won orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-violet-700">
                        <Link href={`/enquiries/${ord.name}`} className="hover:underline">
                          {ord.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{ord.customerName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                          {ord.group}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">{ord.userEmployeeName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(ord.date)}</td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{ord.statusDetails || "PO finalized"}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <Link
                          href={`/enquiries/${ord.name}`}
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                        >
                          <span>Review</span>
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
