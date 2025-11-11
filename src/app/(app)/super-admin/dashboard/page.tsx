
'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import type { User } from '@/backend/models/types';
import { SuperAdminDashboard } from '@/components/features/super-admin/dashboard';
import { Loader2 } from 'lucide-react';

function SuperAdminDashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as User['role'];
  
  return (
    <div>
      <SuperAdminDashboard role={role} />
    </div>
  );
}


export default function SuperAdminDashboardPage() {
  return (
    <React.Suspense fallback={<div className='w-full h-full flex items-center justify-center'><Loader2 className='h-8 w-8 animate-spin' /></div>}>
      <SuperAdminDashboardContent />
    </React.Suspense>
  )
}
