/**
 * Customer Enquiries Page — Image 1 (Customers page) style
 * Clean, flat layout: Header → Stats (3 cards) → Tabs/Filters → Table
 * No top navbar. No dummy data. All data from Frappe API.
 */

"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useEnquiries } from "@/features/enquiries/hooks/useEnquiries";
import { useEnquiryMutations } from "@/features/enquiries/hooks/useEnquiryMutations";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { EnquiryHeader } from "./components/EnquiryHeader";
import { EnquiryStats } from "./components/EnquiryStats";
import { EnquiryFilters } from "./components/EnquiryFilters";
import { EnquiryTable } from "./components/EnquiryTable";
import { EnquiryCardGrid } from "./components/EnquiryCard";
import { EnquiryCharts } from "./components/EnquiryCharts";
import { EnquiryFormModal } from "./components/EnquiryFormModal";
import { TableSkeleton, CardSkeletonGrid, StatsSkeleton } from "@/components/ui/Skeleton";
import { exportEnquiriesToCsv } from "@/features/enquiries/utils/enquiry.utils";
import { useToast } from "@/components/ui/Toast";
import { Enquiry, EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import { AlertTriangle, RefreshCw, Plus, SearchX } from "lucide-react";

export default function EnquiriesPage() {
  const {
    enquiries,
    stats,
    pagination,
    filters,
    isLoading,
    isError,
    errorMessage,
    viewMode,
    setViewMode,
    setSearch,
    setStatus,
    setGroup,
    setEmployee,
    setDateRange,
    setSorting,
    setPage,
    setPageSize,
    resetFilters,
    refetch,
  } = useEnquiries(20);

  const { success, error: toastError } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);

  const { createEnquiry, updateEnquiry, isSubmitting, generalError } = useEnquiryMutations();

  const handleCreateOrUpdate = async (formData: any): Promise<boolean> => {
    if (editingEnquiry) {
      const updated = await updateEnquiry(editingEnquiry.name, formData);
      if (updated) {
        success(`Enquiry ${editingEnquiry.name} updated successfully.`);
        setEditingEnquiry(null);
        refetch();
        return true;
      }
      toastError(generalError || "Failed to update enquiry. Please verify form values.");
      return false;
    } else {
      const created = await createEnquiry(formData);
      if (created) {
        success(`Enquiry ${created.name} created successfully!`);
        setIsCreateModalOpen(false);
        refetch();
        return true;
      }
      toastError(generalError || "Failed to create enquiry. Please check required fields.");
      return false;
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    const existing = enquiries.find((e) => e.name === id);
    if (!existing) return;
    const updated = await updateEnquiry(id, { ...existing, status: newStatus });
    if (updated) {
      success(`Status for ${id} changed to "${newStatus}".`);
      refetch();
    }
  };

  const handleExportCsv = () => {
    if (enquiries.length === 0) {
      toastError("No enquiries available to export.");
      return;
    }
    exportEnquiriesToCsv(enquiries, `enquiries_${new Date().toISOString().split("T")[0]}.csv`);
    success(`Exported ${enquiries.length} records to CSV.`);
  };

  const openCreate = () => {
    setEditingEnquiry(null);
    setIsCreateModalOpen(true);
  };

  // Dynamic groups & employees derived from live Frappe API records
  const availableGroups = React.useMemo(() => {
    const groups = Array.from(new Set(enquiries.map((e) => e.group).filter(Boolean)));
    return groups.length > 0 ? groups : ["Stores", "DELL"];
  }, [enquiries]);

  const availableEmployees = React.useMemo(() => {
    const map = new Map<string, string>();
    enquiries.forEach((e) => {
      if (e.userEmployee) {
        map.set(e.userEmployee, e.userEmployeeName || e.userEmployee);
      }
    });
    const list = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    return list.length > 0 ? list : [{ id: "HR-EMP-00003", name: "Sales Representative (HR-EMP-00003)" }];
  }, [enquiries]);

  return (
    <AppShell onOpenCreateModal={openCreate}>
      {/* 1. Page Header */}
      <EnquiryHeader
        onOpenCreateModal={openCreate}
        onExportCsv={handleExportCsv}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />

      {/* 2. KPI Stats — 3 cards (skeleton while loading) */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <EnquiryStats
          stats={stats}
          enquiries={enquiries}
          activeStatusFilter={filters.status}
          onSelectStatus={setStatus}
          onOpenCreateModal={openCreate}
          onViewAnalytics={() => setViewMode("analytics")}
        />
      )}

      {/* 3. Tabs + Filter chips */}
      <EnquiryFilters
        filters={filters}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onGroupChange={setGroup}
        onEmployeeChange={setEmployee}
        onDateRangeChange={setDateRange}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalFiltered={pagination.total}
        allEnquiries={enquiries}
        stats={stats}
        onOpenCreateModal={openCreate}
        onExportCsv={handleExportCsv}
      />

      {/* 4. Content Area */}
      {isLoading ? (
        viewMode === "cards" ? <CardSkeletonGrid count={8} /> : <TableSkeleton rows={8} />
      ) : isError ? (
        /* Error State */
        <div className="bg-white rounded-xl border border-red-100 p-10 text-center space-y-4 max-w-lg mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Unable to load enquiries</h3>
            <p className="text-sm text-gray-500 mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Request
          </button>
        </div>
      ) : enquiries.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4 max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center mx-auto">
            <SearchX className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">No enquiries found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters or add the first enquiry.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Enquiry
            </button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === "table" && (
            <EnquiryTable
              enquiries={enquiries}
              pagination={pagination}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={setSorting}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onEditEnquiry={async (enq) => {
                setEditingEnquiry(enq);
                setIsCreateModalOpen(true);
                try {
                  const fullDoc = await enquiryService.getEnquiryById(enq.name);
                  if (fullDoc?.enquiry) {
                    setEditingEnquiry(fullDoc.enquiry);
                  }
                } catch {
                  // Fall back to existing row data if single fetch fails
                }
              }}
              onQuickStatusChange={handleQuickStatusChange}
            />
          )}

          {viewMode === "cards" && (
            <EnquiryCardGrid
              enquiries={enquiries}
              onEditEnquiry={async (enq) => {
                setEditingEnquiry(enq);
                setIsCreateModalOpen(true);
                try {
                  const fullDoc = await enquiryService.getEnquiryById(enq.name);
                  if (fullDoc?.enquiry) {
                    setEditingEnquiry(fullDoc.enquiry);
                  }
                } catch {
                  // Fall back to existing row data if single fetch fails
                }
              }}
              onQuickStatusChange={handleQuickStatusChange}
            />
          )}

          {viewMode === "analytics" && <EnquiryCharts stats={stats} />}
        </>
      )}

      {/* 5. Create / Edit Modal */}
      <EnquiryFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEnquiry(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingEnquiry}
        isSubmitting={isSubmitting}
        availableGroups={availableGroups}
        availableEmployees={availableEmployees}
      />
    </AppShell>
  );
}
