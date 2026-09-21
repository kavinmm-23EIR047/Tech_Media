/**
 * Create / Edit Enquiry Modal
 *
 * KEY FIX — 417 LinkValidationError:
 * - `group` is a Frappe Link field. It MUST be a value that already exists
 *   in the linked DocType. We populate the dropdown from unique values seen
 *   in the live enquiry list (passed in via `availableGroups`).
 * - `user_employee` and `assigned_to_employee` are likewise Link fields.
 *   We populate them from unique employees seen in the live data.
 * - `customer_name` is NOT sent on create — it causes LinkValidationError
 *   if the value is not an existing Frappe Customer record.
 *
 * All field values come from real API data — no hardcoded IDs.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Enquiry, EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import { stripHtmlTags } from "@/features/enquiries/utils/enquiry.utils";
import { Calendar, FileText, Activity, User, Phone, AlertCircle } from "lucide-react";

interface EnquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    mobile: string;
    enquiryDetails: string;
    group: string;
    userEmployee: string;
    assignedToEmployee: string;
    date: string;
    status: EnquiryStatus;
    statusDetails: string;
  }) => Promise<boolean>;
  initialData?: Enquiry | null;
  isSubmitting?: boolean;
  /** Unique groups from live API data — used to populate the Group dropdown */
  availableGroups?: string[];
  /** Unique employees from live API data — used to populate Employee dropdowns */
  availableEmployees?: Array<{ id: string; name: string }>;
}

const EMPTY_FORM = {
  mobile: "",
  enquiryDetails: "",
  group: "",
  userEmployee: "",
  assignedToEmployee: "",
  date: new Date().toISOString().split("T")[0],
  status: "Open" as EnquiryStatus,
  statusDetails: "",
};

