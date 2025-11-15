
'use client';

import type { ReactNode } from "react";
import { Separator } from "@/frontend/components/ui/separator";
import {
  Sidebar,
  SidebarBody,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/frontend/components/ui/sidebar";
import { Logo } from "@/frontend/components/logo";
import { MainNav } from "@/frontend/components/layout/main-nav";
import { UserNav } from "@/frontend/components/layout/user-nav";
import { ColorThemeNav } from "@/frontend/components/layout/color-theme-nav";
import { NotificationNav } from "@/frontend/components/layout/notification-nav";
// import { LoginLogger } from "@/frontend/components/login-logger"; // DISABLED: Causes backend services to bundle in frontend
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/frontend/components/ui/skeleton";


function AppLayoutContent({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const roleQuery = `?role=${encodeURIComponent(role || '')}`;

    return (
        <SidebarProvider>
        <Sidebar>
            <SidebarHeader className="border-b">
                <div className="flex items-center gap-3 w-full">
                    <Logo />
                    <div className="flex flex-col">
                        <h2 className="font-bold text-base leading-none tracking-tight">
                        Domain Manager
                        </h2>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarBody>
                <SidebarContent>
                    <MainNav />
                </SidebarContent>
            </SidebarBody>
        </Sidebar>
        <SidebarInset>
             <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="ml-auto flex items-center gap-2">
                    <ColorThemeNav />
                    <NotificationNav />
                    <UserNav />
                </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-4">
                {children}
            </main>
             <footer className="py-4 px-6 text-sm text-muted-foreground mt-auto">
                <Separator className="mb-4" />
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <span>
                Hak Cipta © {new Date().getFullYear()} Diskominfo Kalbar
                </span>
                 <nav className="flex items-center gap-4">
                    <Link href={`/terms-and-conditions${roleQuery}`} className="hover:text-primary transition-colors">
                        Syarat & Ketentuan
                    </Link>
                    <Link href={`/privacy-policy${roleQuery}`} className="hover:text-primary transition-colors">
                        Kebijakan Privasi
                    </Link>
                </nav>
                </div>
            </footer>
        </SidebarInset>
        {/* <LoginLogger /> */}
    </SidebarProvider>
    )
}

function AppLayoutSkeleton() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-1">
                <div className="hidden md:flex flex-col w-64 border-r bg-background">
                    <div className="p-4">
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
                <div className="flex-1 flex flex-col">
                    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                        <Skeleton className="h-8 w-8 rounded-full md:hidden" />
                        <div className="ml-auto flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                             <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </header>
                    <main className="flex-1 p-4 sm:px-6">
                        <Skeleton className="h-96 w-full" />
                    </main>
                </div>
            </div>
        </div>
    )
}


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <React.Suspense fallback={<AppLayoutSkeleton />}>
        <AppLayoutContent>{children}</AppLayoutContent>
    </React.Suspense>
  );
}
