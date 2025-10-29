
import { notFound } from 'next/navigation';
import { HostingApplicationDetailClient } from '@/components/features/hosting/hosting-application-detail-client';
import { getHostingApplication } from '@/lib/firebase/services';
import { Loader2 } from 'lucide-react';
import React from 'react';

export default async function HostingApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await getHostingApplication(id);

  if (!application) {
    notFound();
  }

  return <HostingApplicationDetailClient application={application} />;
}

// Add a suspense boundary for the page
export const dynamic = 'force-dynamic';
