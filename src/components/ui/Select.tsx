/**
 * Reusable Select Component with Validation & Custom Styling
 */

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronDown, AlertCircle } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options = [],
      required,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          <select
            ref={ref}
            id={selectId}
            className={twMerge(
              clsx(
                "block w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer",
                error
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20"
                  : "border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 hover:border-slate-300",
                className
              )
            )}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            {error ? (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
