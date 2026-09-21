/**
 * Custom React Hook for Enquiry List Management
 * Handles debounced search, multi-filter criteria, pagination, sorting, and loading/error states.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/lib/api/logger";
import { enquiryService } from "../services/enquiry.service";
import {
  Enquiry,
  EnquiryFilters,
  EnquiryPagination,
  EnquiryStats,
  EnquiryStatus,
} from "../types/enquiry.types";

export type ViewMode = "table" | "cards" | "analytics";

const DEFAULT_FILTERS: EnquiryFilters = {
  search: "",
  status: "All",
  group: "All",
  employee: "All",
  startDate: "",
  endDate: "",
  sortBy: "creation",
  sortOrder: "desc",
};

export function useEnquiries(initialPageSize = 10) {
  const [filters, setFilters] = useState<EnquiryFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [pagination, setPagination] = useState<EnquiryPagination>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 1,
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<EnquiryStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    won: 0,
    lost: 0,
    conversionRate: 0,
    byGroup: {},
    employeePerformance: [],
    timelineTrends: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Search debounce timer
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPagination((p) => ({ ...p, page: 1 })); // Reset to first page on search
    }, 300);
  }, []);

  const fetchEnquiries = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");

    logger.log("Enquiry", "HOOK", "useEnquiries fetching data", {
      filters: { ...filters, search: debouncedSearch },
      pagination,
    });

    try {
      const result = await enquiryService.getEnquiries(
        { ...filters, search: debouncedSearch },
        { page: pagination.page, pageSize: pagination.pageSize }
      );

      setEnquiries(result.enquiries);
      setPagination(result.pagination);
      setStats(result.stats);
      logger.log("Enquiry", "HOOK", `Fetched ${result.enquiries.length} enquiries successfully`);
    } catch (err: any) {
      setIsError(true);
      const msg = err?.userMessage || err?.message || "Failed to load enquiries.";
      setErrorMessage(msg);
      logger.error("Enquiry", "HOOK", "Error fetching enquiries", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, debouncedSearch, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  // Filter setters
  const setStatus = useCallback((status: EnquiryStatus | "All") => {
    setFilters((prev) => ({ ...prev, status }));
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  const setGroup = useCallback((group: string | "All") => {
    setFilters((prev) => ({ ...prev, group }));
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  const setEmployee = useCallback((employee: string | "All") => {
    setFilters((prev) => ({ ...prev, employee }));
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setFilters((prev) => ({ ...prev, startDate, endDate }));
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  const setSorting = useCallback(
    (sortBy: "creation" | "date" | "name" | "status", sortOrder?: "asc" | "desc") => {
      setFilters((prev) => {
        const nextOrder =
          sortOrder || (prev.sortBy === sortBy ? (prev.sortOrder === "asc" ? "desc" : "asc") : "desc");
        return { ...prev, sortBy, sortOrder: nextOrder };
      });
    },
    []
  );

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch("");
    setPagination((p) => ({ ...p, page: 1 }));
  }, []);

  return {
    enquiries,
    stats,
    pagination,
    filters,
    isLoading,
    isError,
    errorMessage,
    viewMode,
    setViewMode,
    setSearch: handleSearchChange,
    setStatus,
    setGroup,
    setEmployee,
    setDateRange,
    setSorting,
    setPage,
    setPageSize,
    resetFilters,
    refetch: fetchEnquiries,
  };
}
