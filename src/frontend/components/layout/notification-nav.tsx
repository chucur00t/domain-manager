"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Button } from "../ui/button";
import { Bell, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { CardDescription } from "../ui/card";
import { useSearchParams } from "next/navigation";
import React, { useMemo, useEffect, useState } from "react";
import type {
  User,
  SubdomainApplication,
  HostingApplication,
} from "@/backend/models/types";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

// Helper function to calculate countdown days for domains
const calculateCountdown = (activatedAt: string): { days: number; isExpired: boolean } => {
  const activation = new Date(activatedAt);
  const now = new Date();
  const year = activation.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;

  const expiryDate = new Date(activation);
  expiryDate.setDate(expiryDate.getDate() + daysInYear);

  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: diffDays > 0 ? diffDays : 0,
    isExpired: diffDays <= 0,
  };
};

function NotificationNavContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as User["role"];
  const roleQuery = `?role=${encodeURIComponent(role || "")}`;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdownInfo, setCountdownInfo] = useState<{ nearestExpiry: number | null; totalActive: number }>({ nearestExpiry: null, totalActive: 0 });

  useEffect(() => {
    if (!role) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Fetch data from API routes instead of direct backend services
        const [usersRes, domainAppsRes, hostingAppsRes, domainsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/applications"),
          fetch("/api/hosting-applications"),
          fetch("/api/domains"),
        ]);

        if (!usersRes.ok || !domainAppsRes.ok || !hostingAppsRes.ok || !domainsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const users: User[] = await usersRes.json();
        const domainApps: SubdomainApplication[] = await domainAppsRes.json();
        const hostingApps: HostingApplication[] = await hostingAppsRes.json();
        const domains = await domainsRes.json();

        const currentUser = users.find((user) => user.role === role);
        let allNotifications: NotificationItem[] = [];

        // Calculate countdown for Admin Daerah
        if (role === "Admin Daerah" && currentUser?.opd) {
          const userOpd = currentUser.opd;
          const activeDomains = domains.filter(
            (d: any) => d.opd === userOpd && d.status === "Active" && d.activated_at
          );
          
          if (activeDomains.length > 0) {
            const countdowns = activeDomains.map((d: any) => calculateCountdown(d.activated_at));
            const nearestExpiry = Math.min(...countdowns.map(c => c.days).filter(d => d > 0));
            setCountdownInfo({ nearestExpiry: nearestExpiry !== Infinity ? nearestExpiry : null, totalActive: activeDomains.length });
          }
        }

        if (role === "Super Admin") {
          const domainNotifications = domainApps
            .filter((app) => app.status === "Pending")
            .map((app) => ({
              id: `d-${app.id}`,
              title: `Domain Baru: ${app.domainName}`,
              description: `Dari: ${app.opd}`,
              href: `/applications/${app.id}${roleQuery}`,
            }));
          const hostingNotifications = hostingApps
            .filter((app) => app.status === "Deactivated")
            .map((app) => ({
              id: `h-${app.id}`,
              title: `Hosting Baru: ${app.applicationName}`,
              description: `Dari: ${app.opd}`,
              href: `/hosting/${app.id}${roleQuery}`,
            }));
          allNotifications = [...domainNotifications, ...hostingNotifications];
        } else if (role === "Admin Daerah") {
          const domainNotifications = domainApps
            .filter((app) => app.status === "Pending")
            .map((app) => ({
              id: `d-${app.id}`,
              title: `Persetujuan Domain: ${app.domainName}`,
              description: `Dari: ${app.opd}`,
              href: `/applications/${app.id}${roleQuery}`,
            }));
          const hostingNotifications = hostingApps
            .filter((app) => app.status === "Deactivated")
            .map((app) => ({
              id: `h-${app.id}`,
              title: `Persetujuan Hosting: ${app.applicationName}`,
              description: `Dari: ${app.opd}`,
              href: `/hosting/${app.id}${roleQuery}`,
            }));
          allNotifications = [...domainNotifications, ...hostingNotifications];
        } else if (role === "Operator" && currentUser?.opd) {
          const userOpd = currentUser.opd;
          const domainNotifications = domainApps
            .filter(
              (app) =>
                app.opd === userOpd &&
                (app.status === "Approved" || app.status === "Rejected")
            )
            .map((app) => ({
              id: `d-status-${app.id}`,
              title: `Update Domain: ${app.domainName}`,
              description: `Status permohonan Anda kini: ${
                app.status === "Approved" ? "Disetujui" : "Ditolak"
              }.`,
              href: `/applications/${app.id}${roleQuery}`,
            }));
          const hostingNotifications = hostingApps
            .filter(
              (app) =>
                app.opd === userOpd &&
                (app.status === "Active" || app.status === "Expired")
            )
            .map((app) => ({
              id: `h-status-${app.id}`,
              title: `Update Hosting: ${app.applicationName}`,
              description: `Status permohonan Anda kini: ${
                app.status === "Active" ? "Diaktifkan" : "Kedaluwarsa"
              }.`,
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
  const showCountdown = role === "Admin Daerah" && countdownInfo.nearestExpiry !== null;

  const getSeeAllLink = () => {
    if (role === "Super Admin") {
      return `/applications?role=${role || ""}&status=pending_review`;
    }
    if (role === "Admin Daerah") {
      return `/domains?role=${role || ""}`;
    }
    return "#";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Bell className="h-5 w-5" />
              {(notificationCount > 0 || showCountdown) && (
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
            {notificationCount > 0 && (
              <Badge variant="destructive">{notificationCount} Baru</Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Domain Countdown for Admin Daerah */}
        {showCountdown && (
          <>
            <div className="px-2 py-3 bg-muted/50 rounded-md mx-2 my-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">Countdown Domain</p>
                <Badge variant={
                  countdownInfo.nearestExpiry! <= 30 ? "destructive" : 
                  countdownInfo.nearestExpiry! <= 90 ? "default" : 
                  "secondary"
                }>
                  {countdownInfo.nearestExpiry} Hari
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Domain terdekat akan expired dalam {countdownInfo.nearestExpiry} hari. 
                Total {countdownInfo.totalActive} domain aktif.
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuGroup>
          {notificationCount > 0 ? (
            notifications.map((item) => (
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
              <p className="text-sm text-muted-foreground">
                Tidak ada notifikasi baru.
              </p>
            </div>
          )}
        </DropdownMenuGroup>
        {(notificationCount > 0 || showCountdown) && (
          <>
            <DropdownMenuSeparator />
            <Link href={getSeeAllLink()}>
              <DropdownMenuItem className="justify-center text-sm text-primary hover:text-primary">
                {showCountdown ? "Lihat Domain" : "Lihat semua"}
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
    <React.Suspense
      fallback={
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
          disabled
        >
          <Bell className="h-5 w-5" />
        </Button>
      }
    >
      <NotificationNavContent />
    </React.Suspense>
  );
}
