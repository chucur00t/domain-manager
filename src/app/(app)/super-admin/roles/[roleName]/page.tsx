
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { notFound, useRouter } from 'next/navigation';
import { BackButton } from '@/components/shared/back-button';
import { MOCK_ROLES } from '@/backend/utils/mock-data';
import type { UserRole, RolePermissions } from '@/backend/models/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const roleConfig: Partial<Record<UserRole, { className: string; description: string; }>> = {
    'Super Admin': { className: 'bg-sky-500 hover:bg-sky-600', description: 'Memiliki akses penuh ke seluruh sistem tanpa batasan.' },
    'Admin Daerah': { className: 'bg-rose-500 hover:bg-rose-600', description: 'Mengelola domain dan hosting untuk daerah.' },
};

const PERMISSION_MODULES = [
    'Manajemen Domain',
    'Manajemen Hosting',
    'Manajemen Pengguna',
    'Manajemen Role',
    'Audit Trail',
    'Pengaturan Sistem',
]

function PermissionRow({ module, permissions, onPermissionChange }: { module: string, permissions: RolePermissions[string], onPermissionChange: (module: string, permission: 'c' | 'r' | 'u' | 'd', value: boolean) => void }) {
    return (
        <TableRow>
            <TableCell className="font-medium">{module}</TableCell>
            <TableCell className="text-center">
                <Checkbox checked={permissions.c} onCheckedChange={(checked) => onPermissionChange(module, 'c', !!checked)} />
            </TableCell>
            <TableCell className="text-center">
                 <Checkbox checked={permissions.r} onCheckedChange={(checked) => onPermissionChange(module, 'r', !!checked)} />
            </TableCell>
            <TableCell className="text-center">
                 <Checkbox checked={permissions.u} onCheckedChange={(checked) => onPermissionChange(module, 'u', !!checked)} />
            </TableCell>
            <TableCell className="text-center">
                 <Checkbox checked={permissions.d} onCheckedChange={(checked) => onPermissionChange(module, 'd', !!checked)} />
            </TableCell>
        </TableRow>
    )
}

export default function RoleDetailPage({ params }: { params: Promise<{ roleName: string }> }) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const resolvedParams = use(params);

  const roleName = decodeURIComponent(resolvedParams.roleName) as UserRole;
  
  // In a real app, permissions would be fetched from a database.
  // We use a deep copy of mock data to simulate state changes.
  const [initialPermissions] = useState(() => {
    const mockRolesObj = MOCK_ROLES as any;
    if (!mockRolesObj[roleName]) {
      return null;
    }
    return JSON.parse(JSON.stringify(mockRolesObj[roleName]));
  });

  const [permissions, setPermissions] = useState<RolePermissions | null>(initialPermissions);

  if (!permissions) {
    notFound();
  }

  const roleStyle = roleConfig[roleName] || { className: 'bg-gray-500', description: 'Role description' };

  const handlePermissionChange = (module: string, permission: 'c' | 'r' | 'u' | 'd', value: boolean) => {
    setPermissions(prev => {
        if (!prev) return null;
        const newPermissions = { ...prev };
        if (!newPermissions[module]) {
            newPermissions[module] = { c: false, r: false, u: false, d: false };
        }
        newPermissions[module][permission] = value;
        return newPermissions;
    });
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // In a real app, this would be a server action to update a database.
    setTimeout(() => {
        // Here you would update your central permission store (e.g., Firestore)
        console.log("Saving new permissions for", roleName, permissions);
        const mockRolesObj = MOCK_ROLES as any;
        mockRolesObj[roleName] = permissions;
        toast({
            title: "Izin Diperbarui",
            description: `Izin akses untuk peran ${roleName} telah berhasil disimpan.`,
        });
        setIsSaving(false);
        router.refresh();
    }, 1000);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Manajemen Izin: 
             <Badge variant="default" className={cn('text-lg', roleStyle.className)}>
                {roleName}
            </Badge>
          </h1>
          <p className="text-muted-foreground">{roleStyle.description}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Izin Akses Modul</CardTitle>
          <CardDescription>
            Atur izin Buat (Create), Lihat (Read), Ubah (Update), dan Hapus (Delete) untuk setiap modul.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Modul</TableHead>
                  <TableHead className="text-center">Create</TableHead>
                  <TableHead className="text-center">Read</TableHead>
                  <TableHead className="text-center">Update</TableHead>
                  <TableHead className="text-center">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_MODULES.map(module => (
                    <PermissionRow 
                        key={module}
                        module={module}
                        permissions={permissions[module] || { c: false, r: false, u: false, d: false }}
                        onPermissionChange={handlePermissionChange}
                    />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
