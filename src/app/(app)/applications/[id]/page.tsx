import { notFound } from "next/navigation";
import { ApplicationDetailClient } from "@/components/features/applications/application-detail-client";
import { HostingApplicationDetailClient } from "@/frontend/components/features/hosting/hosting-application-detail-client";
import { getApplicationById } from "@/backend/services";

// This is now a Server Component
export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  console.log("\n=== APPLICATION DETAIL PAGE ===");
  console.log("Requested ID:", id);
  
  try {
    const application = await getApplicationById(id);

    if (!application) {
      console.log("Application not found");
      notFound();
    }

    console.log("Application type:", application.application_type);
    console.log("Application data:", JSON.stringify(application, null, 2));

    // Check application type and render the appropriate detail component
    if (application.application_type === "hosting") {
      console.log("→ Rendering HostingApplicationDetailClient");
      return <HostingApplicationDetailClient application={application as any} />;
    }

    // Default to domain application detail
    console.log("→ Rendering ApplicationDetailClient (domain)");
    return <ApplicationDetailClient application={application} />;
  } catch (error) {
    console.error("Error fetching application:", error);
    notFound();
  }
}

// Add a suspense boundary for the page
export const dynamic = "force-dynamic";
