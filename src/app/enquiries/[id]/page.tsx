/**
 * Single Enquiry Details Workspace Page (/enquiries/[id])
 */

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useEnquiryDetails } from "@/features/enquiries/hooks/useEnquiryDetails";
import { useEnquiryMutations } from "@/features/enquiries/hooks/useEnquiryMutations";
import { EnquiryDetails } from "../components/EnquiryDetails";
import { EnquiryFormModal } from "../components/EnquiryFormModal";
import { DetailsSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const {
    enquiry,
    timeline,
    isLoading,
    isUpdating,
    isError,
    errorMessage,
    refetch,
    updateStatus,
    addTimelineComment,
  } = useEnquiryDetails(id);

  const { success, error: toastError } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { updateEnquiry, isSubmitting, generalError } = useEnquiryMutations();

  const handleUpdate = async (formData: any): Promise<boolean> => {
    if (!enquiry) return false;

    const updated = await updateEnquiry(enquiry.name, formData);
    if (updated) {
      success(`Enquiry ${enquiry.name} updated successfully.`);
      setIsEditModalOpen(false);
      refetch();
      return true;
    } else {
      toastError(generalError || "Failed to update enquiry. Please verify form values.");
      return false;
    }
  };

  const handleAddComment = async (commentText: string) => {
    try {
      await addTimelineComment(commentText);
      success("Note added to activity timeline.");
    } catch {
      toastError("Failed to add note.");
    }
  };

  return (
    <AppShell>
      {isLoading ? (
        <DetailsSkeleton />
      ) : isError || !enquiry ? (
        <div className="bg-white rounded-2xl p-8 border border-rose-200 shadow-card text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Enquiry Record Not Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {errorMessage || `Unable to find details for enquiry record "${id}".`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/enquiries")}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to List
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={refetch}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="shadow-violet-sm"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          <EnquiryDetails
            enquiry={enquiry}
            timeline={timeline}
            onEdit={() => setIsEditModalOpen(true)}
            onUpdateStatus={updateStatus}
            onAddComment={handleAddComment}
            isUpdating={isUpdating}
          />

          <EnquiryFormModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdate}
            initialData={enquiry}
            isSubmitting={isSubmitting}
            availableGroups={Array.from(new Set([enquiry.group, "Stores", "DELL", "Corporate", "Retail"])).filter(Boolean)}
            availableEmployees={[
              {
                id: enquiry.userEmployee || "HR-EMP-00003",
                name: enquiry.userEmployeeName || enquiry.userEmployee || "Sales Representative (HR-EMP-00003)",
              },
            ]}
          />
        </>
      )}
    </AppShell>
  );
}
