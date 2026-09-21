/**
 * Enquiry Service Layer
 * Directly interfaces with Frappe v2 API endpoints.
 * Handles data transformation, response normalization, and analytics calculations.
 */

import { logger } from "@/lib/api/logger";
import { EnquiryApi, EnquiryApiListParams } from "../api/enquiry.api";
import {
  CreateEnquiryPayload,
  EmployeePerformance,
  Enquiry,
  EnquiryFilters,
  EnquiryPagination,
  EnquiryStats,
  EnquiryStatus,
  FrappeEnquiryDoc,
  TimelineActivity,
  TimelineDataPoint,
  UpdateEnquiryPayload,
} from "../types/enquiry.types";

class EnquiryService {
  private timelineStore: Record<string, TimelineActivity[]> = {};

  /**
   * Normalizes raw Frappe Doc into standardized Enquiry Entity
   */
  public normalizeEnquiry(raw: FrappeEnquiryDoc): Enquiry {
    const customerName =
      raw["customer.customer_name"] ||
      raw.customer_name ||
      (typeof raw.customer === "string" ? raw.customer : "") ||
      "Direct Customer";

    const userEmployeeName =
      raw["user_employee.employee_name as user_employee_name"] ||
      raw.user_employee_name ||
      raw.user_employee ||
      "Unassigned";

    let validStatus: EnquiryStatus = "Open";
    const rawStatus = (raw.status || "Open").toLowerCase();
    if (rawStatus === "won" || rawStatus === "closed - won") validStatus = "Won";
    else if (rawStatus === "lost" || rawStatus === "closed - lost") validStatus = "Lost";
    else if (rawStatus.includes("progress") || rawStatus === "in-progress") validStatus = "In Progress";
    else validStatus = "Open";

    return {
      name: raw.name || "ENQ-NEW",
      date: raw.date || new Date().toISOString().split("T")[0],
      creation: raw.creation || new Date().toISOString(),
      status: validStatus,
      group: raw.group || "Stores",
      customerName,
      userEmployee: raw.user_employee || "",
      userEmployeeName,
      assignedToEmployee: raw.assigned_to_employee || raw.user_employee || "",
      assignedToEmployeeName: userEmployeeName,
      mobile: raw.mobile || "",
      enquiryDetails: raw.enquiry_details || "",
      statusDetails: raw.status_details || "",
    };
  }

