
import { notFound } from 'next/navigation';
import { ApplicationDetailClient } from '@/components/features/applications/application-detail-client';
import { getApplicationById } from '@/lib/firebase/services';

// This is now a Server Component
export default async function ApplicationDetailPage({ params: { id } }: { params: { id: string } }) {
  const application = await getApplicationById(id);

  if (!application) {
    notFound();
  }

  // We pass the fetched application data to the Client Component
  return <ApplicationDetailClient application={application} />;
}


// Add a suspense boundary for the page
export const dynamic = 'force-dynamic';
