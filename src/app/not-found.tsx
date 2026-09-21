/**
 * 404 Not Found Page for CRM
 */

import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center space-y-4 max-w-md w-full">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Page Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The CRM page or record you are looking for does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/enquiries"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Enquiries</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
