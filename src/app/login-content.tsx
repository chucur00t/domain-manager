'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import React, { useState, useEffect } from 'react';
import type { User } from '@/backend/models/types';
import { useSearchParams } from 'next/navigation';

const ROLES: User['role'][] = ['Super Admin', 'Admin Daerah'];

export default function LoginContent() {
  const searchParams = useSearchParams();
  const lastRole = searchParams.get('role') as User['role'];
  
  const [selectedRole, setSelectedRole] = useState<User['role']>(lastRole || 'Admin Daerah');

  useEffect(() => {
    // If a role is passed in the URL (e.g. after being logged out), set it.
    if (lastRole && ROLES.includes(lastRole)) {
      setSelectedRole(lastRole);
    } else {
      // Default to Super Admin if no valid role
      setSelectedRole('Super Admin');
    }
  }, [lastRole]);

  const getDashboardLink = () => {
    const roleQuery = `?role=${encodeURIComponent(selectedRole)}`;
    if (selectedRole === 'Super Admin') {
      return `/super-admin/dashboard${roleQuery}`;
    }
    return `/dashboard${roleQuery}`;
  }

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={selectedRole} 
        onValueChange={(value: User['role']) => setSelectedRole(value)}
        className="space-y-4"
      >
         <Label className="font-semibold">Pilih Pintu Akses:</Label>
         {ROLES.map(role => (
           <div className="flex items-center space-x-2" key={role}>
            <RadioGroupItem value={role} id={role.toLowerCase().replace(/ /g, '-')} />
            <Label htmlFor={role.toLowerCase().replace(/ /g, '-')}>{role}</Label>
          </div>
         ))}
      </RadioGroup>
      <div className="pt-2">
        <Link href={getDashboardLink()} className="w-full">
          <Button className="w-full">Login</Button>
        </Link>
      </div>
    </div>
  );
}
