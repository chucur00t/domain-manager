
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MOCK_ROLES } from '@/lib/mock-data';
import type { UserRole } from '@/lib/types';
import { ArrowRight, UserCog, Shield, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const roleConfig = {
    'Super Admin': { icon: UserCog, description: 'Akses penuh ke seluruh fitur dan konfigurasi sistem.', className: 'text-sky-500' },
    'Administrator': { icon: Shield, description: 'Mengelola pengguna, domain, dan permohonan.', className: 'text-rose-500' },
    'Operator': { icon: Users, description: 'Mengajukan permohonan domain dan hosting.', className: 'text-primary' },
    'Auditor': { icon: Eye, description: 'Memantau log aktivitas dan data untuk pengawasan.', className: 'text-amber-500' },
};

function RoleManagementContent() {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const roleQuery = role ? `?role=${role}` : '';
    
    return (
        <div className="space-y-6">
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Role & Permission</h1>
            <p className="text-muted-foreground">
                Tinjau dan kelola hak akses untuk setiap peran dalam sistem.
            </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {(Object.keys(MOCK_ROLES) as UserRole[]).map((roleName) => {
                    const config = roleConfig[roleName];
                    const Icon = config.icon;
                    return (
                        <Card key={roleName}>
                            <CardHeader>
                            <CardTitle className={cn("flex items-center gap-3", config.className)}>
                                <Icon className="h-6 w-6" />
                                <span>{roleName}</span>
                            </CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <Link href={`/super-admin/roles/${encodeURIComponent(roleName)}${roleQuery}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                    Lihat Detail Izin
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}


export default function RoleManagementPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RoleManagementContent />
        </Suspense>
    )
}
