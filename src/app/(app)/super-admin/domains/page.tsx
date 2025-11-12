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
  PauseCircle,
  PlayCircle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Activity,
  Shield,
  Calendar,
} from "lucide-react";
import type { Domain, DomainHealth } from "@/backend/models/types";
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

type StatusFilter = "all" | "active" | "inactive" | "expired";
type ActionType = "activate" | "suspend" | "deactivate" | "health-check";

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

  // Health check state
  const [healthData, setHealthData] = useState<Map<string, DomainHealth>>(
    new Map()
  );
  const [isCheckingHealth, setIsCheckingHealth] = useState<Set<string>>(
    new Set()
  );

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
      if (statusFilter !== "all" && domain.status !== statusFilter) {
        return false;
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
    return {
      total: domains.length,
      active: domains.filter((d) => d.status === "active").length,
      inactive: domains.filter((d) => d.status === "inactive").length,
      expired: domains.filter((d) => d.status === "expired").length,
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

  const handleCheckHealth = async (domain: Domain) => {
    setIsCheckingHealth((prev) => new Set(prev).add(domain.id));

    try {
      const response = await fetch(`/api/domains/${domain.id}/health`);
      if (!response.ok) {
        throw new Error("Failed to check domain health");
      }
      const healthInfo: DomainHealth = await response.json();

      setHealthData((prev) => new Map(prev).set(domain.id, healthInfo));

      // Show result in dialog
      handleOpenDialog(domain, "health-check");
    } catch (error) {
      console.error(error);
      alert("Gagal memeriksa kesehatan domain. Silakan coba lagi.");
    } finally {
      setIsCheckingHealth((prev) => {
        const next = new Set(prev);
        next.delete(domain.id);
        return next;
      });
    }
  };

  const handleSubmitAction = async () => {
    if (!selectedDomain || !actionType) return;

    // Skip validation for health-check (view only)
    if (actionType === "health-check") {
      handleCloseDialog();
      return;
    }

    // Validation for actions that require reason
    if (
      (actionType === "suspend" || actionType === "deactivate") &&
      !reason.trim()
    ) {
      alert("Alasan harus diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Map action to new status
      const statusMap: Record<
        Exclude<ActionType, "health-check">,
        Domain["status"]
      > = {
        activate: "active",
        suspend: "inactive",
        deactivate: "inactive",
      };

      const newStatus =
        statusMap[actionType as Exclude<ActionType, "health-check">];

      const response = await fetch(`/api/domains/${selectedDomain.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          reason: reason || undefined,
          action: actionType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update domain");
      }

      // Refresh data
      await fetchDomains();

      // Close dialog
      handleCloseDialog();

      // Show success message
      const actionLabels = {
        activate: "diaktifkan",
        suspend: "disuspen",
        deactivate: "dinonaktifkan",
      };
      alert(
        `Domain berhasil ${
          actionLabels[actionType as keyof typeof actionLabels]
        }!`
      );
    } catch (error) {
      console.error(error);
      alert("Gagal memproses aksi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Domain["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Aktif
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-500 border-orange-200"
          >
            Tidak Aktif
          </Badge>
        );
      case "expired":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Kadaluarsa
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
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
        <div className="grid gap-4 md:grid-cols-4">
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
                Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PauseCircle className="h-4 w-4 text-orange-500" />
                Tidak Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {stats.inactive}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Kadaluarsa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.expired}
              </div>
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
                  Kelola semua domain dari semua OPD - Aktifkan, Suspen, atau
                  Nonaktifkan
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
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                  <SelectItem value="expired">Kadaluarsa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={opdFilter} onValueChange={setOpdFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter OPD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua OPD</SelectItem>
                  {allOpds.map((opd) => (
                    <SelectItem key={opd} value={opd}>
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenDialog(domain, "health-check")
                                }
                              >
                                Lihat Detail
                              </Button>
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
              {actionType === "activate" && "Aktifkan Domain"}
              {actionType === "suspend" && "Suspen Domain"}
              {actionType === "deactivate" && "Nonaktifkan Domain"}
              {actionType === "health-check" && "Detail Domain"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "activate" &&
                "Domain akan diaktifkan dan dapat diakses kembali"}
              {actionType === "suspend" &&
                "Domain akan disuspen sementara dan tidak dapat diakses"}
              {actionType === "deactivate" &&
                "Domain akan dinonaktifkan secara permanen"}
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

              {/* Health Check Results */}
              {actionType === "health-check" &&
                healthData.has(selectedDomain.id) && (
                  <div className="space-y-3 border-t pt-4">
                    {(() => {
                      const health = healthData.get(selectedDomain.id)!;
                      return (
                        <>
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Status Kesehatan
                          </h4>

                          {/* Uptime Status */}
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              {health.isUp ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <span className="font-medium">
                                {health.isUp
                                  ? "Domain Online"
                                  : "Domain Offline"}
                              </span>
                            </div>
                            <Badge
                              variant={health.isUp ? "default" : "destructive"}
                            >
                              {health.isUp ? "UP" : "DOWN"}
                            </Badge>
                          </div>

                          {/* Response Time */}
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">
                              Response Time:
                            </span>
                            <span className="font-mono font-medium">
                              {health.responseTime}ms
                            </span>
                          </div>

                          {/* SSL Status */}
                          {health.ssl && (
                            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span className="font-medium text-sm">
                                  SSL Certificate
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">
                                  Status:
                                </div>
                                <div className="flex items-center gap-1">
                                  {health.ssl.isValid ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                      <span className="text-green-600">
                                        Valid
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 text-red-600" />
                                      <span className="text-red-600">
                                        Invalid
                                      </span>
                                    </>
                                  )}
                                </div>
                                {health.ssl.expiryDate && (
                                  <>
                                    <div className="text-muted-foreground">
                                      Kadaluarsa:
                                    </div>
                                    <div>
                                      {new Date(
                                        health.ssl.expiryDate
                                      ).toLocaleDateString("id-ID")}
                                    </div>
                                  </>
                                )}
                                {health.ssl.issuer && (
                                  <>
                                    <div className="text-muted-foreground">
                                      Issuer:
                                    </div>
                                    <div className="text-xs">
                                      {health.ssl.issuer}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* DNS Status */}
                          {health.dns && (
                            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <span className="font-medium text-sm">
                                  DNS Records
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">
                                  Status:
                                </div>
                                <div className="flex items-center gap-1">
                                  {health.dns.hasValidRecords ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                      <span className="text-green-600">
                                        Valid
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                                      <span className="text-yellow-600">
                                        Issues Found
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Last Checked */}
                          <div className="text-xs text-muted-foreground text-center pt-2">
                            Terakhir diperiksa:{" "}
                            {new Date(health.lastChecked).toLocaleString(
                              "id-ID"
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

              {/* Reason Input (for suspend/deactivate) */}
              {actionType !== "health-check" && (
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    {actionType === "suspend" || actionType === "deactivate"
                      ? "Alasan *"
                      : "Catatan (Opsional)"}
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder={
                      actionType === "activate"
                        ? "Tambahkan catatan aktivasi (opsional)..."
                        : "Jelaskan alasan tindakan ini..."
                    }
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    required={
                      actionType === "suspend" || actionType === "deactivate"
                    }
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {actionType === "health-check" && selectedDomain ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2">
                  {selectedDomain.status !== "active" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setActionType("activate");
                      }}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Aktifkan
                    </Button>
                  )}
                  {selectedDomain.status === "active" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setActionType("suspend");
                      }}
                    >
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Suspen
                    </Button>
                  )}
                  {selectedDomain.status !== "expired" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setActionType("deactivate");
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Nonaktifkan
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Tutup
                </Button>
              </div>
            ) : (
              <>
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
                    isSubmitting ||
                    ((actionType === "suspend" ||
                      actionType === "deactivate") &&
                      !reason.trim())
                  }
                  variant={
                    actionType === "activate"
                      ? "default"
                      : actionType === "suspend"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      {actionType === "activate" && (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Aktifkan
                        </>
                      )}
                      {actionType === "suspend" && (
                        <>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Suspen
                        </>
                      )}
                      {actionType === "deactivate" && (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Nonaktifkan
                        </>
                      )}
                    </>
                  )}
                </Button>
              </>
            )}
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
