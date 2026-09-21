/**
 * Custom React Hook for Single Enquiry Detail & Activity Timeline
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { logger } from "@/lib/api/logger";
import { enquiryService } from "../services/enquiry.service";
import { Enquiry, EnquiryStatus, TimelineActivity } from "../types/enquiry.types";

export function useEnquiryDetails(id: string) {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [timeline, setTimeline] = useState<TimelineActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");

    logger.log("Enquiry", "HOOK", `useEnquiryDetails fetching record: ${id}`);

    try {
      const data = await enquiryService.getEnquiryById(id);
      setEnquiry(data.enquiry);
      setTimeline(data.timeline);
      logger.log("Enquiry", "HOOK", `Enquiry ${id} loaded successfully`, data.enquiry);
    } catch (err: any) {
      setIsError(true);
      const msg = err?.userMessage || err?.message || `Failed to load enquiry ${id}`;
      setErrorMessage(msg);
      logger.error("Enquiry", "HOOK", `Failed to load enquiry ${id}`, err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  /**
   * Quick status change with instant feedback
   */
  const updateStatus = useCallback(
    async (newStatus: EnquiryStatus, statusDetails?: string) => {
      if (!id || !enquiry) return;

      setIsUpdating(true);
      logger.log("Enquiry", "HOOK", `Updating status for ${id} to ${newStatus}`);

      try {
        const updated = await enquiryService.updateEnquiry(id, {
          status: newStatus,
          statusDetails: statusDetails ?? enquiry.statusDetails,
        });

        setEnquiry(updated);
        // Refresh timeline
        const details = await enquiryService.getEnquiryById(id);
        setTimeline(details.timeline);
        return updated;
      } catch (err: any) {
        logger.error("Enquiry", "HOOK", `Status update failed for ${id}`, err);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [id, enquiry]
  );

  /**
   * Add a note / comment to the activity timeline
   */
  const addTimelineComment = useCallback(
    async (commentText: string, authorName = "Rajesh Kumar") => {
      if (!id || !commentText.trim()) return;

      logger.log("Enquiry", "HOOK", `Adding comment to timeline for ${id}`);
      try {
        const newAct = enquiryService.addTimelineComment(id, commentText.trim(), authorName);
        setTimeline((prev) => [newAct, ...prev]);
        return newAct;
      } catch (err: any) {
        logger.error("Enquiry", "HOOK", `Failed to add comment for ${id}`, err);
        throw err;
      }
    },
    [id]
  );

  /**
   * Full details update
   */
  const updateEnquiry = useCallback(
    async (updates: Partial<Enquiry>) => {
      if (!id) return;
      setIsUpdating(true);
      try {
        const updated = await enquiryService.updateEnquiry(id, updates);
        setEnquiry(updated);
        const refreshed = await enquiryService.getEnquiryById(id);
        setTimeline(refreshed.timeline);
        return updated;
      } catch (err: any) {
        logger.error("Enquiry", "HOOK", `Update failed for ${id}`, err);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [id]
  );

  return {
    enquiry,
    timeline,
    isLoading,
    isUpdating,
    isError,
    errorMessage,
    refetch: fetchDetails,
    updateStatus,
    addTimelineComment,
    updateEnquiry,
  };
}
