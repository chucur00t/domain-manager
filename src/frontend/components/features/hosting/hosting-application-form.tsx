"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { submitHostingApplication } from "@/backend/actions/hosting";
import { useTransition, Suspense, useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User, Domain } from "@/backend/models/types";
import React from "react";

const formSchema = z.object({
  applicationName: z
    .string()
    .min(3, { message: "Nama aplikasi minimal 3 karakter." }),
  domainName: z.string().nonempty({ message: "Domain harus dipilih." }),
  applicantName: z.string().nonempty({ message: "Nama pemohon harus diisi." }),
  opd: z.string().nonempty({ message: "OPD harus diisi." }),
  framework: z.enum(["Next.js", "Laravel", "CMS", "Lainnya"], {
    required_error: "Framework harus dipilih.",
  }),
  description: z.string().nonempty({ message: "Deskripsi harus diisi." }),
  supportingDocuments: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Dokumen pendukung wajib diunggah."),
});

function HostingApplicationFormContent() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"];

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [approvedApplications, setApprovedApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, applicationsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/applications"),
        ]);
        if (!usersRes.ok || !applicationsRes.ok)
          throw new Error("Gagal mengambil data");
        const usersData: User[] = await usersRes.json();
        const applicationsData: any[] = await applicationsRes.json();

        setAllUsers(usersData);
        // Filter hanya aplikasi yang sudah disetujui
        setApprovedApplications(
          applicationsData.filter((app) => app.status === "approved")
        );
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Gagal memuat data pendukung.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const operatorUser = useMemo(
    () => allUsers.find((user) => user.role === "Admin Daerah"),
    [allUsers]
  );
  const operatorOpd = operatorUser?.opd;

  const usersInOpd = useMemo(() => {
    if (!operatorOpd) return [];
    return allUsers.filter((user) => user.opd === operatorOpd);
  }, [operatorOpd, allUsers]);

  const availableDomains = useMemo(() => {
    if (!operatorOpd) return [];
    // Domain dari aplikasi yang sudah disetujui (approved) milik OPD ini
    // Belum masuk ke manajemen domain, menunggu keputusan hosting
    return approvedApplications.filter((app) => app.opd === operatorOpd);
  }, [operatorOpd, approvedApplications]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationName: "",
      domainName: "",
      applicantName: "",
      opd: operatorOpd || "",
      description: "",
    },
  });

  useEffect(() => {
    if (operatorOpd) {
      form.setValue("opd", operatorOpd);
    }
  }, [operatorOpd, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("applicationName", values.applicationName);
      formData.append("domainName", values.domainName);
      formData.append("applicantName", values.applicantName);
      formData.append("opd", values.opd);
      formData.append("framework", values.framework);
      formData.append("description", values.description);
      formData.append("currentUserRole", currentUserRole);

      const result = await submitHostingApplication(formData);

      if (result.success) {
        toast({
          title: "Permohonan Hosting Terkirim",
          description:
            "Permohonan Anda berhasil dikirim dan akan segera ditinjau.",
        });
        form.reset();
        router.push(`/hosting?role=${currentUserRole || ""}`);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="applicationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Aplikasi</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: SIKDA Terpadu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="domainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Terkait</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih domain yang sudah disetujui" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDomains.length > 0 ? (
                        availableDomains.map((app: any) => (
                          <SelectItem key={app.id} value={app.domainName}>
                            {app.domainName}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Tidak ada domain yang disetujui. Ajukan dan tunggu
                          persetujuan domain terlebih dahulu.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih dari domain yang sudah disetujui. Domain akan aktif
                    setelah hosting disetujui.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="applicantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pemohon / Penanggung Jawab</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih ASN penanggung jawab" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersInOpd.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.username || user.name || ""}
                        >
                          {user.username || user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="opd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisasi Perangkat Daerah (OPD)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="cth: Dinas Komunikasi dan Informatika"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="framework"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Framework / Teknologi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih teknologi yang digunakan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Next.js">Next.js</SelectItem>
                    <SelectItem value="Laravel">Laravel</SelectItem>
                    <SelectItem value="CMS">
                      CMS (Wordpress, Joomla, dll)
                    </SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Kebutuhan Hosting</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jelaskan kebutuhan teknis seperti perkiraan trafik, kebutuhan database, dan spesifikasi lainnya..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Berikan deskripsi yang jelas untuk membantu alokasi sumber
                  daya.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supportingDocuments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dokumen Pendukung</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...form.register("supportingDocuments")}
                    accept=".pdf"
                  />
                </FormControl>
                <FormDescription>
                  Unggah surat permohonan, KAK, atau dokumen lain yang relevan
                  (format .pdf, wajib).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Mengirim..." : "Kirim Permohonan Hosting"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export function HostingApplicationForm() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <HostingApplicationFormContent />
    </Suspense>
  );
}
