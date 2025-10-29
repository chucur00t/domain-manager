
import { notFound } from 'next/navigation';
import { ApplicationDetailClient } from '@/components/features/applications/application-detail-client';
import { getApplication } from '@/lib/firebase/services';

// This is now a Server Component
export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  // We pass the fetched application data to the Client Component
  return <ApplicationDetailClient application={application} />;
}


// Add a suspense boundary for the page
export const dynamic = 'force-dynamic';
