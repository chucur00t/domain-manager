
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
  PenSquare,
  Settings,
  UserCog,
  FolderKanban,
} from 'lucide-react';
import { cn } from '@/utils/utils';
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
  { 
    href: (role) => '#',
    label: 'Permohonan', 
    icon: FolderKanban, 
    roles: ['Admin Daerah', 'Super Admin'],
    subItems: [
        { href: (role) => `/applications?role=${encodeURIComponent(role)}`, label: 'Permohonan Domain', icon: FileText, roles: ['Admin Daerah', 'Super Admin'] },
        { href: (role) => `/hosting?role=${encodeURIComponent(role)}`, label: 'Permohonan Hosting', icon: Server, roles: ['Admin Daerah', 'Super Admin'] },
    ]
  },
   { 
    href: (role) => '#',
    label: 'Administrasi', 
    icon: UserCog, 
    roles: ['Super Admin'],
    subItems: [
        { href: (role) => `/super-admin/users?role=${encodeURIComponent(role)}`, label: 'Manajemen Pengguna', icon: Users, roles: ['Super Admin'], exact: true },
        { href: (role) => `/super-admin/roles?role=${encodeURIComponent(role)}`, label: 'Manajemen Role', icon: ShieldAlert, roles: ['Super Admin'], exact: true },
        { href: (role) => `/super-admin/subdomain-registration?role=${encodeURIComponent(role)}`, label: 'Pendaftaran Subdomain', icon: PenSquare, roles: ['Super Admin'], exact: true },
        { href: (role) => `/super-admin/hosting-registration?role=${encodeURIComponent(role)}`, label: 'Pendaftaran Hosting', icon: Server, roles: ['Super Admin'], exact: true },
    ]
  },
  { href: (role) => `/applications?role=${encodeURIComponent(role)}`, label: 'Permohonan Domain', icon: FileText, roles: ['Admin Daerah'] },
  { href: (role) => `/hosting?role=${encodeURIComponent(role)}`, label: 'Permohonan Hosting', icon: Server, roles: ['Admin Daerah'] },
  { href: (role) => `/domains?role=${encodeURIComponent(role)}`, label: 'Manajemen Domain', icon: Globe, roles: ['Admin Daerah', 'Super Admin'] },
  { href: (role) => `/users?role=${encodeURIComponent(role)}`, label: 'Manajemen Pengguna', icon: Users, roles: ['Admin Daerah'] },
  { href: (role) => `/audit-trail?role=${encodeURIComponent(role)}`, label: 'Audit Trail', icon: ShieldAlert, roles: ['Super Admin'] },
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

