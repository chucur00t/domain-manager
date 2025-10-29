
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeSettings } from '@/components/settings/theme-settings';
import { Separator } from '@/components/ui/separator';
import { ColorSettings } from '@/components/settings/color-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User } from '@/backend/models/types';


function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') as User['role'];
  const roleQuery = `?role=${role || ''}`;

  React.useEffect(() => {
    // Redirect Super Admin to their specific settings page
    if (role === 'Super Admin') {
      router.replace(`/super-admin/settings${roleQuery}`);
    }
  }, [role, router, roleQuery]);
  
  // Render a loader while the potential redirect is being processed
  if (role === 'Super Admin') {
    return <div className='flex justify-center items-center h-full'><Loader2 className='h-8 w-8 animate-spin' /></div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-semibold">Pengaturan</h1>
      
      <Tabs defaultValue="appearance">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="account">Akun</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
           <Card>
            <CardHeader>
              <CardTitle>Tampilan</CardTitle>
              <CardDescription>
                Sesuaikan mode dan warna tampilan aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThemeSettings />
              <Separator />
              <ColorSettings />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="account">
            <Card>
                <CardHeader>
                    <CardTitle>Akun</CardTitle>
                    <CardDescription>
                        Kelola informasi profil personal Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <p className='text-sm text-muted-foreground'>
                        Ubah nama, avatar, dan preferensi kontak Anda di halaman profil.
                    </p>
                    <Link href={`/profile${roleQuery}`}>
                        <Button>Buka Halaman Profil</Button>
                    </Link>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className='flex justify-center items-center h-full'><Loader2 className='h-8 w-8 animate-spin' /></div>}>
            <SettingsContent />
        </Suspense>
    )
}