export const EnquiryFormModal: React.FC<EnquiryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  availableGroups = [],
  availableEmployees = [],
}) => {
  const isEditing = !!initialData;
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form from initialData when editing, or reset when creating
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      // Normalize mobile to 10 digits
      let cleanMobile = (initialData.mobile || "").replace(/\D/g, "");
      if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) cleanMobile = cleanMobile.slice(1);
      else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) cleanMobile = cleanMobile.slice(2);
      else if (cleanMobile.length > 10) cleanMobile = cleanMobile.slice(-10);

      // Clean HTML tags from Frappe Quill / RichText editor
      const cleanDetails = stripHtmlTags(initialData.enquiryDetails || "") || initialData.enquiryDetails || "";
      const cleanStatusDetails = stripHtmlTags(initialData.statusDetails || "") || initialData.statusDetails || "";

      setForm({
        mobile: cleanMobile,
        enquiryDetails: cleanDetails,
        group: initialData.group || availableGroups[0] || "",
        userEmployee: initialData.userEmployee || availableEmployees[0]?.id || "",
        assignedToEmployee:
          initialData.assignedToEmployee ||
          initialData.userEmployee ||
          availableEmployees[0]?.id ||
          "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        status: initialData.status || "Open",
        statusDetails: cleanStatusDetails,
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        group: availableGroups[0] || "",
        userEmployee: availableEmployees[0]?.id || "",
        assignedToEmployee: availableEmployees[0]?.id || "",
      });
    }
    setErrors({});
  }, [initialData, isOpen, availableGroups, availableEmployees]);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleMobileChange = (val: string) => {
    // Keep only digits, +, spaces, or dashes while typing
    let clean = val.replace(/[^\d]/g, "");
    if (clean.length === 11 && clean.startsWith("0")) {
      clean = clean.slice(1);
    } else if (clean.length === 12 && clean.startsWith("91")) {
      clean = clean.slice(2);
    }
    if (clean.length > 10) {
      clean = clean.slice(0, 10);
    }
    set("mobile", clean);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const cleanMobile = form.mobile.replace(/\D/g, "");
    if (!cleanMobile) {
      errs.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      errs.mobile = "Mobile must contain exactly 10 numeric digits (e.g. 9600732162)";
    }

    if (!form.enquiryDetails.trim()) errs.enquiryDetails = "Enquiry details are required";
    if (!form.group) errs.group = "Please select a business group";
    if (!form.userEmployee) errs.userEmployee = "Please select a handling employee";
    if (!form.date) errs.date = "Enquiry date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let cleanMobile = form.mobile.replace(/\D/g, "");
    if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) cleanMobile = cleanMobile.slice(1);
    else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) cleanMobile = cleanMobile.slice(2);
    else if (cleanMobile.length > 10) cleanMobile = cleanMobile.slice(-10);

    const ok = await onSubmit({
      ...form,
      mobile: cleanMobile,
      assignedToEmployee: form.assignedToEmployee || form.userEmployee,
    });
    if (ok) onClose();
  };

  // ── Field helpers ────────────────────────────────────────────────────────

  const fieldClass = (err?: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
      err
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
        : "border-gray-200 bg-white focus:border-violet-400 focus:ring-violet-100"
    }`;

  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={isEditing ? `Edit — ${initialData?.name}` : "New Enquiry"}
      description={
        isEditing
          ? "Update customer requirements, status and notes"
          : "Register a new enquiry into the Frappe backend"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Core Details ── */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 uppercase tracking-wider pb-2 mb-4 border-b border-gray-100">
            <Phone className="w-3.5 h-3.5" />
            Contact & Assignment
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-gray-400 font-mono">
                  {form.mobile.length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                maxLength={10}
                placeholder="e.g. 9600732162"
                className={fieldClass(errors.mobile)}
              />
              {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
            </div>

            {/* Date */}
            <div>
              <label className={labelClass}>
                Enquiry Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className={`${fieldClass(errors.date)} pl-9`}
                />
              </div>
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>

            {/* Group — dropdown from live API values */}
            <div>
              <label className={labelClass}>
                Business Group <span className="text-red-500">*</span>
              </label>
              {availableGroups.length > 0 ? (
                <select
                  value={form.group}
                  onChange={(e) => set("group", e.target.value)}
                  className={fieldClass(errors.group)}
                >
                  <option value="">— Select group —</option>
                  {availableGroups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    value={form.group}
                    onChange={(e) => set("group", e.target.value)}
                    placeholder="e.g. Stores, DELL, Corporate…"
                    className={fieldClass(errors.group)}
                  />
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Must match an existing group in Frappe
                  </p>
                </div>
              )}
              {errors.group && <p className="text-xs text-red-500 mt-1">{errors.group}</p>}
            </div>

            {/* Handling Employee — dropdown from live API values */}
            <div>
              <label className={labelClass}>
                Handling Employee <span className="text-red-500">*</span>
              </label>
              {availableEmployees.length > 0 ? (
                <select
                  value={form.userEmployee}
                  onChange={(e) => {
                    set("userEmployee", e.target.value);
                    if (!isEditing) set("assignedToEmployee", e.target.value);
                  }}
                  className={fieldClass(errors.userEmployee)}
                >
                  <option value="">— Select employee —</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id})
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    value={form.userEmployee}
                    onChange={(e) => {
                      set("userEmployee", e.target.value);
                      if (!isEditing) set("assignedToEmployee", e.target.value);
                    }}
                    placeholder="e.g. HR-EMP-00003"
                    className={fieldClass(errors.userEmployee)}
                  />
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Must be a valid Employee ID in Frappe
                  </p>
                </div>
              )}
              {errors.userEmployee && (
                <p className="text-xs text-red-500 mt-1">{errors.userEmployee}</p>
              )}
            </div>

            {/* Assigned To — only shown on edit */}
            {isEditing && (
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  Assigned To Employee
                </label>
                {availableEmployees.length > 0 ? (
                  <select
                    value={form.assignedToEmployee}
                    onChange={(e) => set("assignedToEmployee", e.target.value)}
                    className={fieldClass()}
                  >
                    <option value="">— Same as handling employee —</option>
                    {availableEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.assignedToEmployee}
                    onChange={(e) => set("assignedToEmployee", e.target.value)}
                    placeholder="Leave blank to use handling employee"
                    className={fieldClass()}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Section 2: Enquiry Details ── */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 uppercase tracking-wider pb-2 mb-4 border-b border-gray-100">
            <FileText className="w-3.5 h-3.5" />
            Requirement Details
          </div>

          <div>
            <label className={labelClass}>
              Enquiry Details <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={form.enquiryDetails}
              onChange={(e) => set("enquiryDetails", e.target.value)}
              placeholder="Describe the customer's requirement — product, quantity, specifications, timeline…"
              className={fieldClass(errors.enquiryDetails)}
            />
            {errors.enquiryDetails && (
              <p className="text-xs text-red-500 mt-1">{errors.enquiryDetails}</p>
            )}
          </div>
        </div>

        {/* ── Section 3: Status ── */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 uppercase tracking-wider pb-2 mb-4 border-b border-gray-100">
            <Activity className="w-3.5 h-3.5" />
            Status
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Current Status <span className="text-red-500">*</span></label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={fieldClass(errors.status)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Status Notes / Next Step</label>
              <input
                type="text"
                value={form.statusDetails}
                onChange={(e) => set("statusDetails", e.target.value)}
                placeholder="e.g. Quotation sent, awaiting PO confirmation…"
                className={fieldClass()}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Enquiry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
