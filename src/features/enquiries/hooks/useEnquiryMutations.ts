/**
 * Custom React Hook for Enquiry Creation, Updates, and Actions
 */

"use client";

import { useCallback, useState } from "react";
import { logger } from "@/lib/api/logger";
import { enquiryService } from "../services/enquiry.service";
import { Enquiry, EnquiryStatus } from "../types/enquiry.types";
import { validateEnquiryForm } from "../validation/enquiry.schema";

export function useEnquiryMutations(onSuccess?: (enquiry: Enquiry) => void) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>("");

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError("");
  }, []);

  const createEnquiry = useCallback(
    async (formData: {
      customerName?: string;
      mobile: string;
      enquiryDetails: string;
      group: string;
      userEmployee: string;
      assignedToEmployee?: string;
      date: string;
      status: EnquiryStatus;
      statusDetails?: string;
    }): Promise<Enquiry | null> => {
      clearErrors();

      // Client-side field-level validation
      const validation = validateEnquiryForm(formData);
      if (!validation.isValid) {
        setFieldErrors(validation.errors as Record<string, string>);
        const firstErr = Object.values(validation.errors)[0] || "Validation failed.";
        setGeneralError(firstErr);
        logger.warn("Enquiry", "HOOK", "Create enquiry validation failed", validation.errors);
        return null;
      }

      setIsSubmitting(true);
      logger.log("Enquiry", "HOOK", "Submitting create enquiry payload", formData);

      try {
        const created = await enquiryService.createEnquiry(formData);
        logger.log("Enquiry", "HOOK", `Enquiry created: ${created.name}`);
        if (onSuccess) onSuccess(created);
        return created;
      } catch (err: any) {
        const msg = err?.userMessage || err?.message || "Failed to create enquiry.";
        setGeneralError(msg);
        logger.error("Enquiry", "HOOK", "Create enquiry failed", err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearErrors, onSuccess]
  );

  const updateEnquiry = useCallback(
    async (
      id: string,
      formData: {
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
    ): Promise<Enquiry | null> => {
      clearErrors();

      const validation = validateEnquiryForm(formData);
      if (!validation.isValid) {
        setFieldErrors(validation.errors as Record<string, string>);
        const firstErr = Object.values(validation.errors)[0] || "Validation failed.";
        setGeneralError(firstErr);
        return null;
      }

      setIsSubmitting(true);
      logger.log("Enquiry", "HOOK", `Submitting update enquiry ${id}`, formData);

      try {
        const updated = await enquiryService.updateEnquiry(id, formData);
        logger.log("Enquiry", "HOOK", `Enquiry updated: ${updated.name}`);
        if (onSuccess) onSuccess(updated);
        return updated;
      } catch (err: any) {
        const msg = err?.userMessage || err?.message || "Failed to update enquiry.";
        setGeneralError(msg);
        logger.error("Enquiry", "HOOK", `Update failed for ${id}`, err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearErrors, onSuccess]
  );

  return {
    createEnquiry,
    updateEnquiry,
    isSubmitting,
    fieldErrors,
    generalError,
    clearErrors,
  };
}
