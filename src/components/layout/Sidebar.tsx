/**
 * CRM Sidebar — Dynamic Collapsible Design:
 * - Collapsible state for PC, Laptop, and Tablet Landscape
 * - Smooth transition between full width (w-64) and icon-only rail (w-[68px])
 * - Content stretchable based on sidebar state
 * - Open/Close toggle icons (PanelLeftClose / PanelLeft)
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Search,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onOpenSearch,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Enquiries", href: "/enquiries", icon: ClipboardList },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside
      className={`hidden md:flex fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-gray-100 flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Header: Brand + Open/Close Toggle Button */}
      <div
        className={`h-14 flex items-center border-b border-gray-100 shrink-0 transition-all duration-300 ${
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 shadow-xs shadow-violet-500/20">
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
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-bold text-gray-900 text-sm leading-tight truncate">Tech Media</div>
              <div className="text-[10px] text-gray-400 leading-tight">CRM Workspace</div>
            </div>
          )}
        </Link>

        {/* Toggle Collapse/Expand Button for PC, Laptop, and Tablet Landscape */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${
              isCollapsed ? "hidden" : "block"
            }`}
            title="Collapse Sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand Button when Collapsed */}
      {isCollapsed && onToggleCollapse && (
        <div className="px-2 pt-2 shrink-0 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
            title="Expand Sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar / Search Button */}
      <div className={`shrink-0 ${isCollapsed ? "px-2 py-2 flex justify-center" : "px-3 py-3"}`}>
        {isCollapsed ? (
          <button
            onClick={onOpenSearch}
            className="p-2 text-gray-400 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
            title="Search (⌘K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="flex-1 text-left text-sm truncate">Search enquiries…</span>
            <kbd className="text-[10px] text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono shrink-0">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 overflow-y-auto space-y-1 ${isCollapsed ? "px-2 py-1" : "px-3 py-2"}`}>
        {!isCollapsed && (
          <div className="px-2 pb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Navigation
            </span>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-lg text-sm font-medium transition-colors relative group ${
                isCollapsed
                  ? "justify-center p-2.5"
                  : "gap-3 px-3 py-2.5"
              } ${
                active
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-violet-600 rounded-r" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  active ? "text-violet-600" : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Status */}
      <div className={`border-t border-gray-100 shrink-0 space-y-0.5 ${isCollapsed ? "p-2" : "p-3"}`}>
        <Link
          href="/dashboard"
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
            isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400 shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <Link
          href="/dashboard"
          title={isCollapsed ? "Help & Support" : undefined}
          className={`flex items-center rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
            isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-gray-400 shrink-0" />
          {!isCollapsed && <span>Help &amp; Support</span>}
        </Link>

        {/* Live API Status */}
        {isCollapsed ? (
          <div className="flex justify-center pt-2" title="Frappe API Connected · Live data">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        ) : (
          <div className="mx-1 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span className="text-xs font-medium text-gray-600">Frappe API Connected</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
              logicx.tmnext.in · Live data
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
