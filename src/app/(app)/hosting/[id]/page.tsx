import { notFound } from "next/navigation";
import { HostingApplicationDetailClient } from "@/frontend/components/features/hosting/hosting-application-detail-client";
import { getHostingApplicationById } from "@/backend/services";
import React from "react";

export default async function HostingApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("=== HOSTING DETAIL PAGE ===");
  console.log("Requested ID:", id);

  try {
    const application = await getHostingApplicationById(id);

    console.log("Application found:", application ? "YES" : "NO");
    if (application) {
      console.log("Application data:", JSON.stringify(application, null, 2));
    }

    if (!application) {
      console.log("Application not found, calling notFound()");
      notFound();
    }

    return <HostingApplicationDetailClient application={application} />;
  } catch (error) {
    console.error("Error fetching hosting application:", error);
    notFound();
  }
}

// Add a suspense boundary for the page
export const dynamic = "force-dynamic";
