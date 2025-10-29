
'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import type { User } from '@/backend/models/types';
import { SuperAdminDashboard } from '@/components/features/dashboard/super-admin-dashboard';
import { KabidDashboard } from '@/components/features/dashboard/kabid-dashboard';
import { Loader2 } from 'lucide-react';

function SuperAdminDashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as User['role'];
    
  const getDashboardForRole = () => {
    switch (role) {
      case 'Administrator':
        return <KabidDashboard />;
      case 'Super Admin':
        return <SuperAdminDashboard role={role} />;
      default:
        // Fallback or a generic dashboard
        return <div>Dashboard tidak tersedia untuk peran ini.</div>;
    }
  }
  
  return (
    <div>
        {getDashboardForRole()}
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
