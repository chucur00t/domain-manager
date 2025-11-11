"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Filter,
  Globe,
  Server,
} from "lucide-react";
import type {
  SubdomainApplication,
  HostingApplication,
  User,
} from "@/backend/models/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MOCK_USERS } from "@/backend/utils/mock-data";

type NotificationType = "domain" | "hosting";
type NotificationStatus = "all" | "approved" | "rejected" | "pending";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: "approved" | "rejected" | "pending_review" | "pending_approval";
  timestamp: string;
  relatedId: string;
  isRead: boolean;
  rejectionReason?: string;
  details: {
    name: string;
    opd: string;
  };
}

function NotificationsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") as User["role"] | null;
  const roleQuery = role ? `?role=${encodeURIComponent(role)}` : "";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<NotificationStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all");

  // Dialog states
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const currentUser = MOCK_USERS.find((user) => user.role === role) || null;
  const userOpd = currentUser?.opd;

  const fetchNotifications = async () => {
    if (!userOpd) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try to fetch domain applications
      const domainResponse = await fetch("/api/applications");
      if (!domainResponse.ok) {
        throw new Error("API not available");
      }
      const domainApps: SubdomainApplication[] = await domainResponse.json();

      // Try to fetch hosting applications
      const hostingResponse = await fetch("/api/hosting-applications");
      if (!hostingResponse.ok) {
        throw new Error("API not available");
      }
      const hostingApps: HostingApplication[] = await hostingResponse.json();

      // Filter by user's OPD and create notifications
      const domainNotifications: Notification[] = domainApps
        .filter(
          (app) =>
            app.opd === userOpd &&
            (app.status === "approved" || app.status === "rejected")
        )
        .map((app) => ({
          id: `domain-${app.id}`,
          type: "domain" as NotificationType,
          title:
            app.status === "approved"
              ? "✅ Permohonan Domain Disetujui"
              : "❌ Permohonan Domain Ditolak",
          message:
            app.status === "approved"
              ? `Permohonan domain "${app.domainName}" telah disetujui dan siap digunakan.`
              : `Permohonan domain "${app.domainName}" ditolak.`,
          status: app.status as 'approved' | 'rejected' | 'pending_review' | 'pending_approval',
          timestamp: app.submittedDate || new Date().toISOString(),
          relatedId: app.id,
          isRead: false,
          rejectionReason: app.rejectionReason,
          details: {
            name: app.domainName,
            opd: app.opd,
          },
        }));

      const hostingNotifications: Notification[] = hostingApps
        .filter(
          (app) =>
            app.opd === userOpd &&
            (app.status === "approved" || app.status === "rejected")
        )
        .map((app) => ({
          id: `hosting-${app.id}`,
          type: "hosting" as NotificationType,
          title:
            app.status === "approved"
              ? "✅ Permohonan Hosting Disetujui"
              : "❌ Permohonan Hosting Ditolak",
          message:
            app.status === "approved"
              ? `Permohonan hosting untuk "${app.applicationName}" telah disetujui dan sumber daya telah dialokasikan.`
              : `Permohonan hosting untuk "${app.applicationName}" ditolak.`,
          status: app.status as 'approved' | 'rejected' | 'pending_review' | 'pending_approval',
          timestamp: app.submittedDate || new Date().toISOString(),
          relatedId: app.id,
          isRead: false,
          rejectionReason: app.rejectionReason,
          details: {
            name: app.applicationName,
            opd: app.opd,
          },
        }));

      // Combine and sort by timestamp (newest first)
      const allNotifications = [
        ...domainNotifications,
        ...hostingNotifications,
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Use empty array instead of showing error in console
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userOpd]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "approved" && notif.status !== "approved")
          return false;
        if (statusFilter === "rejected" && notif.status !== "rejected")
          return false;
        if (statusFilter === "pending" && !notif.status.includes("pending"))
          return false;
      }

      // Type filter
      if (typeFilter !== "all" && notif.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [notifications, statusFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      approved: notifications.filter((n) => n.status === "approved").length,
      rejected: notifications.filter((n) => n.status === "rejected").length,
      domain: notifications.filter((n) => n.type === "domain").length,
      hosting: notifications.filter((n) => n.type === "hosting").length,
    };
  }, [notifications]);

  const handleViewDetails = (notification: Notification) => {
    const baseUrl =
      notification.type === "domain" ? "/applications" : "/hosting";
    router.push(`${baseUrl}/${notification.relatedId}${roleQuery}`);
  };

  const handleMarkAsRead = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== selectedNotification.id)
      );
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getStatusBadge = (status: Notification["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Ditolak
          </Badge>
        );
      case "pending_review":
      case "pending_approval":
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

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "domain":
        return <Globe className="h-4 w-4" />;
      case "hosting":
        return <Server className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Check if user is Admin Daerah
  if (role !== "Admin Daerah" && role !== "Operator") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
          <CardDescription>
            Halaman notifikasi hanya tersedia untuk Admin Daerah dan Operator.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Total Notifikasi
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
                Disetujui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Ditolak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Belum Dibaca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.unread}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <div>
                  <CardTitle className="text-2xl">Notifikasi</CardTitle>
                  <CardDescription>
                    Pemberitahuan tentang status permohonan domain dan hosting
                    Anda
                  </CardDescription>
                </div>
              </div>
              {stats.unread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Tandai Semua Dibaca
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter:</span>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as NotificationStatus)
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as "all" | NotificationType)
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="hosting">Hosting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results info */}
            <div className="text-sm text-muted-foreground">
              Menampilkan {filteredNotifications.length} dari{" "}
              {notifications.length} notifikasi
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Tidak ada notifikasi yang ditemukan
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`${
                      !notification.isRead
                        ? "border-l-4 border-l-blue-500 bg-blue-50/50"
                        : ""
                    } hover:shadow-md transition-shadow`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Icon */}
                          <div
                            className={`p-2 rounded-lg ${
                              notification.status === "approved"
                                ? "bg-green-100"
                                : notification.status === "rejected"
                                ? "bg-red-100"
                                : "bg-yellow-100"
                            }`}
                          >
                            {notification.status === "approved" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : notification.status === "rejected" ? (
                              <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-base">
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">
                                  Baru
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {getTypeIcon(notification.type)}
                                <span className="ml-1 capitalize">
                                  {notification.type}
                                </span>
                              </Badge>
                              {getStatusBadge(notification.status)}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(
                                  notification.timestamp
                                ).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span>{notification.details.name}</span>
                            </div>

                            {/* Rejection Reason */}
                            {notification.status === "rejected" &&
                              notification.rejectionReason && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-xs font-semibold text-red-900 mb-1">
                                    Alasan Penolakan:
                                  </p>
                                  <p className="text-sm text-red-700">
                                    {notification.rejectionReason}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(notification)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat Detail
                          </Button>
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Tandai Dibaca
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(notification)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Notifikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus notifikasi ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NotificationsPageContent />
    </Suspense>
  );
}
