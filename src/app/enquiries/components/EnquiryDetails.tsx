/**
 * Full CRM Enquiry Details Workspace Component
 * Displayed at /enquiries/[id]
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Phone,
  Calendar,
  Building,
  User,
  Shield,
  Clock,
  CheckCircle2,
  FileText,
  Activity,
  Share2,
  Copy,
  ChevronDown,
} from "lucide-react";
import { Enquiry, EnquiryStatus, TimelineActivity } from "@/features/enquiries/types/enquiry.types";
import { formatDate, formatDateTime, stripHtmlTags } from "@/features/enquiries/utils/enquiry.utils";
import { EnquiryStatusBadge } from "./EnquiryStatusBadge";
import { EnquiryTimeline } from "./EnquiryTimeline";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface EnquiryDetailsProps {
  enquiry: Enquiry;
  timeline: TimelineActivity[];
  onEdit: () => void;
  onUpdateStatus: (newStatus: EnquiryStatus, notes?: string) => Promise<any>;
  onAddComment: (comment: string) => Promise<any>;
  isUpdating?: boolean;
}

export const EnquiryDetails: React.FC<EnquiryDetailsProps> = ({
  enquiry,
  timeline,
  onEdit,
  onUpdateStatus,
  onAddComment,
  isUpdating = false,
}) => {
  const router = useRouter();
  const { success } = useToast();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(enquiry.name);
    success(`Enquiry ID "${enquiry.name}" copied to clipboard.`);
  };

  const handleStatusSelect = async (status: EnquiryStatus) => {
    setIsStatusDropdownOpen(false);
    if (status !== enquiry.status) {
      await onUpdateStatus(status);
      success(`Status updated to "${status}".`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/enquiries"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-violet-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Enquiries</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy ID</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 violet-gradient-subtle rounded-bl-full -z-0 opacity-70 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl sm:text-2xl font-black text-violet-700 tracking-tight">
              {enquiry.name}
            </span>
            <EnquiryStatusBadge status={enquiry.status} size="lg" />
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
              {enquiry.group}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
            {enquiry.customerName || "Commercial Lead"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 font-mono text-slate-700">
              <Phone className="w-3.5 h-3.5 text-violet-600" />
              {enquiry.mobile}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Enquiry Date: {formatDate(enquiry.date)}
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Created {formatDateTime(enquiry.creation)}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {/* Status Quick Changer */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              rightIcon={<ChevronDown className="w-3.5 h-3.5" />}
              isLoading={isUpdating}
            >
              Change Status
            </Button>

            {isStatusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsStatusDropdownOpen(false)}
                />
                <div className="absolute right-0 top-11 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-xs animate-fade-in-up">
                  {(["Open", "In Progress", "Won", "Lost"] as EnquiryStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusSelect(st)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        enquiry.status === st
                          ? "font-bold text-violet-700 bg-violet-50/50"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{st}</span>
                      {enquiry.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit className="w-4 h-4" />}
            className="shadow-violet-sm"
          >
            Edit Enquiry
          </Button>
        </div>
      </div>

      {/* Grid Layout: Left Overview & Details Cards, Right Assignment & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on Desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enquiry Specifications Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-violet-700">
              <FileText className="w-4 h-4 text-violet-600" />
              <span>Customer Requirement & Details</span>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {stripHtmlTags(enquiry.enquiryDetails) || "No detailed requirement logged."}
              </p>
            </div>

            {enquiry.statusDetails && (
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status Notes / Commercial Terms:
                </div>
                <div className="bg-violet-50/50 rounded-xl p-3.5 border border-violet-100 text-xs text-violet-900 leading-relaxed">
                  {enquiry.statusDetails}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Timeline Stream */}
          <EnquiryTimeline timeline={timeline} onAddComment={onAddComment} />
        </div>

        {/* Right Column: Customer Information & Assignment Cards */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-violet-700">
              <Building className="w-4 h-4 text-violet-600" />
              <span>Customer Information</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Customer / Entity</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {enquiry.customerName || "Direct Customer"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Mobile Phone</div>
                <div className="font-semibold text-slate-800 font-mono mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-violet-600" />
                  {enquiry.mobile}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-medium">Group Category</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  <span className="inline-block px-2.5 py-0.5 bg-slate-100 rounded-md">
                    {enquiry.group}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment & Handling Employee Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-violet-700">
              <User className="w-4 h-4 text-violet-600" />
              <span>Assignment & Handling</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Handling Employee
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                    {(enquiry.userEmployeeName || "U")[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {enquiry.userEmployeeName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {enquiry.userEmployee}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Assigned Officer
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                    {(enquiry.assignedToEmployeeName || "A")[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {enquiry.assignedToEmployeeName || enquiry.userEmployeeName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {enquiry.assignedToEmployee || enquiry.userEmployee}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
