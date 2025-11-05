
'use client';

import { useState, useMemo, useTransition, Suspense, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UsersTable } from '@/components/features/users/users-table';
import { AddUserForm } from '@/components/features/users/add-user-form';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import type { User } from '@/backend/models/types';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function UsersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUserRole = searchParams.get('role') as User['role'];
  
  // Redirect Super Admin to their specific user management page
  // Redirect Admin Daerah away (they don't have permission - SRS KF-013)
  useEffect(() => {
    if (currentUserRole === 'Super Admin') {
      router.replace(`/super-admin/users?role=Super+Admin`);
    } else if (currentUserRole === 'Admin Daerah') {
      // Admin Daerah TIDAK boleh mengelola pengguna (SRS KF-013)
      router.replace(`/dashboard?role=Admin+Daerah`);
    }
  }, [currentUserRole, router]);


  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const currentUser = useMemo(() => users.find(user => user.role === currentUserRole), [users, currentUserRole]);
  const USER_OPD = currentUser?.opd;
  
  const canManageUsers = useMemo(() => {
      if (!currentUserRole) return false;
      return ['Super Admin', 'Administrator'].includes(currentUserRole);
  }, [currentUserRole]);

  const allUsersInScope = useMemo(() => {
    if (currentUserRole === 'Administrator' && USER_OPD) {
      // Admin sees their own OPD users + themselves
      return users.filter(user => user.opd === USER_OPD);
    }
    // Fallback for other roles (though they are redirected or can't see this page)
    return users;
  }, [currentUserRole, USER_OPD, users]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsersInScope;
    return allUsersInScope.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.opd && user.opd.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allUsersInScope]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleUserUpdate = () => {
    startTransition(async () => {
        await fetchUsers();
    })
  }

  const getPageTitle = () => {
    switch (currentUserRole) {
      case 'Administrator':
        return `Manajemen Pengguna OPD`;
      default:
        return 'Manajemen Pengguna';
    }
  };

  const getPageDescription = () => {
     switch (currentUserRole) {
      case 'Administrator':
        return `Tambah, ubah, atau hapus pengguna untuk ${USER_OPD || 'OPD Anda'}.`;
      case 'Super Admin':
        return 'Kelola seluruh pengguna sistem di semua peran.';
      default:
        return 'Daftar pengguna terdaftar di sistem.';
    }
  }
  
  // Render a loader while redirecting
  if (currentUserRole === 'Super Admin' || currentUserRole === 'Admin Daerah') {
      return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-3 text-muted-foreground">
              {currentUserRole === 'Admin Daerah' 
                ? 'Akses ditolak. Mengarahkan ke dashboard...' 
                : 'Mengarahkan ke halaman manajemen pengguna...'}
            </p>
        </div>
      )
  }

  const pageTitle = getPageTitle();
  const pageDescription = getPageDescription();
  const allOpds = [...new Set(users.map(user => user.opd).filter(Boolean as any as (x: string | undefined) => x is string))];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>{pageDescription}</CardDescription>
          </div>
          {canManageUsers && (
            <div className="w-full sm:w-auto">
              <AddUserForm allOpds={allOpds} allUsers={users} onUserAdded={handleUserUpdate} />
            </div>
          )}
        </div>
         <div className="relative w-full sm:max-w-xs pt-4">
            <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari pengguna..."
              className="w-full rounded-lg bg-background pl-8"
              onChange={handleSearchChange}
              value={searchTerm}
            />
          </div>
      </CardHeader>
      <CardContent>
         {isLoading || isPending ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
         ) : (
           <UsersTable users={filteredUsers} onUserAction={handleUserUpdate} />
         )}
      </CardContent>
    </Card>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    }>
        <UsersPageContent />
    </Suspense>
  )
}
