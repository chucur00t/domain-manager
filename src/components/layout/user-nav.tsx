
'use client';

import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { MOCK_USERS } from '@/lib/mock-data';
import { useSearchParams, useRouter } from 'next/navigation';
import React from 'react';
import type { User } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { userLogout } from '@/lib/actions/users';


function UserNavContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const role = (searchParams.get('role') || 'Administrator') as User['role'];
    const roleQuery = `?role=${encodeURIComponent(role)}`;

    const currentUser = MOCK_USERS.find(user => user.role === role);

    const handleLogout = async () => {
        await userLogout(role);
        router.push('/');
    };

    if (!currentUser) {
        return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {currentUser.email}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <Link href={`/profile${roleQuery}`}>
                <DropdownMenuItem>
                Profil
                </DropdownMenuItem>
            </Link>
            <Link href={`/settings${roleQuery}`}>
                <DropdownMenuItem>
                Pengaturan
                </DropdownMenuItem>
            </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                Keluar
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
}


export function UserNav() {
  return (
    <React.Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
      <UserNavContent />
    </React.Suspense>
  )
}
