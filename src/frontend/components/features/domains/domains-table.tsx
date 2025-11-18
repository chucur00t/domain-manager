"use client";

import type { Domain, User } from "@/backend/models/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { DomainActions } from "./domain-actions";
import { useState, Suspense, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { activateDomain, deactivateDomain } from "@/backend/actions/domains";
import { useToast } from "@/hooks/use-toast";
import { buttonVariants } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/utils";

type DomainsTableProps = {
  domains: Domain[];
  currentUser: User | null;
};

import { DomainStatus } from "@/backend/models/types";

const statusConfig: Record<
  DomainStatus,
  {
    text: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  Active: {
    text: "Aktif",
    variant: "secondary",
    className: "inline-flex items-center justify-center min-w-[110px] bg-green-500 hover:bg-green-600 text-white border-transparent",
  },
  Suspended: {
    text: "Disuspensi",
    variant: "secondary",
    className: "inline-flex items-center justify-center min-w-[110px] bg-yellow-500 hover:bg-yellow-600 text-white border-transparent",
  },
  Deactivated: {
    text: "Tidak Aktif",
    variant: "secondary",
    className: "inline-flex items-center justify-center min-w-[110px] bg-black hover:bg-gray-900 text-white border-transparent",
  },
  Expired: {
    text: "Kedaluwarsa",
    variant: "outline",
    className: "inline-flex items-center justify-center min-w-[110px] bg-orange-500 hover:bg-orange-600 text-white border-transparent",
  },
};

// Old status config kept for compatibility - not used
const statusConfigOldUnused = {
  Active: {
    text: "Aktif",
    variant: "secondary" as const,
    className: "bg-green-500 hover:bg-green-600 text-secondary-foreground",
  },
  Suspended: {
    text: "Ditangguhkan",
    variant: "outline" as const,
    className: "bg-gray-100 hover:bg-gray-200",
  },
  Deactivated: {
    text: "Tidak Aktif",
    variant: "destructive" as const,
    className: "bg-red-500 hover:bg-red-600",
  },
};

// Helper function to get status config safely
const getStatusConfig = (status: string) => {
  return (
    statusConfig[status as keyof typeof statusConfig] || {
      text: status || "Unknown",
      variant: "default" as const,
      className: "bg-gray-500 hover:bg-gray-600",
    }
  );
};

const ITEMS_PER_PAGE = 10;

// Helper function to calculate countdown days for domains
const calculateCountdown = (expiresAt: string): { days: number; isExpired: boolean } => {
  const expiryDate = new Date(expiresAt);
  const now = new Date();

  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: diffDays > 0 ? diffDays : 0,
    isExpired: diffDays <= 0,
  };
};

function DomainsTableContent({ domains, currentUser }: DomainsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"];
  const [currentPage, setCurrentPage] = useState(0);

  const roleQuery = `?role=${currentUserRole || ""}`;
  const isAdminDaerah = currentUserRole === "Admin Daerah";

  useEffect(() => {
    setCurrentPage(0);
  }, [domains]);

  const totalPages = Math.ceil(domains.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDomains = domains.slice(startIndex, endIndex);

  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Dibuat</TableHead>
                {isAdminDaerah && <TableHead>Masa Berlaku</TableHead>}
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDomains.length > 0 ? (
                currentDomains.map((domain) => {
                  // Handle both new (hostname/activationDate) and old (domain_name/activated_at) formats
                  const domainName = domain.domain_name || domain.hostname || '-';
                  const activatedDate = domain.activated_at || domain.activationDate || null;
                  const expiresDate = domain.expires_at || domain.expiryDate || null;
                  
                  const countdown = domain.status === "Active" && expiresDate
                    ? calculateCountdown(expiresDate)
                    : null;
                  
                  return (
                    <TableRow key={domain.id}>
                      <TableCell className="font-medium">
                        {domainName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusConfig(domain.status).variant}
                          className={cn(getStatusConfig(domain.status).className)}
                        >
                          {getStatusConfig(domain.status).text}
                        </Badge>
                      </TableCell>
                      <TableCell>{activatedDate || '-'}</TableCell>
                      {isAdminDaerah && (
                        <TableCell>
                          {countdown ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-semibold",
                                  countdown.days <= 30
                                    ? "text-red-600"
                                    : countdown.days <= 90
                                    ? "text-amber-600"
                                    : "text-green-600"
                                )}
                              >
                                {countdown.isExpired ? "Expired" : `${countdown.days} hari`}
                              </span>
                              {countdown.days <= 30 && !countdown.isExpired && (
                                <Badge variant="destructive" className="text-xs">
                                  Segera Expired
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center justify-between gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/domains/${domain.id}${roleQuery}`}>
                                <Button variant="outline" size="icon">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Lihat Detail</span>
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lihat Detail</p>
                            </TooltipContent>
                          </Tooltip>

                          <DomainActions
                            domain={domain}
                            currentUser={currentUser}
                            onAction={() => router.refresh()}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdminDaerah ? 5 : 4} className="h-24 text-center">
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={currentPage >= totalPages - 1}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export function DomainsTable({ domains, currentUser }: DomainsTableProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <DomainsTableContent domains={domains} currentUser={currentUser} />
    </Suspense>
  );
}
