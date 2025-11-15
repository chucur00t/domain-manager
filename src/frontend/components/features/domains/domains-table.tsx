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
    className: "bg-green-500 hover:bg-green-600 text-secondary-foreground",
  },
  Suspended: {
    text: "Ditangguhkan",
    variant: "outline",
    className: "bg-gray-100 hover:bg-gray-200",
  },
  Deactivated: {
    text: "Tidak Aktif",
    variant: "destructive",
  inactive: {
    text: "Tidak Aktif",
    variant: "outline",
    className: "bg-gray-100 hover:bg-gray-200",
  },
  expired: {
    text: "Kadaluarsa",
    variant: "destructive",
    className: "bg-red-500 hover:bg-red-600",
  },
  // Database might use different case
  Active: {
    text: "Aktif",
    variant: "secondary",
    className: "bg-green-500 hover:bg-green-600 text-secondary-foreground",
  },
  Inactive: {
    text: "Tidak Aktif",
    variant: "outline",
    className: "bg-gray-100 hover:bg-gray-200",
  },
  Expired: {
    text: "Kadaluarsa",
    variant: "destructive",
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

function DomainsTableContent({ domains, currentUser }: DomainsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"];
  const [currentPage, setCurrentPage] = useState(0);

  const roleQuery = `?role=${currentUserRole || ""}`;

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
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDomains.length > 0 ? (
                currentDomains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      {domain.domain_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusConfig(domain.status).variant}
                        className={cn(getStatusConfig(domain.status).className)}
                      >
                        {getStatusConfig(domain.status).text}
                      </Badge>
                    </TableCell>
                    <TableCell>{domain.activated_at}</TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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
