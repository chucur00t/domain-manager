"use client";

import { useSearchParams } from "next/navigation";
import React from "react";
import type { User } from "@/backend/models/types";
import { Loader2 } from "lucide-react";
import { AdminDaerahDashboard } from "@/components/features/admin-daerah/dashboard";

function DashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as User["role"];

  return <AdminDaerahDashboard role={role} />;
}

export default function Dashboard() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-full w-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
