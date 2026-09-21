/**
 * Main CRM App Shell Wrapper
 * - Mobile (< md): Fixed clean top bar (brand only) + Bottom Navigation
 * - Tablet Landscape / Laptop / PC (md:): Dynamic stretchable layout with collapsible sidebar
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { ToastProvider, useToast } from "../ui/Toast";
import { GlobalSearchModal } from "../search/GlobalSearchModal";
import { EnquiryFormModal } from "@/app/enquiries/components/EnquiryFormModal";
import { enquiryService } from "@/features/enquiries/services/enquiry.service";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  onOpenCreateModal?: () => void;
}

const AppShellContent: React.FC<AppShellProps> = ({ children, onOpenCreateModal }) => {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInternalCreateOpen, setIsInternalCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenCreate = useCallback(() => {
    if (onOpenCreateModal) {
      onOpenCreateModal();
    } else {
      setIsInternalCreateOpen(true);
    }
  }, [onOpenCreateModal]);

  const handleCreateSubmit = async (formData: any): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const created = await enquiryService.createEnquiry(formData);
      success(`Enquiry ${created.name} created successfully!`);
      setIsInternalCreateOpen(false);
      router.push(`/enquiries/${created.name}`);
      return true;
    } catch (err: any) {
      toastError(err?.userMessage || err?.message || "Failed to create enquiry.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── 1. Mobile Fixed Top Bar (md:hidden) — Clean Brand Only ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 h-12 px-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 shadow-xs shadow-violet-500/20">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-none">Tech Media</div>
            <div className="text-[10px] text-gray-400 leading-tight">CRM Workspace</div>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live</span>
        </div>
      </header>

      {/* ── 2. PC / Laptop / Tablet Landscape Sidebar (md:flex) ── */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* ── 3. Dynamic Stretchable Main Content Area ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "md:pl-[68px]" : "md:pl-64"
        }`}
      >
        <main className="flex-1 w-full max-w-full pt-15 md:pt-6 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── 4. Mobile Bottom Navigation (md:hidden) ── */}
      <BottomNav
        onOpenCreate={handleOpenCreate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* ── 5. Global Search Command Palette (Ctrl+K) ── */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenCreateModal={handleOpenCreate}
      />

      {/* ── 6. Fallback Create Modal for pages without dedicated modal ── */}
      {!onOpenCreateModal && (
        <EnquiryFormModal
          isOpen={isInternalCreateOpen}
          onClose={() => setIsInternalCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          isSubmitting={isSubmitting}
          availableGroups={["Stores", "DELL", "Corporate", "Retail"]}
          availableEmployees={[
            { id: "HR-EMP-00003", name: "Sales Representative (HR-EMP-00003)" },
          ]}
        />
      )}
    </div>
  );
};

export const AppShell: React.FC<AppShellProps> = ({ children, onOpenCreateModal }) => {
  return (
    <ToastProvider>
      <AppShellContent onOpenCreateModal={onOpenCreateModal}>
        {children}
      </AppShellContent>
    </ToastProvider>
  );
};
