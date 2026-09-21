/**
 * Accessible Badge Component for CRM Tags & Statuses
 */

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "violet" | "secondary" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full border select-none transition-colors";

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    secondary: "bg-slate-50 text-slate-600 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  const dotColor = {
    default: "bg-slate-400",
    violet: "bg-violet-500",
    secondary: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor[variant]}`} />}
      {children}
    </span>
  );
};
