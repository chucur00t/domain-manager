
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTransition, useMemo, Suspense, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@/backend/models/types';
import React from 'react';
import { submitApplication } from '@/backend/actions/applications';

const formSchema = z.object({
  domainName: z.string().min(3, { message: 'Nama subdomain minimal 3 karakter.' }).regex(/^[a-z0-9-]+$/, { message: 'Hanya huruf kecil, angka, dan tanda hubung yang diperbolehkan.'}),
  parentDomain: z.string().nonempty({ message: 'Domain induk harus dipilih.' }),
  applicantName: z.string().nonempty({ message: 'Nama pemohon harus diisi.' }),
  opd: z.string().nonempty({ message: 'OPD harus diisi.' }),
  description: z.string().nonempty({ message: 'Deskripsi harus diisi.' }),
  supportingDocuments: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Dokumen pendukung wajib diunggah.'),
});

function ApplicationFormContent() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get('role') as User['role'];
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/users');
        if(!res.ok) throw new Error("Gagal mengambil data pengguna");
        const data: User[] = await res.json();
        setAllUsers(data);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Gagal memuat data pengguna.", variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [toast]);

  const operatorUser = useMemo(() => allUsers.find(user => user.role === 'Operator'), [allUsers]);
  const operatorOpd = operatorUser?.opd;

  const usersInOpd = useMemo(() => {
    if (!operatorOpd) return [];
    return allUsers.filter(user => user.opd === operatorOpd);
  }, [operatorOpd, allUsers]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domainName: '',
      parentDomain: 'kalbarprov.go.id',
      applicantName: '',
      opd: operatorOpd || '',
      description: '',
    },
  });

  useEffect(() => {
    if (operatorOpd) {
      form.setValue('opd', operatorOpd);
    }
  }, [operatorOpd, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const applicationData = {
          domainName: `${values.domainName}.${values.parentDomain}`,
          applicantName: values.applicantName,
          opd: values.opd,
          description: values.description,
      }

      const result = await submitApplication(applicationData, currentUserRole);

      if (result.success) {
        toast({
          title: 'Permohonan Terkirim',
          description: "Permohonan Anda berhasil dikirim dan akan segera ditinjau.",
        });
        form.reset();
        router.push(`/applications?role=${currentUserRole}`);
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Terjadi kesalahan saat mengirim permohonan.',
          variant: 'destructive',
        });
      }
    });
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="domainName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Subdomain</FormLabel>
                  <div className="flex items-center">
                    <Input placeholder="cth: dinkes" {...field} className="rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0" />
                    <span className="flex h-10 items-center justify-center rounded-r-md border border-l-0 border-input bg-secondary px-3 text-sm text-muted-foreground">
                      .kalbarprov.go.id
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Induk</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih domain induk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kalbarprov.go.id">kalbarprov.go.id</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih ASN penanggung jawab" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {usersInOpd.map(user => (
                                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
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
                        <Input placeholder="cth: Dinas Komunikasi dan Informatika" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi/Tujuan Penggunaan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Jelaskan tujuan dari permohonan subdomain ini..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Berikan deskripsi yang jelas mengenai penggunaan subdomain.
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
                  <Input type="file" {...form.register('supportingDocuments')} accept=".pdf" />
                </FormControl>
                <FormDescription>
                  Unggah surat permohonan, KAK, atau dokumen lain yang relevan (format .pdf, wajib).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Mengirim...' : 'Kirim Permohonan'}
          </Button>
        </form>
      </Form>
    </>
  );
}

export function ApplicationForm() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ApplicationFormContent />
        </Suspense>
    )
}
