'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Globe,
  Users,
  ShieldAlert,
  Server,
  Settings,
  UserCog,
  FolderKanban,
  ClipboardCheck,
  Bell,
  FileBarChart,
  Building,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/frontend/utils/utils';
import React from 'react';
import type { User } from '@/backend/models/types';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';


type NavItem = {
  href: (role: string) => string;
  label: string;
  icon: React.ElementType;
  roles: User['role'][];
  exact?: boolean;
  subItems?: NavItem[];
};

export const navItems: NavItem[] = [
  {
    href: (role) => {
      const roleQuery = `?role=${encodeURIComponent(role)}`;
      if (role === 'Super Admin') {
          return `/super-admin/dashboard${roleQuery}`;
      }
      return `/dashboard${roleQuery}`;
    },
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['Super Admin', 'Admin Daerah'],
    exact: true,
  },
  // ADMIN DAERAH: Menu Pengajuan (untuk mengajukan permohonan)
  { 
    href: (role) => '#',
    label: 'Pengajuan',  // Untuk Admin Daerah: MENGAJUKAN permohonan
    icon: FolderKanban, 
    roles: ['Admin Daerah'],
    subItems: [
        { href: (role) => `/applications?role=${encodeURIComponent(role)}`, label: 'Ajukan Domain', icon: FileText, roles: ['Admin Daerah'] },
        { href: (role) => `/hosting?role=${encodeURIComponent(role)}`, label: 'Ajukan Hosting', icon: Server, roles: ['Admin Daerah'] },
        { href: (role) => `/applications?role=${encodeURIComponent(role)}`, label: 'Status Pengajuan', icon: ClipboardList, roles: ['Admin Daerah'] },
    ]
  },
  // SUPER ADMIN: Menu Persetujuan (untuk menyetujui permohonan)
  { 
    href: (role) => '#',
    label: 'Persetujuan',  // Untuk Super Admin: MENYETUJUI permohonan
    icon: ClipboardCheck, 
    roles: ['Super Admin'],
    subItems: [
        { href: (role) => `/super-admin/applications?role=${encodeURIComponent(role)}`, label: 'Permohonan Domain', icon: FileText, roles: ['Super Admin'] },
        { href: (role) => `/super-admin/hosting-applications?role=${encodeURIComponent(role)}`, label: 'Permohonan Hosting', icon: Server, roles: ['Super Admin'] },
    ]
  },
  // Menu Administrasi untuk Super Admin (TANPA Pendaftaran Subdomain/Hosting)
  { 
    href: (role) => '#',
    label: 'Administrasi', 
    icon: UserCog, 
    roles: ['Super Admin'],
    subItems: [
        { href: (role) => `/super-admin/users?role=${encodeURIComponent(role)}`, label: 'Manajemen Pengguna', icon: Users, roles: ['Super Admin'], exact: true },
        { href: (role) => `/super-admin/roles?role=${encodeURIComponent(role)}`, label: 'Manajemen Role', icon: ShieldAlert, roles: ['Super Admin'], exact: true },
        { href: (role) => `/super-admin/opds?role=${encodeURIComponent(role)}`, label: 'Manajemen OPD', icon: Building, roles: ['Super Admin'], exact: true },
    ]
  },
  // Admin Daerah: Domain Saya (hanya domain OPD mereka)
  { href: (role) => `/domains?role=${encodeURIComponent(role)}`, label: 'Domain Saya', icon: Globe, roles: ['Admin Daerah'] },
  // Super Admin: Manajemen Domain (semua domain)
  { href: (role) => `/super-admin/domains?role=${encodeURIComponent(role)}`, label: 'Manajemen Domain', icon: Globe, roles: ['Super Admin'] },
  // Admin Daerah: Hosting Saya
  { href: (role) => `/hosting?role=${encodeURIComponent(role)}`, label: 'Hosting Saya', icon: Server, roles: ['Admin Daerah'] },
  // Admin Daerah: Notifikasi
  { href: (role) => `/notifications?role=${encodeURIComponent(role)}`, label: 'Notifikasi', icon: Bell, roles: ['Admin Daerah'] },
  // Super Admin: Laporan
  { href: (role) => `/super-admin/reports?role=${encodeURIComponent(role)}`, label: 'Laporan', icon: FileBarChart, roles: ['Super Admin'] },
  // Super Admin: Audit Trail
  { href: (role) => `/super-admin/audit-trail?role=${encodeURIComponent(role)}`, label: 'Audit Trail', icon: ShieldAlert, roles: ['Super Admin'] },
  // Pengaturan untuk kedua role
  { href: (role) => `/settings?role=${encodeURIComponent(role)}`, label: 'Pengaturan', icon: Settings, roles: ['Super Admin', 'Admin Daerah'] },
];

function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') as User['role']) || 'Admin Daerah';

  const getFilteredNavItems = (items: NavItem[]) => items.filter(item => item.roles.includes(role));

  const isLinkActive = (href: string, exact?: boolean) => {
    const cleanPath = href.split('?')[0];
    if (exact) {
        return pathname === cleanPath;
    }
    // Make sure /users does not match /super-admin/users
    if (cleanPath === '/users' && pathname.startsWith('/super-admin/users')) {
      return false;
    }
    // Make sure /settings does not match /super-admin/settings
    if (cleanPath === '/settings' && pathname.startsWith('/super-admin/settings')) {
      return false;
    }
     // Make sure /domains does not match /domains/[id]
    if(cleanPath === '/domains' && pathname.match(/\/domains\/.+/)) {
        return false;
    }
    return pathname.startsWith(cleanPath) && cleanPath !== '/';
  }
  
  return (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
      {getFilteredNavItems(navItems).map(({ href, label, icon: Icon, exact, subItems }) => {
        if (subItems && subItems.length > 0) {
            const filteredSubItems = getFilteredNavItems(subItems);
            if (filteredSubItems.length === 0) return null;

            const isAnySubItemActive = filteredSubItems.some(sub => isLinkActive(sub.href(role), sub.exact));
            
            return (
                <Collapsible key={label} defaultOpen={isAnySubItemActive}>
                    <CollapsibleTrigger className="w-full">
                         <div className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                            isAnySubItemActive && 'text-primary'
                         )}>
                            <Icon className="h-4 w-4" />
                            {label}
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-7 pt-1 space-y-1">
                        {filteredSubItems.map(sub => {
                             const linkHref = sub.href(role);
                             const isActive = isLinkActive(linkHref, sub.exact);
                             return (
                                <Link
                                    key={sub.label}
                                    href={linkHref}
                                    className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs',
                                    isActive && 'bg-muted text-primary'
                                    )}
                                >
                                    {sub.label}
                                </Link>
                             )
                        })}
                    </CollapsibleContent>
                </Collapsible>
            )
        }
        
        const linkHref = href(role);
        const isActive = isLinkActive(linkHref, exact);
        
        return (
          <Link
            key={label}
            href={linkHref}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive && 'bg-muted text-primary'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MainNav() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <NavLinks />
        </React.Suspense>
    )
}
