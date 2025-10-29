
import { notFound } from 'next/navigation';
import { DomainMonitorClient } from '@/components/features/domains/domain-monitor-client';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { getDomain } from '@/lib/firebase/services';

// This is now a Server Component
export default async function DomainMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const domain = await getDomain(id);

  if (!domain) {
    notFound();
  }

  // We pass the fetched domain data to the Client Component
  return <DomainMonitorClient domain={domain} />;
}

// Add a suspense boundary for the page
export const dynamic = 'force-dynamic';
export function DomainMonitorSuspense() {
    return (
        <div className="flex w-full h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}
