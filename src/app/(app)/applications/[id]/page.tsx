import { notFound } from "next/navigation";
import { ApplicationDetailClient } from "@/components/features/applications/application-detail-client";
import { getApplicationById } from "@/backend/services";

// This is now a Server Component
export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  try {
    const application = await getApplicationById(id);

    if (!application) {
      notFound();
    }

    // We pass the fetched application data to the Client Component
    return <ApplicationDetailClient application={application} />;
  } catch (error) {
    console.error("Error fetching application:", error);
    notFound();
  }
}

// Add a suspense boundary for the page
export const dynamic = "force-dynamic";
