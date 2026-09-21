"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-sm font-medium text-gray-500">Loading CRM...</div>
      </div>
    </div>
  );
}
