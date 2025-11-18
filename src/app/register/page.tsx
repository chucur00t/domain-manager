"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OPD {
  id: number;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [opds, setOpds] = useState<OPD[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    confirm_password: "",
    opd_id: "",
    opd_address: "",
    contact: "",
  });

  useEffect(() => {
    fetchOPDs();
  }, []);

  const fetchOPDs = async () => {
    try {
      const response = await fetch("/api/opds");
      if (response.ok) {
        const data = await response.json();
        setOpds(data);
      }
    } catch (error) {
      console.error("Error fetching OPDs:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setError("Nama lengkap wajib diisi");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format email tidak valid");
      return false;
    }

    if (!formData.username.trim()) {
      setError("Username wajib diisi");
      return false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError("Username hanya boleh mengandung huruf, angka, dan underscore");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Password dan konfirmasi password tidak sama");
      return false;
    }

    if (!formData.opd_id) {
      setError("OPD wajib dipilih");
      return false;
    }

    if (!formData.opd_address.trim()) {
      setError("Alamat OPD wajib diisi");
      return false;
    }

    if (!formData.contact.trim()) {
      setError("Nomor kontak wajib diisi");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          opd_id: parseInt(formData.opd_id),
          opd_address: formData.opd_address,
          contact: formData.contact,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Registrasi Admin Daerah</CardTitle>
          <CardDescription>
            Daftar untuk mengajukan permohonan domain dan hosting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="contact">Nomor Kontak *</Label>
                <Input
                  id="contact"
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={formData.contact}
                  onChange={(e) => handleChange("contact", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirm_password">Konfirmasi Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    handleChange("confirm_password", e.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="opd_id">Asal OPD *</Label>
              <Select
                value={formData.opd_id}
                onValueChange={(value) => handleChange("opd_id", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih OPD" />
                </SelectTrigger>
                <SelectContent>
                  {opds.map((opd) => (
                    <SelectItem key={opd.id} value={opd.id.toString()}>
                      {opd.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="opd_address">Alamat OPD *</Label>
              <Textarea
                id="opd_address"
                placeholder="Masukkan alamat lengkap OPD"
                value={formData.opd_address}
                onChange={(e) => handleChange("opd_address", e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Mendaftar..." : "Daftar"}
              </Button>
              <Link href="/login" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Sudah Punya Akun? Login
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
