/**
 * Enquiry API Layer
 * Pure HTTP communication with Frappe v2 API endpoints.
 */

import { apiClient, ApiResponse } from "@/lib/api/client";
import { API_CONFIG } from "@/config/api.config";
import {
  CreateEnquiryPayload,
  FrappeEnquiryDoc,
  FrappeGetListRequest,
  FrappeResponse,
  UpdateEnquiryPayload,
} from "../types/enquiry.types";

export interface EnquiryApiListParams {
  fields?: string[];
  filters?: Array<[string, string, any]> | Record<string, any>;
  orderBy?: string;
  limitPageLength?: number;
  limitStart?: number;
}

const DEFAULT_FIELDS = [
  "name",
  "date",
  "creation",
  "status",
  "group",
  "mobile",
  "user_employee",
  "assigned_to_employee",
  "status_details",
  "customer.customer_name",
  "user_employee.employee_name as user_employee_name",
  "enquiry_details",
];

export class EnquiryApi {
  /**
   * 1. Fetch paginated list of Enquiries
   * POST https://logicx.tmnext.in/api/v2/method/frappe.client.get_list
   */
  public static async getList(
    params: EnquiryApiListParams = {}
  ): Promise<ApiResponse<FrappeResponse<FrappeEnquiryDoc[]>>> {
    const payload: FrappeGetListRequest = {
      doctype: "Enquiry",
      fields: params.fields || DEFAULT_FIELDS,
      filters: params.filters || [],
      order_by: params.orderBy || "creation desc",
      limit_page_length: params.limitPageLength ?? 20,
      limit_start: params.limitStart ?? 0,
    };

    return apiClient.post<FrappeResponse<FrappeEnquiryDoc[]>>(
      API_CONFIG.endpoints.enquiry.list,
      payload,
      {
        module: "Enquiry",
        operation: "getList",
      }
    );
  }

  /**
   * 2. API to read Enquiry by ID
   * GET https://logicx.tmnext.in/api/v2/document/Enquiry/:id
   */
  public static async getById(
    id: string
  ): Promise<ApiResponse<FrappeResponse<FrappeEnquiryDoc>>> {
    const endpoint = API_CONFIG.endpoints.enquiry.detail(id);

    return apiClient.get<FrappeResponse<FrappeEnquiryDoc>>(endpoint, {
      module: "Enquiry",
      operation: "getById",
    });
  }

  /**
   * 3. API to create Enquiry
   * POST https://logicx.tmnext.in/api/v2/document/Enquiry
   */
  public static async create(
    data: CreateEnquiryPayload
  ): Promise<ApiResponse<FrappeResponse<FrappeEnquiryDoc>>> {
    return apiClient.post<FrappeResponse<FrappeEnquiryDoc>>(
      API_CONFIG.endpoints.enquiry.create,
      data,
      {
        module: "Enquiry",
        operation: "create",
      }
    );
  }

  /**
   * 4. API to update Enquiry
   * PUT https://logicx.tmnext.in/api/v2/document/Enquiry/:id
   */
  public static async update(
    id: string,
    data: UpdateEnquiryPayload
  ): Promise<ApiResponse<FrappeResponse<FrappeEnquiryDoc>>> {
    const endpoint = API_CONFIG.endpoints.enquiry.update(id);

    return apiClient.put<FrappeResponse<FrappeEnquiryDoc>>(endpoint, data, {
      module: "Enquiry",
      operation: "update",
    });
  }

  /**
   * Delete an Enquiry
   * DELETE https://logicx.tmnext.in/api/v2/document/Enquiry/:id
   */
  public static async delete(
    id: string
  ): Promise<ApiResponse<FrappeResponse<{ success: boolean }>>> {
    const endpoint = API_CONFIG.endpoints.enquiry.delete(id);

    return apiClient.delete<FrappeResponse<{ success: boolean }>>(endpoint, {
      module: "Enquiry",
      operation: "delete",
    });
  }
}
