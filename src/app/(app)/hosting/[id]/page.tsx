
import { notFound } from 'next/navigation';
import { HostingApplicationDetailClient } from '@/components/features/hosting/hosting-application-detail-client';
import { getHostingApplicationById } from '@/lib/firebase/services';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default async function HostingApplicationDetailPage({ params: { id } }: { params: { id: string } }) {
  const application = await getHostingApplicationById(id);

  if (!application) {
    notFound();
  }

  return <HostingApplicationDetailClient application={application} />;
}

// Add a suspense boundary for the page
export const dynamic = 'force-dynamic';
