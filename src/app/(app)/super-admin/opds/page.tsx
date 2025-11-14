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
  Building2,
  Plus,
  Trash2,
  Users,
  Globe,
  Server,
} from "lucide-react";
import type {
  Domain,
  SubdomainApplication,
  HostingApplication,
} from "@/backend/models/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OPD {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  statistics: {
    totalDomains: number;
    totalApplications: number;
    totalHosting: number;
    totalUsers: number;
  };
  hostedDomains?: HostingApplication[];
}

type ActionType = "add" | "edit" | "delete" | "view";

function SuperAdminOPDsContent() {
  const searchParams = useSearchParams();
  const [opds, setOpds] = useState<OPD[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [selectedOPD, setSelectedOPD] = useState<OPD | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  const fetchOPDsData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data
      const [domainsRes, appsRes, hostingRes] = await Promise.all([
        fetch("/api/domains"),
        fetch("/api/applications"),
        fetch("/api/hosting-applications"),
      ]);

      const [domains, applications, hostingApps]: [
        Domain[],
        SubdomainApplication[],
        HostingApplication[]
      ] = await Promise.all([
        domainsRes.json(),
        appsRes.json(),
        hostingRes.json(),
      ]);

      // Extract unique OPDs and calculate statistics
      const opdMap = new Map<string, OPD>();

      // Collect OPDs from domains
      domains.forEach((domain) => {
        if (domain.opd && !opdMap.has(domain.opd)) {
          opdMap.set(domain.opd, {
            id: `opd-${domain.opd.replace(/\s+/g, "-").toLowerCase()}`,
            name: domain.opd,
            code: domain.opd.substring(0, 3).toUpperCase(),
            contactPerson: "Admin OPD",
            email: `admin@${domain.opd
              .replace(/\s+/g, "")
              .toLowerCase()}.kalbarprov.go.id`,
            phone: "0561-XXXXXX",
            address: "Pontianak, Kalimantan Barat",
            isActive: true,
            statistics: {
              totalDomains: 0,
              totalApplications: 0,
              totalHosting: 0,
              totalUsers: 0,
            },
          });
        }
      });

      // Collect OPDs from applications
      applications.forEach((app) => {
        if (app.opd && !opdMap.has(app.opd)) {
          opdMap.set(app.opd, {
            id: `opd-${app.opd.replace(/\s+/g, "-").toLowerCase()}`,
            name: app.opd,
            code: app.opd.substring(0, 3).toUpperCase(),
            contactPerson: "Admin OPD",
            email: `admin@${app.opd
              .replace(/\s+/g, "")
              .toLowerCase()}.kalbarprov.go.id`,
            phone: "0561-XXXXXX",
            address: "Pontianak, Kalimantan Barat",
            isActive: true,
            statistics: {
              totalDomains: 0,
              totalApplications: 0,
              totalHosting: 0,
              totalUsers: 0,
            },
          });
        }
      });

      // Calculate statistics for each OPD
      opdMap.forEach((opd, opdName) => {
        opd.statistics.totalDomains = domains.filter(
          (d) => d.opd === opdName
        ).length;
        opd.statistics.totalApplications = applications.filter(
          (a) => a.opd === opdName
        ).length;

        // Filter hosting applications for this OPD
        const opdHostingApps = hostingApps.filter((h) => h.opd === opdName);
        opd.statistics.totalHosting = opdHostingApps.length;
        opd.hostedDomains = opdHostingApps;

        opd.statistics.totalUsers = 1; // Placeholder - ideally fetch from users API
      });

      setOpds(
        Array.from(opdMap.values()).sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error("Failed to fetch OPD data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOPDsData();
  }, []);

  // Filtered OPDs
  const filteredOPDs = useMemo(() => {
    if (!searchTerm) return opds;

    const search = searchTerm.toLowerCase();
    return opds.filter(
      (opd) =>
        opd.name.toLowerCase().includes(search) ||
        opd.code.toLowerCase().includes(search) ||
        opd.contactPerson.toLowerCase().includes(search) ||
        opd.email.toLowerCase().includes(search)
    );
  }, [opds, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: opds.length,
      active: opds.filter((o) => o.isActive).length,
      inactive: opds.filter((o) => !o.isActive).length,
    };
  }, [opds]);

  const handleOpenDialog = (action: ActionType, opd?: OPD) => {
    setActionType(action);
    setSelectedOPD(opd || null);

    if (action === "add") {
      setFormData({
        name: "",
        code: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
      });
    } else if (action === "edit" && opd) {
      setFormData({
        name: opd.name,
        code: opd.code,
        contactPerson: opd.contactPerson,
        email: opd.email,
        phone: opd.phone,
        address: opd.address,
      });
    } else if (action === "view" && opd) {
      // View mode - just display data
    }

    if (action === "delete") {
      setIsDeleteDialogOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedOPD(null);
    setActionType(null);
    setFormData({
      name: "",
      code: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.code || !formData.email) {
      alert("Nama, Kode, dan Email OPD harus diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to create/update OPD
      if (actionType === "add") {
        const newOPD: OPD = {
          id: `opd-${formData.name.replace(/\s+/g, "-").toLowerCase()}`,
          name: formData.name,
          code: formData.code,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          isActive: true,
          statistics: {
            totalDomains: 0,
            totalApplications: 0,
            totalHosting: 0,
            totalUsers: 0,
          },
        };
        setOpds((prev) =>
          [...prev, newOPD].sort((a, b) => a.name.localeCompare(b.name))
        );
        alert("OPD berhasil ditambahkan!");
      } else if (actionType === "edit" && selectedOPD) {
        setOpds((prev) =>
          prev.map((opd) =>
            opd.id === selectedOPD.id ? { ...opd, ...formData } : opd
          )
        );
        alert("Data OPD berhasil diperbarui!");
      }

      handleCloseDialog();
    } catch (error) {
      console.error(error);
      alert("Gagal memproses data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOPD) return;

    setIsSubmitting(true);
    try {
      // TODO: Call API to delete OPD
      setOpds((prev) => prev.filter((opd) => opd.id !== selectedOPD.id));
      alert("OPD berhasil dihapus!");
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus OPD. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
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
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total OPD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Organisasi Perangkat Daerah terdaftar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                OPD Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                OPD yang sedang aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                OPD Tidak Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground mt-1">
                OPD yang tidak aktif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <div>
                  <CardTitle className="text-2xl">Manajemen OPD</CardTitle>
                  <CardDescription>
                    Kelola data Organisasi Perangkat Daerah
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => handleOpenDialog("add")}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah OPD
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama OPD, kode, contact person, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Results info */}
            <div className="text-sm text-muted-foreground">
              Menampilkan {filteredOPDs.length} dari {opds.length} OPD
            </div>

            {/* OPDs Table */}
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Nama OPD
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Contact Person
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Email
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOPDs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          Tidak ada OPD yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredOPDs.map((opd) => (
                        <tr key={opd.id} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm font-medium">
                            {opd.name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {opd.contactPerson}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <a
                              href={`mailto:${opd.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {opd.email}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDialog("view", opd)}
                              >
                                Lihat Detail
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleOpenDialog("delete", opd)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "add"
                ? "Tambah OPD Baru"
                : actionType === "edit"
                ? "Edit Data OPD"
                : "Detail OPD"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "add"
                ? "Masukkan informasi OPD baru"
                : actionType === "edit"
                ? "Perbarui informasi OPD"
                : "Informasi lengkap OPD"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {actionType === "view" && selectedOPD ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 p-4 rounded-lg">
                  <div className="text-muted-foreground">Kode OPD:</div>
                  <div className="font-medium">{selectedOPD.code}</div>

                  <div className="text-muted-foreground">Nama OPD:</div>
                  <div className="font-medium">{selectedOPD.name}</div>

                  <div className="text-muted-foreground">Contact Person:</div>
                  <div>{selectedOPD.contactPerson}</div>

                  <div className="text-muted-foreground">Email:</div>
                  <div className="break-all">{selectedOPD.email}</div>

                  <div className="text-muted-foreground">Telepon:</div>
                  <div>{selectedOPD.phone}</div>

                  <div className="text-muted-foreground">Alamat:</div>
                  <div className="col-span-1 break-words">{selectedOPD.address}</div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Statistik</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Hosting
                            </p>
                            <p className="text-2xl font-bold">
                              {selectedOPD.statistics.totalHosting}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Pengguna
                            </p>
                            <p className="text-2xl font-bold">
                              {selectedOPD.statistics.totalUsers}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Domain yang Sudah Hosting */}
                {selectedOPD.hostedDomains &&
                  selectedOPD.hostedDomains.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Domain yang Sudah Hosting (
                        {selectedOPD.hostedDomains.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedOPD.hostedDomains.map((hosting, index) => (
                          <div
                            key={hosting.id || index}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                <p className="font-medium text-sm">
                                  {hosting.domainName}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 ml-5">
                                {hosting.applicationName}
                              </p>
                              {hosting.framework && (
                                <p className="text-xs text-muted-foreground ml-5">
                                  Framework: {hosting.framework}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {hosting.status === "approved" && (
                                <Badge
                                  variant="default"
                                  className="text-xs bg-green-600"
                                >
                                  Aktif
                                </Badge>
                              )}
                              {hosting.status === "pending" && (
                                <Badge variant="secondary" className="text-xs">
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedOPD.hostedDomains &&
                  selectedOPD.hostedDomains.length === 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Domain yang Sudah Hosting
                      </h4>
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <Server className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>Belum ada domain yang di-hosting</p>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama OPD *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Dinas Komunikasi dan Informatika"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode OPD *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="DISKOMINFO"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: e.target.value,
                        })
                      }
                      placeholder="Nama PIC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="0561-XXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="admin@opd.kalbarprov.go.id"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Alamat lengkap OPD"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              {actionType === "view" ? "Tutup" : "Batal"}
            </Button>
            {actionType !== "view" && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    {actionType === "add" ? "Tambah OPD" : "Simpan Perubahan"}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus OPD?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus OPD "{selectedOPD?.name}"?
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
              terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function SuperAdminOPDsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminOPDsContent />
    </Suspense>
  );
}
