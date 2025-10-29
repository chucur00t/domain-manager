
import { notFound } from 'next/navigation';
import { DomainDetailClient } from '@/components/features/domains/domain-detail-client';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { getDomain } from '@/lib/firebase/services';


// This is now a Server Component
export default async function DomainDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const domain = await getDomain(id);
  
  if (!domain) {
    notFound();
  }

  // We pass the fetched domain data to the Client Component
  return <DomainDetailClient domain={domain} />;
}

// Add a suspense boundary for the page
export const dynamic = 'force-dynamic';
