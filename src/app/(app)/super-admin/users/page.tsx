"use client";

import { useState, useMemo, useTransition, Suspense, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersTable } from "@/components/features/users/users-table";
import { AddUserForm } from "@/components/features/users/add-user-form";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import type { User } from "@/backend/models/types";
import { useSearchParams } from "next/navigation";

function SuperAdminUsersPageContent() {
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"];
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const canManageUsers = currentUserRole === "Super Admin";

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.opd && user.opd.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, users]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleUserUpdate = () => {
    startTransition(async () => {
      await fetchUsers();
    });
  };

  const allOpds = [
    ...new Set(
      users
        .map((user) => user.opd)
        .filter(Boolean as any as (x: string | undefined) => x is string)
    ),
  ];

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      totalOpds: allOpds.length,
    }),
    [users, allOpds]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Manajemen Pengguna</CardTitle>
            <CardDescription>
              Kelola seluruh pengguna sistem di semua peran dan OPD.
            </CardDescription>
          </div>
          {canManageUsers && (
            <div className="w-full sm:w-auto">
              <AddUserForm
                allOpds={allOpds}
                allUsers={users}
                onUserAdded={handleUserUpdate}
              />
            </div>
          )}
        </div>

        {/* Statistik Info */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#16181d' }}>
            <div className="text-sm text-white font-medium">
              Total Pengguna
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.totalUsers}
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: '#16181d' }}>
            <div className="text-sm text-white font-medium">Total OPD</div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats.totalOpds}
            </div>
          </div>
        </div>

        <div className="relative w-full sm:max-w-xs pt-4">
          <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari pengguna, email, atau OPD..."
            className="w-full rounded-lg bg-background pl-8"
            onChange={handleSearchChange}
            value={searchTerm}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isPending ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <UsersTable users={filteredUsers} onUserAction={handleUserUpdate} />
        )}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminUsersPageContent />
    </Suspense>
  );
}
