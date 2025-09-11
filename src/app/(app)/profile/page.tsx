
'use client';

import { useState, useTransition, Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MOCK_USERS } from '@/lib/mock-data';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import React from 'react';

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as User['role'] | null;
  
  // In a real app, you would fetch the current user's data from your auth provider
  const currentUser = MOCK_USERS.find(user => user.role === role);

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  
  // State for editable fields
  const [name, setName] = useState(currentUser?.name || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');

  React.useEffect(() => {
    // Update state if currentUser changes (e.g., role changes)
    setName(currentUser?.name || '');
    setWhatsapp(currentUser?.whatsapp || '');
  }, [currentUser]);


  if (!currentUser) {
    // Gracefully handle case where user for the role isn't found
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profil Tidak Ditemukan</CardTitle>
                <CardDescription>Tidak dapat memuat data profil untuk peran yang dipilih.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const handleUpdateProfile = () => {
    startTransition(() => {
      // Simulate API call to update profile
      console.log("Updating profile with:", { name, whatsapp });
      // In a real app, you would update the MOCK_USERS or refetch data
      const userInMock = MOCK_USERS.find(u => u.id === currentUser.id);
      if (userInMock) {
        userInMock.name = name;
        userInMock.whatsapp = whatsapp;
      }

      toast({
        title: "Profil Diperbarui",
        description: "Informasi profil Anda telah berhasil disimpan.",
      });
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setName(currentUser.name);
    setWhatsapp(currentUser.whatsapp || '');
    setIsEditing(false);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Profil Saya</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-center gap-6">
             <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label htmlFor='avatar-upload' className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-6 w-6" />
                    <span className="sr-only">Ubah Avatar</span>
                </label>
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" />
            </div>
            <div className='text-center md:text-left'>
              <CardTitle className="text-3xl">{currentUser.name}</CardTitle>
              <CardDescription>{currentUser.role}{currentUser.opd ? ` - ${currentUser.opd}` : ''}</CardDescription>
            </div>
             <div className="md:ml-auto">
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>Ubah Profil</Button>
                ) : (
                   <div className="flex gap-2">
                       <Button variant="secondary" onClick={handleCancel} disabled={isPending}>Batal</Button>
                       <Button onClick={handleUpdateProfile} disabled={isPending}>
                         {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Simpan
                       </Button>
                   </div>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="space-y-4">
             <div>
              <h3 className="font-semibold text-lg mb-4">Informasi Akun</h3>
               <div className="grid md:grid-cols-2 gap-6">
                 <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing || isPending} />
                  </div>
                   <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="nip">NIP</Label>
                    <Input type="text" defaultValue={currentUser.nip} disabled />
                  </div>
                   <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" defaultValue={currentUser.email} disabled />
                  </div>
                   <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="whatsapp">Nomor Whatsapp</Label>
                    <Input type="text" id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={!isEditing || isPending}/>
                  </div>
                   <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="opd">Instansi</Label>
                    <Input type="text" id="opd" defaultValue={currentUser.opd || '-'} disabled />
                  </div>
               </div>
            </div>
          </div>
        </CardContent>
         <CardFooter>
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informasi!</AlertTitle>
                <AlertDescription>
                    Beberapa data seperti NIP, Email, dan Instansi disinkronkan melalui Single Sign-On (SSO) dan tidak dapat diubah di sini.
                </AlertDescription>
            </Alert>
         </CardFooter>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-96 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <ProfilePageContent />
        </Suspense>
    )
}