  /**
   * Transforms Enquiry domain entity into Frappe API create/update payload
   */
  public prepareFrappePayload(
    data: Partial<Enquiry> & {
      mobile: string;
      enquiryDetails: string;
      group: string;
      userEmployee: string;
      assignedToEmployee?: string;
      date: string;
      status: EnquiryStatus;
      statusDetails?: string;
      customerName?: string;
    }
  ): CreateEnquiryPayload {
    // Sanitize mobile to 10 digits per Frappe validate hook ("Mobile must contain exactly 10 numeric digits.")
    let cleanMobile = data.mobile.replace(/\D/g, "");
    if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) {
      cleanMobile = cleanMobile.slice(1);
    } else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
      cleanMobile = cleanMobile.slice(2);
    } else if (cleanMobile.length > 10) {
      cleanMobile = cleanMobile.slice(-10);
    }

    return {
      mobile: cleanMobile || data.mobile.trim(),
      enquiry_details: data.enquiryDetails.trim(),
      group: data.group,
      user_employee: data.userEmployee,
      assigned_to_employee: data.assignedToEmployee || data.userEmployee,
      date: data.date,
      status: data.status,
      status_details: data.statusDetails || "",
    };
  }

  /**
   * Fetch Enquiries directly from backend Frappe API with client-side filtering and sorting
   */
  public async getEnquiries(
    filters: EnquiryFilters,
    pagination: { page: number; pageSize: number }
  ): Promise<{ enquiries: Enquiry[]; pagination: EnquiryPagination; stats: EnquiryStats }> {
    logger.log("Enquiry", "SERVICE", "Querying Frappe API for enquiries", { filters, pagination });

    let rawList: Enquiry[] = [];

    const apiParams: EnquiryApiListParams = {
      limitPageLength: 100,
      limitStart: 0,
      orderBy: `${filters.sortBy === "name" ? "name" : "creation"} ${filters.sortOrder}`,
    };

    try {
      const response = await EnquiryApi.getList(apiParams);
      const docs = response.data?.message || response.data?.data || (Array.isArray(response.data) ? response.data : []);

      if (Array.isArray(docs)) {
        logger.log("Enquiry", "SERVICE", `Frappe API returned ${docs.length} records`);
        rawList = docs.map((d) => this.normalizeEnquiry(d));
      }
    } catch (err: any) {
      logger.error("Enquiry", "SERVICE", "Frappe API request error", err);
      // Re-throw so user is explicitly aware of API/token configuration requirements
      throw err;
    }

    // Apply Filters
    let filtered = rawList.filter((item) => {
      // 1. Search filter across all key fields (ID, Customer, Mobile, Details, Employee, Group)
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCustomer = item.customerName.toLowerCase().includes(q);
        const matchMobile = item.mobile.includes(q);
        const matchDetails = item.enquiryDetails.toLowerCase().includes(q);
        const matchEmployee = item.userEmployeeName.toLowerCase().includes(q);
        const matchGroup = item.group.toLowerCase().includes(q);

        if (!matchName && !matchCustomer && !matchMobile && !matchDetails && !matchEmployee && !matchGroup) {
          return false;
        }
      }

      // 2. Status Filter
      if (filters.status !== "All" && item.status !== filters.status) {
        return false;
      }

      // 3. Group Filter
      if (filters.group !== "All" && item.group !== filters.group) {
        return false;
      }

      // 4. Employee Filter
      if (filters.employee !== "All" && item.userEmployee !== filters.employee && item.userEmployeeName !== filters.employee) {
        return false;
      }

      // 5. Date Range Filter
      if (filters.startDate && item.date < filters.startDate) {
        return false;
      }
      if (filters.endDate && item.date > filters.endDate) {
        return false;
      }

      return true;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
      let fieldA: any = a.creation;
      let fieldB: any = b.creation;

      if (filters.sortBy === "date") {
        fieldA = a.date;
        fieldB = b.date;
      } else if (filters.sortBy === "name") {
        fieldA = a.name;
        fieldB = b.name;
      } else if (filters.sortBy === "status") {
        fieldA = a.status;
        fieldB = b.status;
      }

      if (fieldA < fieldB) return filters.sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Compute Stats from entire backend result
    const stats = this.computeStats(rawList);

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
    const safePage = Math.min(Math.max(1, pagination.page), totalPages);
    const startIdx = (safePage - 1) * pagination.pageSize;
    const paginatedItems = filtered.slice(startIdx, startIdx + pagination.pageSize);

    return {
      enquiries: paginatedItems,
      pagination: {
        page: safePage,
        pageSize: pagination.pageSize,
        total,
        totalPages,
      },
      stats,
    };
  }

  /**
   * Get single Enquiry by ID directly from backend
   */
  public async getEnquiryById(id: string): Promise<{ enquiry: Enquiry; timeline: TimelineActivity[] }> {
    logger.log("Enquiry", "SERVICE", `Fetching enquiry ${id} from Frappe API`);

    const res = await EnquiryApi.getById(id);
    const resPayload = res.data as any;
    const doc: FrappeEnquiryDoc | undefined = resPayload?.data || resPayload?.message || (resPayload?.name ? resPayload : undefined);

    if (!doc) {
      throw new Error(`Enquiry record "${id}" was not found on the Frappe server.`);
    }

    const enquiry = this.normalizeEnquiry(doc);

    const timeline = this.timelineStore[enquiry.name] || [
      {
        id: `act-init-${enquiry.name}`,
        enquiryId: enquiry.name,
        type: "creation",
        title: "Enquiry Initialized",
        description: `Record registered with status "${enquiry.status}" in Frappe backend`,
        author: enquiry.userEmployeeName,
        timestamp: enquiry.creation,
      },
    ];

    return { enquiry, timeline };
  }

  /**
   * Create a new Enquiry in Frappe backend
   */
  public async createEnquiry(
    payload: Partial<Enquiry> & {
      mobile: string;
      enquiryDetails: string;
      group: string;
      userEmployee: string;
      assignedToEmployee?: string;
      date: string;
      status: EnquiryStatus;
      statusDetails?: string;
      customerName?: string;
    }
  ): Promise<Enquiry> {
    logger.log("Enquiry", "SERVICE", "Sending POST create request to Frappe API", payload);

    const frappePayload = this.prepareFrappePayload(payload);
    const res = await EnquiryApi.create(frappePayload);
    const resPayload = res.data as any;
    const doc: FrappeEnquiryDoc | undefined = resPayload?.data || resPayload?.message || (resPayload?.name ? resPayload : undefined);

    const createdDoc = this.normalizeEnquiry(doc || ({ name: "ENQ-NEW", ...frappePayload, creation: new Date().toISOString() } as FrappeEnquiryDoc));

    // Add creation activity to timeline
    this.addTimelineEvent(createdDoc.name, {
      type: "creation",
      title: "Enquiry Created",
      description: `Created for customer ${createdDoc.customerName} with initial status "${createdDoc.status}"`,
      author: createdDoc.userEmployeeName,
      authorRole: "CRM User",
    });

    return createdDoc;
  }

  /**
   * Update an existing Enquiry on Frappe backend
   */
  public async updateEnquiry(
    id: string,
    updates: Partial<Enquiry>
  ): Promise<Enquiry> {
    logger.log("Enquiry", "SERVICE", `Sending PUT update request for ${id} to Frappe API`, updates);

    let cleanMobile = updates.mobile;
    if (cleanMobile) {
      cleanMobile = cleanMobile.replace(/\D/g, "");
      if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) cleanMobile = cleanMobile.slice(1);
      else if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) cleanMobile = cleanMobile.slice(2);
      else if (cleanMobile.length > 10) cleanMobile = cleanMobile.slice(-10);
    }

    const payload: UpdateEnquiryPayload = {
      mobile: cleanMobile,
      enquiry_details: updates.enquiryDetails,
      group: updates.group,
      user_employee: updates.userEmployee,
      assigned_to_employee: updates.assignedToEmployee,
      date: updates.date,
      status: updates.status,
      status_details: updates.statusDetails,
    };

    const res = await EnquiryApi.update(id, payload);
    const resPayload = res.data as any;
    const doc: FrappeEnquiryDoc | undefined = resPayload?.data || resPayload?.message || (resPayload?.name ? resPayload : undefined);
    const updated = this.normalizeEnquiry(doc || ({ name: id, ...payload, creation: new Date().toISOString() } as FrappeEnquiryDoc));

    this.addTimelineEvent(updated.name, {
      type: updates.status ? "status_change" : "update",
      title: updates.status ? `Status Changed to ${updated.status}` : "Enquiry Updated",
      description: updates.status
        ? `Status updated to "${updated.status}". Notes: ${updated.statusDetails || "None"}`
        : "Enquiry details updated on Frappe backend",
      author: updated.userEmployeeName,
    });

    return updated;
  }

  /**
   * Add a custom activity/comment to the timeline
   */
  public addTimelineComment(
    enquiryId: string,
    comment: string,
    author: string = "Account Lead"
  ): TimelineActivity {
    return this.addTimelineEvent(enquiryId, {
      type: "note",
      title: "Internal Note Added",
      description: comment,
      author,
      authorRole: "Sales Executive",
    });
  }

  private addTimelineEvent(
    enquiryId: string,
    event: Omit<TimelineActivity, "id" | "enquiryId" | "timestamp">
  ): TimelineActivity {
    if (!this.timelineStore[enquiryId]) {
      this.timelineStore[enquiryId] = [];
    }

    const activity: TimelineActivity = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      enquiryId,
      timestamp: new Date().toISOString(),
    };

    this.timelineStore[enquiryId].unshift(activity);
    return activity;
  }

  /**
   * Computes comprehensive CRM KPI metrics and chart datasets
   */
  private computeStats(list: Enquiry[]): EnquiryStats {
    let open = 0;
    let inProgress = 0;
    let won = 0;
    let lost = 0;
    const byGroup: Record<string, number> = {};
    const employeeMap: Record<
      string,
      { employee: string; name: string; total: number; won: number; lost: number; open: number; inProgress: number }
    > = {};
    const dateMap: Record<string, { total: number; won: number; lost: number; open: number }> = {};

    list.forEach((item) => {
      // Status counts
      if (item.status === "Open") open++;
      else if (item.status === "In Progress") inProgress++;
      else if (item.status === "Won") won++;
      else if (item.status === "Lost") lost++;

      // By Group
      const g = item.group || "Unassigned";
      byGroup[g] = (byGroup[g] || 0) + 1;

      // By Employee
      const empId = item.userEmployee || "HR-EMP-00003";
      const empName = item.userEmployeeName || empId;
      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          employee: empId,
          name: empName,
          total: 0,
          won: 0,
          lost: 0,
          open: 0,
          inProgress: 0,
        };
      }
      employeeMap[empId].total++;
      if (item.status === "Won") employeeMap[empId].won++;
      else if (item.status === "Lost") employeeMap[empId].lost++;
      else if (item.status === "In Progress") employeeMap[empId].inProgress++;
      else employeeMap[empId].open++;

      // Timeline trend
      const d = item.date || item.creation.split("T")[0];
      if (!dateMap[d]) {
        dateMap[d] = { total: 0, won: 0, lost: 0, open: 0 };
      }
      dateMap[d].total++;
      if (item.status === "Won") dateMap[d].won++;
      else if (item.status === "Lost") dateMap[d].lost++;
      else dateMap[d].open++;
    });

    const total = list.length;
    const closed = won + lost;
    const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : 0;

    const employeePerformance: EmployeePerformance[] = Object.values(employeeMap).map((e) => ({
      employee: e.employee,
      name: e.name,
      total: e.total,
      open: e.open,
      inProgress: e.inProgress,
      won: e.won,
      lost: e.lost,
      conversion: e.total > 0 ? Math.round((e.won / e.total) * 100) : 0,
    }));

    const timelineTrends: TimelineDataPoint[] = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date,
        label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        total: counts.total,
        won: counts.won,
        lost: counts.lost,
        open: counts.open,
      }));

    return {
      total,
      open,
      inProgress,
      won,
      lost,
      conversionRate,
      byGroup,
      employeePerformance,
      timelineTrends,
    };
  }
}

export const enquiryService = new EnquiryService();
