/**
 * Reusable Input Component with Field-level Error & Icon Support
 */

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              clsx(
                "block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500",
                leftIcon ? "pl-10" : "pl-3.5",
                rightIcon ? "pr-10" : "pr-3.5",
                error
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20"
                  : "border-slate-200 focus:border-violet-500 focus:ring-violet-500/20 hover:border-slate-300",
                className
              )
            )}
            {...props}
          />
          {rightIcon && !error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
