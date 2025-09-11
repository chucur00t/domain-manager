
'use client';

import type { User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { EditUserForm } from './edit-user-form';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';


type UsersTableProps = {
  users: User[];
  onUserAction: () => void;
};

const ITEMS_PER_PAGE = 10;

const roleConfig = {
    'Administrator': { className: 'bg-rose-500 hover:bg-rose-600', level: 2 },
    'Super Admin': { className: 'bg-sky-500 hover:bg-sky-600', level: 3 },
    'Operator': { className: '', level: 1 }, 
    'Auditor': { className: 'bg-amber-500 hover:bg-amber-600', level: 1 },
};


function UsersTableContent({ users, onUserAction }: UsersTableProps) {
    const searchParams = useSearchParams();
    const currentUserRole = searchParams.get('role') as User['role'];
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const currentUser = useMemo(() => users.find(u => u.role === currentUserRole), [users, currentUserRole]);

    const canManageUsers = useMemo(() => {
        if (!currentUserRole) return false;
        return ['Super Admin', 'Administrator'].includes(currentUserRole);
    }, [currentUserRole]);
    
    useEffect(() => {
      setCurrentPage(0);
    }, [users]);

    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentUsers = users.slice(startIndex, endIndex);

    const allOpds = [...new Set(users.map(u => u.opd).filter(Boolean as any))];

    const getRoleBadgeVariant = (role: User['role']) => {
        switch (role) {
            case 'Administrator':
            case 'Super Admin':
                return 'destructive';
            case 'Auditor':
                return 'default';
            default:
                return 'secondary';
        }
    }
    
    const getStatusBadgeVariant = (status: User['status']) => {
        return status === 'active' ? 'secondary' : 'outline';
    }
    
    const canEditUser = (userToEdit: User) => {
        if (!canManageUsers || !currentUser) return false;
        
        if (currentUser.role === 'Super Admin') {
            // Super Admin can edit anyone but themselves
            return userToEdit.id !== currentUser.id;
        }

        if (currentUser.role === 'Administrator') {
            // Administrator can only edit Operators in their own OPD
            return userToEdit.opd === currentUser.opd && userToEdit.role === 'Operator';
        }
        return false;
    }

  return (
    <>
    <TooltipProvider>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>OPD</TableHead>
                <TableHead>Status</TableHead>
                {canManageUsers && <TableHead className="text-center">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={getRoleBadgeVariant(user.role)} 
                        className={cn(roleConfig[user.role]?.className)}
                    >
                        {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.opd || '-'}</TableCell>
                   <TableCell>
                    <Badge 
                        variant={getStatusBadgeVariant(user.status)}
                        className={cn(user.status === 'active' && 'bg-green-500 text-secondary-foreground hover:bg-green-600')}
                    >
                        {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                  </TableCell>
                  {canManageUsers && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {canEditUser(user) ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setSelectedUser(user)}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Ubah Pengguna</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>Ubah Pengguna & Status</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" disabled>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Ubah Pengguna</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                <p>Anda tidak memiliki izin mengubah pengguna ini</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={canManageUsers ? 6 : 5} className="h-24 text-center">
                        Tidak ada hasil yang ditemukan.
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 p-4 border-t">
                <span className="text-sm text-muted-foreground">
                    Halaman {currentPage + 1} dari {totalPages}
                </span>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                >
                Sebelumnya
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                >
                Berikutnya
                </Button>
            </div>
        )}
      </div>
    </TooltipProvider>
    <EditUserForm 
        user={selectedUser} 
        currentUser={currentUser || null}
        allOpds={allOpds} 
        onFormAction={() => {
            onUserAction();
            setSelectedUser(null);
        }}
        isOpen={!!selectedUser}
        onOpenChange={(open) => {
            if (!open) {
                setSelectedUser(null);
            }
        }}
    />
    </>
  );
}

export function UsersTable(props: UsersTableProps) {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    }>
        <UsersTableContent {...props} />
    </Suspense>
  )
}
