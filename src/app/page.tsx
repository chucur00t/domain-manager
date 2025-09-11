
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import React, { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

const ROLES: User['role'][] = ['Administrator', 'Super Admin', 'Operator', 'Auditor'];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const lastRole = searchParams.get('role') as User['role'];
  
  const [selectedRole, setSelectedRole] = useState<User['role']>(lastRole || 'Administrator');

  useEffect(() => {
    // If a role is passed in the URL (e.g. after being logged out), set it.
    if (lastRole && ROLES.includes(lastRole)) {
      setSelectedRole(lastRole);
    }
  }, [lastRole]);

  const getDashboardLink = () => {
    const roleQuery = `?role=${encodeURIComponent(selectedRole)}`;
    if (selectedRole === 'Administrator' || selectedRole === 'Super Admin') {
      return `/super-admin/dashboard${roleQuery}`;
    }
    return `/dashboard${roleQuery}`;
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">
              Domain Manager
            </CardTitle>
            <CardDescription>
              Sistem Pengelolaan Domain Pemerintah Daerah
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
