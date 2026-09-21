/**
 * Field-level Validation Schema for Enquiry Creation & Updates
 */

import { EnquiryStatus } from "../types/enquiry.types";

export interface EnquiryFormData {
  customerName?: string;
  mobile: string;
  enquiryDetails: string;
  group: string;
  userEmployee: string;
  assignedToEmployee?: string;
  date: string;
  status: EnquiryStatus;
  statusDetails?: string;
}

export interface ValidationErrors {
  customerName?: string;
  mobile?: string;
  enquiryDetails?: string;
  group?: string;
  userEmployee?: string;
  assignedToEmployee?: string;
  date?: string;
  status?: string;
  statusDetails?: string;
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export function validateEnquiryForm(data: Partial<EnquiryFormData>): ValidationResult {
  const errors: ValidationErrors = {};

  // 1. Mobile Validation (Frappe requires exactly 10 numeric digits)
  if (!data.mobile || !data.mobile.trim()) {
    errors.mobile = "Mobile number is required.";
  } else {
    let cleanMobile = data.mobile.replace(/\D/g, "");
    if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) {
      cleanMobile = cleanMobile.slice(1);
    } else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
      cleanMobile = cleanMobile.slice(2);
    }
    if (!/^\d{10}$/.test(cleanMobile)) {
      errors.mobile = "Mobile must contain exactly 10 numeric digits (e.g. 9600732162).";
    }
  }

  // 2. Enquiry Details Validation
  if (!data.enquiryDetails || !data.enquiryDetails.trim()) {
    errors.enquiryDetails = "Enquiry details description is required.";
  } else if (data.enquiryDetails.trim().length < 2) {
    errors.enquiryDetails = "Please provide at least 2 characters of detail.";
  }

  // 3. Group Validation
  if (!data.group || !data.group.trim()) {
    errors.group = "Business group classification is required.";
  }

  // 4. Employee Validation
  if (!data.userEmployee || !data.userEmployee.trim()) {
    errors.userEmployee = "Created/Handling employee is required.";
  }

  // 5. Date Validation
  if (!data.date || !data.date.trim()) {
    errors.date = "Enquiry date is required.";
  } else {
    const parsed = new Date(data.date);
    if (isNaN(parsed.getTime())) {
      errors.date = "Please enter a valid date (YYYY-MM-DD).";
    }
  }

  // 6. Status Validation
  const validStatuses: EnquiryStatus[] = ["Open", "In Progress", "Won", "Lost"];
  if (!data.status) {
    errors.status = "Status selection is required.";
  } else if (!validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(", ")}.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
