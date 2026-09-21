/**
 * TypeScript Type Definitions for the Enquiry CRM Module
 */

export type EnquiryStatus = "Open" | "In Progress" | "Won" | "Lost";

export type EnquiryGroup =
  | "Stores"
  | "DELL"
  | "Corporate"
  | "Retail"
  | "Enterprise"
  | "Online"
  | "Government"
  | string;

/**
 * Normalized UI Domain Entity
 */
export interface Enquiry {
  name: string; // e.g., "ENQ699"
  date: string; // "YYYY-MM-DD"
  creation: string; // ISO datetime
  status: EnquiryStatus;
  group: string;
  customerName: string;
  userEmployee: string; // Employee ID, e.g., "HR-EMP-00003"
  userEmployeeName: string;
  assignedToEmployee: string;
  assignedToEmployeeName?: string;
  mobile: string;
  enquiryDetails: string;
  statusDetails: string;
}

/**
 * Raw Frappe Document Representation
 */
export interface FrappeEnquiryDoc {
  name: string;
  date: string;
  creation: string;
  modified?: string;
  status: string;
  group: string;
  customer?: string;
  "customer.customer_name"?: string;
  customer_name?: string;
  user_employee?: string;
  "user_employee.employee_name as user_employee_name"?: string;
  user_employee_name?: string;
  assigned_to_employee?: string;
  mobile?: string;
  enquiry_details?: string;
  status_details?: string;
  doctype?: string;
}

/**
 * Frappe get_list API Request Schema
 */
export interface FrappeGetListRequest {
  doctype: "Enquiry";
  fields: string[];
  filters?: Array<[string, string, any]> | Record<string, any>;
  order_by?: string;
  limit_page_length?: number;
  limit_start?: number;
}

/**
 * Frappe API Response Wrapper
 */
export interface FrappeResponse<T> {
  data?: T;
  message?: T;
}

/**
 * Create Enquiry Payload (POST /document/Enquiry)
 */
export interface CreateEnquiryPayload {
  mobile: string;
  enquiry_details: string;
  group: string;
  user_employee: string;
  assigned_to_employee: string;
  date: string;
  status: EnquiryStatus | string;
  status_details?: string;
  customer_name?: string;
}

/**
 * Update Enquiry Payload (PUT /document/Enquiry/:id)
 */
export interface UpdateEnquiryPayload {
  mobile?: string;
  enquiry_details?: string;
  group?: string;
  user_employee?: string;
  assigned_to_employee?: string;
  date?: string;
  status?: EnquiryStatus | string;
  status_details?: string;
  customer_name?: string;
}

/**
 * Filter & Search State
 */
export interface EnquiryFilters {
  search: string;
  status: EnquiryStatus | "All";
  group: string | "All";
  employee: string | "All";
  startDate: string;
  endDate: string;
  sortBy: "creation" | "date" | "name" | "status";
  sortOrder: "asc" | "desc";
}

/**
 * Pagination State
 */
export interface EnquiryPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Aggregated Analytics & KPIs
 */
export interface EmployeePerformance {
  employee: string;
  name: string;
  total: number;
  open: number;
  inProgress: number;
  won: number;
  lost: number;
  conversion: number; // Percentage
}

export interface TimelineDataPoint {
  date: string;
  label: string;
  total: number;
  won: number;
  lost: number;
  open: number;
}

export interface EnquiryStats {
  total: number;
  open: number;
  inProgress: number;
  won: number;
  lost: number;
  conversionRate: number;
  byGroup: Record<string, number>;
  employeePerformance: EmployeePerformance[];
  timelineTrends: TimelineDataPoint[];
}

/**
 * Interactive Activity & Audit Trail Item
 */
export interface TimelineActivity {
  id: string;
  enquiryId: string;
  type: "creation" | "status_change" | "assignment" | "note" | "update";
  title: string;
  description: string;
  author: string;
  authorRole?: string;
  timestamp: string;
  metadata?: {
    fromStatus?: string;
    toStatus?: string;
    fromAssignee?: string;
    toAssignee?: string;
  };
}
