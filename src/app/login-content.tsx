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

  const [formData, setFormData] = useState({
    username: "",
    password: "",
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

    setLoading(true);
    setError("");

    // Simple redirect based on username (without database)
    setTimeout(() => {
      const mightBeSuperAdmin =
        formData.username.toLowerCase() === "superadmin";

      if (mightBeSuperAdmin) {
        // Redirect to Super Admin dashboard
        const roleQuery = "?role=Super%20Admin";
        router.push(`/super-admin/dashboard${roleQuery}`);
      } else {
        // Redirect to Admin Daerah dashboard
        const roleQuery = "?role=Admin%20Daerah";
        router.push(`/dashboard${roleQuery}`);
      }
    }, 500);
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
            onChange={(e) => handleChange("username", e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
        </div>

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
