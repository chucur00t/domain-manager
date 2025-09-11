
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeSettings } from '@/components/settings/theme-settings';
import { Separator } from '@/components/ui/separator';
import { ColorSettings } from '@/components/settings/color-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { Loader2, ShieldCheck, MoreVertical, KeyRound, GitBranch } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { navItems } from '@/components/layout/main-nav';
import type { UserRole } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const allRoles: UserRole[] = ['Super Admin', 'Administrator', 'Operator', 'Auditor'];


function SettingsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const roleQuery = `?role=${role || ''}`;
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="navigation">Manajemen Menu</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
          <TabsTrigger value="integrations">Integrasi</TabsTrigger>
          <TabsTrigger value="appearance">Tampilan</TabsTrigger>
          <TabsTrigger value="account">Akun Saya</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>
                Kelola informasi dasar dan konfigurasi sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="instance-name">Nama Instansi</Label>
                <Input id="instance-name" defaultValue="Pemerintah Provinsi Kalimantan Barat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-description">Deskripsi Aplikasi</Label>
                <Textarea id="app-description" defaultValue="Sistem Pengelolaan Domain dan Hosting Terpusat" />
              </div>
               <div className="flex justify-end">
                  <Button>Simpan Perubahan</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Menu Navigasi</CardTitle>
              <CardDescription>
                Atur item menu yang dapat diakses oleh setiap peran. Perubahan akan berlaku setelah pengguna login kembali.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-1/3">Item Menu</TableHead>
                                {allRoles.map(role => (
                                    <TableHead key={role} className="text-center">{role}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {navItems.map(item => (
                                <TableRow key={item.label}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <item.icon className="h-4 w-4 text-muted-foreground" />
                                        {item.label}
                                    </TableCell>
                                    {allRoles.map(role => (
                                        <TableCell key={role} className="text-center">
                                            <Checkbox
                                                id={`${item.label}-${role}`}
                                                checked={item.roles.includes(role)}
                                                disabled
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <div className="flex justify-end mt-6">
                  <Button>Simpan Konfigurasi Menu</Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Kebijakan Keamanan</CardTitle>
                        <CardDescription>Atur kebijakan keamanan untuk akun pengguna di seluruh sistem.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label>Kebijakan Kata Sandi</Label>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="min-length" className="text-sm font-normal">Panjang Minimal</Label>
                                    <Input id="min-length" type="number" defaultValue="8" />
                                </div>
                                <div className="space-y-2 pt-6 flex flex-col gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="require-uppercase" defaultChecked />
                                        <Label htmlFor="require-uppercase" className="text-sm font-normal">Wajibkan huruf besar</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="require-number" defaultChecked />
                                        <Label htmlFor="require-number" className="text-sm font-normal">Wajibkan angka</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Checkbox id="require-symbol" />
                                        <Label htmlFor="require-symbol" className="text-sm font-normal">Wajibkan simbol</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label>Autentikasi Dua Faktor (2FA)</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                Wajibkan pengguna menggunakan metode verifikasi kedua saat login.
                                </p>
                            </div>
                            <Switch id="2fa-switch" />
                        </div>
                    </CardContent>
                     <CardFooter className="border-t px-6 py-4">
                        <Button>Simpan Kebijakan Keamanan</Button>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manajemen Akses</CardTitle>
                        <CardDescription>Kontrol akses ke aplikasi berdasarkan alamat IP dan durasi sesi.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                                <Textarea id="ip-whitelist" placeholder="Masukkan satu alamat IP per baris..." rows={4} />
                                <p className="text-xs text-muted-foreground">Hanya IP ini yang dapat mengakses. Kosongkan untuk mengizinkan semua.</p>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ip-blacklist">IP Blacklist</Label>
                                <Textarea id="ip-blacklist" placeholder="Masukkan satu alamat IP per baris..." rows={4} />
                                <p className="text-xs text-muted-foreground">IP ini akan diblokir.</p>
                            </div>
                        </div>
                         <Separator />
                        <div className="space-y-2 max-w-xs">
                            <Label htmlFor="session-timeout">Batas Waktu Sesi (menit)</Label>
                            <Input id="session-timeout" type="number" defaultValue="60" />
                            <p className="text-xs text-muted-foreground">Pengguna akan otomatis logout setelah waktu idle ini.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button>Simpan Pengaturan Akses</Button>
                    </CardFooter>
                </Card>
            </div>
        </TabsContent>
         <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen API Key</CardTitle>
                <CardDescription>
                  Kelola kunci API untuk memberikan akses terprogram ke aplikasi pihak ketiga.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dibuat pada</TableHead>
                      <TableHead><span className="sr-only">Aksi</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Sistem Pelaporan Eksternal</TableCell>
                      <TableCell className="font-mono">ext_...abcd</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-green-500 text-secondary-foreground hover:bg-green-600">Aktif</Badge></TableCell>
                      <TableCell>10 Jan 2024</TableCell>
                       <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Kelola</DropdownMenuItem>
                            <DropdownMenuItem>Cabut</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 justify-between">
                <p className="text-sm text-muted-foreground">Berhati-hatilah saat membagikan kunci API.</p>
                <Button><KeyRound className="mr-2 h-4 w-4"/> Buat API Key Baru</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sinkronisasi Sistem Eksternal</CardTitle>
                <CardDescription>
                  Aktifkan atau nonaktifkan integrasi dengan sistem pemerintah lainnya.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="sso-keycloak-switch">Single Sign-On (SSO) via Keycloak</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                        Alihkan semua login ke provider SSO eksternal.
                        </p>
                    </div>
                    <Switch id="sso-keycloak-switch" />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="satudata-switch">Satu Data Indonesia</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                        Sinkronkan data referensi OPD dan informasi terkait lainnya.
                        </p>
                    </div>
                    <Switch id="satudata-switch" />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                 <Button>Simpan Pengaturan Integrasi</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
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
                    <CardTitle>Akun Saya</CardTitle>
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
