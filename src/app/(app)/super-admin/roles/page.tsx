
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, UserCog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function RoleManagementContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');

    useEffect(() => {
        // Redirect to users page after 5 seconds
        const timer = setTimeout(() => {
            router.replace(`/super-admin/users?role=${encodeURIComponent(role || 'Super Admin')}`);
        }, 5000);

        return () => clearTimeout(timer);
    }, [router, role]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manajemen Role</h1>
                <p className="text-muted-foreground">
                    Fitur ini telah dihapus
                </p>
            </div>

            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fitur Tidak Tersedia</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                    <p>
                        <strong>Fitur "Manajemen Role" telah dihapus dari sistem.</strong>
                    </p>
                    <p className="text-sm">
                        Role pengguna dikelola secara langsung melalui halaman <strong>Manajemen Pengguna</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Anda akan dialihkan ke halaman Manajemen Pengguna dalam 5 detik...
                    </p>
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5" />
                        Informasi
                    </CardTitle>
                    <CardDescription>
                        Mengapa fitur ini dihapus?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Alasan Penghapusan:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Role sudah didefinisikan secara fixed di sistem</li>
                            <li>Tidak ada kebutuhan untuk CRUD role dinamis</li>
                            <li>Assignment role dilakukan saat membuat/edit user</li>
                            <li>Simplifikasi navigasi dan mengurangi kompleksitas</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold mb-2">Role yang Tersedia:</h3>
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">1. Super Admin</span>
                                <span className="text-muted-foreground">- Akses penuh sistem</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">2. Admin Daerah</span>
                                <span className="text-muted-foreground">- Mengelola domain & hosting OPD</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function RoleManagementPage() {
    return (
        <RoleManagementContent />
    );
}
