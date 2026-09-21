/**
 * Accessible Status Badge Component for CRM Enquiries
 * Complies with Requirement #13: Uses icon + label + subtle background + accessible contrast.
 */

import React from "react";
import { Clock, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { EnquiryStatus } from "@/features/enquiries/types/enquiry.types";
import { CRM_STATUS_CONFIG } from "@/features/enquiries/utils/enquiry.utils";

interface EnquiryStatusBadgeProps {
  status: EnquiryStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const EnquiryStatusBadge: React.FC<EnquiryStatusBadgeProps> = ({
  status,
  size = "md",
  className = "",
}) => {
  const config = CRM_STATUS_CONFIG[status as EnquiryStatus] || CRM_STATUS_CONFIG.Open;

  const renderIcon = () => {
    switch (config.iconName) {
      case "Clock":
        return <Clock className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case "TrendingUp":
        return <TrendingUp className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case "CheckCircle2":
        return <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case "XCircle":
        return <XCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs select-none transition-colors ${config.badgeClass} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
      <span className="flex-shrink-0">{renderIcon()}</span>
      <span>{config.label}</span>
    </span>
  );
};
