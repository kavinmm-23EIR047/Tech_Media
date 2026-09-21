/**
 * Shimmer Skeleton Loader Components for CRM State Transitions
 */

import React from "react";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200/80 ${className || ""}`}
      {...props}
    />
  );
};

export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <div className="flex items-baseline gap-3">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);



export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
      {/* Table Header Skeleton */}
      <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-1/4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
