"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    officer_name: "", // Only for Super Admin
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Username dan password wajib diisi");
      return;
    }

    // Check if this might be Super Admin (username superadmin)
    const mightBeSuperAdmin = formData.username.toLowerCase() === "superadmin";

    if (mightBeSuperAdmin && !formData.officer_name) {
      setError("Nama petugas wajib diisi untuk Super Admin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          officer_name: mightBeSuperAdmin ? formData.officer_name : undefined,
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Redirect based on role
        const roleQuery = `?role=${encodeURIComponent(data.user.role)}`;
        if (data.user.role === "Super Admin") {
          router.push(`/super-admin/dashboard${roleQuery}`);
        } else {
          router.push(`/dashboard${roleQuery}`);
        }
      } else {
        setError(data.message || "Login gagal");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect if user is trying to login as Super Admin
  const handleUsernameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, username: value }));
    setIsSuperAdmin(value.toLowerCase() === "superadmin");
    setError("");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Masukkan username"
            value={formData.username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
        </div>

        {isSuperAdmin && (
          <div>
            <Label htmlFor="officer_name">Nama Petugas</Label>
            <Input
              id="officer_name"
              type="text"
              placeholder="Nama petugas yang login"
              value={formData.officer_name}
              onChange={(e) => handleChange("officer_name", e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Digunakan untuk tracking login Super Admin
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </Button>

        <div className="text-center">
          <Link
            href="/register"
            className="text-sm text-blue-600 hover:underline"
          >
            Belum punya akun? Daftar sebagai Admin Daerah
          </Link>
        </div>
      </form>
    </div>
  );
}
