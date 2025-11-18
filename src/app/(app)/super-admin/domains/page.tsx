"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  Globe,
  PlayCircle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import type { Domain } from "@/backend/models/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type StatusFilter = "all" | "active" | "expired";
type ActionType = "deactivate" | "reactivate" | "health-check";

function SuperAdminDomainsContent() {
  const searchParams = useSearchParams();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [opdFilter, setOpdFilter] = useState<string>("all");

  // Dialog states
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/domains");
      if (!response.ok) {
        throw new Error("Failed to fetch domains");
      }
      const data = await response.json();
      setDomains(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  // Get unique OPDs for filter
  const allOpds = useMemo(() => {
    const opds = domains
      .map((domain) => domain.opd)
      .filter((opd, index, self) => opd && self.indexOf(opd) === index);
    return opds.sort();
  }, [domains]);

  // Filtered domains
  const filteredDomains = useMemo(() => {
    return domains.filter((domain) => {
      // Status filter
      if (statusFilter === "active") {
        // Only Active status
        if (domain.status !== "Active") {
          return false;
        }
      } else if (statusFilter === "expired") {
        // Check if expired by date or status is Deactivated/Expired
        const isExpired =
          domain.status === "Deactivated" ||
          domain.status === "Expired" ||
          (domain.expiryDate && new Date(domain.expiryDate) < new Date());
        if (!isExpired) {
          return false;
        }
      }

      // OPD filter
      if (opdFilter !== "all" && domain.opd !== opdFilter) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          domain.hostname?.toLowerCase().includes(search) ||
          domain.opd?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [domains, statusFilter, opdFilter, searchTerm]);

  // Count statistics
  const stats = useMemo(() => {
    const activeDomains = domains.filter((d) => d.status === "Active");
    const expiredDomains = domains.filter(
      (d) =>
        d.status === "Deactivated" ||
        d.status === "Expired" ||
        (d.expiryDate && new Date(d.expiryDate) < new Date())
    );

    return {
      total: domains.length,
      active: activeDomains.length,
      expired: expiredDomains.length,
    };
  }, [domains]);

  const handleOpenDialog = (domain: Domain, action: ActionType) => {
    setSelectedDomain(domain);
    setActionType(action);
    setReason("");
  };

  const handleCloseDialog = () => {
    setSelectedDomain(null);
    setActionType(null);
    setReason("");
  };

  const handleSubmitAction = async () => {
    if (!selectedDomain || !actionType) return;

    // Validation for deactivate action requires reason
    if (actionType === "deactivate" && !reason.trim()) {
      alert("Alasan deaktivasi harus diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === "deactivate") {
        // Deactivate domain
        const response = await fetch(`/api/domains/${selectedDomain.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Deactivated",
            reason: reason,
            action: "deactivate",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to deactivate domain");
        }

        alert("Domain berhasil dinonaktifkan secara sepihak!");
      } else if (actionType === "reactivate") {
        // Reactivate domain - extend 1 year from today
        const today = new Date();
        const newExpiryDate = new Date(today);
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

        const response = await fetch(`/api/domains/${selectedDomain.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Active",
            expiryDate: newExpiryDate.toISOString(),
            activationDate: today.toISOString(),
            reason: reason || "Reaktivasi sepihak oleh Super Admin",
            action: "reactivate",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reactivate domain");
        }

        alert("Domain berhasil direaktivasi! Masa aktif diperpanjang 1 tahun.");
      }

      // Refresh data
      await fetchDomains();

      // Close dialog
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      alert("Gagal memproses aksi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Domain["status"]) => {
    switch (status) {
      case "Active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Aktif
          </Badge>
        );
      case "Suspended":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-500 border-orange-200"
          >
            Tidak Aktif
          </Badge>
        );
      case "Deactivated":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Kadaluarsa
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Domain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Domain Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dapat dinonaktifkan oleh Super Admin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Domain Kedaluwarsa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.expired}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dapat direaktivasi oleh Super Admin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <div>
                <CardTitle className="text-2xl">Manajemen Domain</CardTitle>
                <CardDescription>
                  Kelola domain aktif dan kedaluwarsa - Deaktivasi domain aktif
                  atau reaktivasi domain kedaluwarsa secara sepihak
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari hostname atau OPD..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Domain</SelectItem>
                  <SelectItem value="active">Domain Aktif</SelectItem>
                  <SelectItem value="expired">Domain Kedaluwarsa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={opdFilter} onValueChange={setOpdFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter OPD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua OPD</SelectItem>
                  {allOpds.map((opd) => (
                    <SelectItem key={opd || ""} value={opd || ""}>
                      {opd}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results info */}
            <div className="text-sm text-muted-foreground">
              Menampilkan {filteredDomains.length} dari {domains.length} domain
            </div>

            {/* Domains Table */}
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Hostname
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        OPD
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Tanggal Aktif
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Kadaluarsa
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDomains.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          Tidak ada domain yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredDomains.map((domain) => (
                        <tr
                          key={domain.id}
                          className="border-b hover:bg-muted/30"
                        >
                          <td className="px-4 py-3 text-sm">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              {domain.hostname}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {domain.opd || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(domain.status)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {domain.activationDate ? (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(
                                  domain.activationDate
                                ).toLocaleDateString("id-ID")}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {domain.expiryDate ? (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(domain.expiryDate).toLocaleDateString(
                                  "id-ID"
                                )}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              {domain.status === "Active" ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleOpenDialog(domain, "deactivate")
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Nonaktifkan
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    handleOpenDialog(domain, "reactivate")
                                  }
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Reaktivasi
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog
        open={!!selectedDomain && !!actionType}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "deactivate" &&
                "Nonaktifkan Domain Secara Sepihak"}
              {actionType === "reactivate" && "Reaktivasi Domain Kedaluwarsa"}
              {actionType === "health-check" && "Detail Domain"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "deactivate" &&
                "Domain akan dinonaktifkan dan tidak dapat diakses. Tindakan ini dilakukan secara sepihak oleh Super Admin."}
              {actionType === "reactivate" &&
                "Domain akan direaktivasi dengan masa aktif 1 tahun. Tindakan ini dilakukan secara sepihak oleh Super Admin tanpa perlu pengajuan dari Admin Daerah."}
              {actionType === "health-check" &&
                "Informasi lengkap dan status kesehatan domain"}
            </DialogDescription>
          </DialogHeader>

          {selectedDomain && (
            <div className="space-y-4 py-4">
              {/* Domain Details */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 p-4 rounded-lg">
                <div className="text-muted-foreground">Hostname:</div>
                <div className="font-mono text-xs bg-background px-2 py-1 rounded">
                  {selectedDomain.hostname}
                </div>

                <div className="text-muted-foreground">OPD:</div>
                <div className="font-medium">{selectedDomain.opd}</div>

                <div className="text-muted-foreground">Status Saat Ini:</div>
                <div>{getStatusBadge(selectedDomain.status)}</div>

                {selectedDomain.parentDomain && (
                  <>
                    <div className="text-muted-foreground">Parent Domain:</div>
                    <div className="font-mono text-xs">
                      {selectedDomain.parentDomain}
                    </div>
                  </>
                )}
              </div>

              {/* Reason Input */}
              {actionType !== "health-check" && (
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    {actionType === "deactivate"
                      ? "Alasan Deaktivasi *"
                      : "Catatan (Opsional)"}
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder={
                      actionType === "deactivate"
                        ? "Jelaskan alasan penonaktifan domain ini (wajib diisi)..."
                        : "Tambahkan catatan untuk reaktivasi domain (opsional)..."
                    }
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required={actionType === "deactivate"}
                  />
                  {actionType === "deactivate" && (
                    <p className="text-xs text-muted-foreground">
                      * Alasan wajib diisi untuk dokumentasi dan audit trail
                    </p>
                  )}
                  {actionType === "reactivate" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium mb-1">
                            Informasi Reaktivasi:
                          </p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li>
                              Domain akan diaktifkan dengan status "Active"
                            </li>
                            <li>
                              Masa aktif diperpanjang 1 tahun dari hari ini
                            </li>
                            <li>
                              Tidak perlu menunggu pengajuan dari Admin Daerah
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={
                isSubmitting || (actionType === "deactivate" && !reason.trim())
              }
              variant={actionType === "deactivate" ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {actionType === "deactivate" && (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Nonaktifkan Domain
                    </>
                  )}
                  {actionType === "reactivate" && (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Reaktivasi Domain
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SuperAdminDomainsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminDomainsContent />
    </Suspense>
  );
}
