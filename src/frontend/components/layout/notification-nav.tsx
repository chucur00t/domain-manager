
'use client';

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
import { Button } from '../ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { CardDescription } from '../ui/card';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
import type { User, SubdomainApplication, HostingApplication } from '@/backend/models/types';
import { getUsers, getApplications, getHostingApplications } from '@/backend/services';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

function NotificationNavContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as User['role'];
  const roleQuery = `?role=${encodeURIComponent(role || '')}`;
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!role) {
      setIsLoading(false);
      return;
    };

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const [users, domainApps, hostingApps] = await Promise.all([
          getUsers(),
          getApplications(),
          getHostingApplications()
        ]);
        
        const currentUser = users.find(user => user.role === role);
        let allNotifications: NotificationItem[] = [];

        if (role === 'Super Admin') {
          const domainNotifications = domainApps.filter(app => app.status === 'pending_review').map(app => ({
            id: `d-${app.id}`,
            title: `Domain Baru: ${app.domainName}`,
            description: `Dari: ${app.opd}`,
            href: `/applications/${app.id}${roleQuery}`,
          }));
          const hostingNotifications = hostingApps.filter(app => app.status === 'pending_review').map(app => ({
            id: `h-${app.id}`,
            title: `Hosting Baru: ${app.applicationName}`,
            description: `Dari: ${app.opd}`,
            href: `/hosting/${app.id}${roleQuery}`,
          }));
          allNotifications = [...domainNotifications, ...hostingNotifications];
        } else if (role === 'Admin Daerah') {
          const domainNotifications = domainApps.filter(app => app.status === 'pending_approval').map(app => ({
            id: `d-${app.id}`,
            title: `Persetujuan Domain: ${app.domainName}`,
            description: `Dari: ${app.opd}`,
            href: `/applications/${app.id}${roleQuery}`,
          }));
          const hostingNotifications = hostingApps.filter(app => app.status === 'pending_approval').map(app => ({
            id: `h-${app.id}`,
            title: `Persetujuan Hosting: ${app.applicationName}`,
            description: `Dari: ${app.opd}`,
            href: `/hosting/${app.id}${roleQuery}`,
          }));
          allNotifications = [...domainNotifications, ...hostingNotifications];
        } else if (role === 'Operator' && currentUser?.opd) {
          const userOpd = currentUser.opd;
          const domainNotifications = domainApps
            .filter(app => app.opd === userOpd && (app.status === 'approved' || app.status === 'rejected'))
            .map(app => ({
                id: `d-status-${app.id}`,
                title: `Update Domain: ${app.domainName}`,
                description: `Status permohonan Anda kini: ${app.status === 'approved' ? 'Disetujui' : 'Ditolak'}.`,
                href: `/applications/${app.id}${roleQuery}`,
            }));
          const hostingNotifications = hostingApps
            .filter(app => app.opd === userOpd && (app.status === 'approved' || app.status === 'rejected'))
            .map(app => ({
                id: `h-status-${app.id}`,
                title: `Update Hosting: ${app.applicationName}`,
                description: `Status permohonan Anda kini: ${app.status === 'approved' ? 'Disetujui' : 'Ditolak'}.`,
                href: `/hosting/${app.id}${roleQuery}`,
            }));
          allNotifications = [...domainNotifications, ...hostingNotifications];
        }
        setNotifications(allNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [role, roleQuery]);


  const notificationCount = notifications.length;

  const getSeeAllLink = () => {
    if (role === 'Super Admin') {
        return `/applications?role=${role || ''}&status=pending_review`;
    }
    if (role === 'Admin Daerah') {
        return `/applications?role=${role || ''}&status=pending_approval`;
    }
    return '#';
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
              )}
            </>
          )}
          <span className="sr-only">Buka notifikasi</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium leading-none">Notifikasi</p>
             {notificationCount > 0 && <Badge variant="destructive">{notificationCount} Baru</Badge>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notificationCount > 0 ? (
            notifications.map(item => (
              <Link href={item.href} key={item.id}>
                <DropdownMenuItem className="flex flex-col items-start gap-1 whitespace-normal">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <CardDescription className="text-xs">
                        {item.description}
                    </CardDescription>
                </DropdownMenuItem>
              </Link>
            ))
          ) : (
             <div className="flex flex-col items-center justify-center p-4 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Tidak ada notifikasi baru.</p>
            </div>
          )}
        </DropdownMenuGroup>
        {notificationCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <Link href={getSeeAllLink()}>
                <DropdownMenuItem className='justify-center text-sm text-primary hover:text-primary'>
                  Lihat semua
                </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function NotificationNav() {
    return (
      <React.Suspense fallback={<Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled><Bell className="h-5 w-5" /></Button>}>
          <NotificationNavContent />
      </React.Suspense>
    );
}
