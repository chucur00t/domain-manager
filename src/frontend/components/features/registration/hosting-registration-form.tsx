
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
import { registerHosting } from '@/backend/actions/registration';
import { useTransition, useMemo, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_DOMAINS, MOCK_USERS } from '@/backend/utils/mock-data';
import React from 'react';

const formSchema = z.object({
  applicationName: z.string().min(3, { message: 'Nama aplikasi minimal 3 karakter.' }),
  domainName: z.string().nonempty({ message: 'Domain harus dipilih.' }),
  opd: z.string().nonempty({ message: 'OPD harus diisi.' }),
  framework: z.enum(['Next.js', 'Laravel', 'CMS', 'Lainnya'], { required_error: 'Framework harus dipilih.' }),
  status: z.enum(['pending_review', 'pending_approval', 'approved', 'rejected'], { required_error: 'Status harus dipilih.' }),
  submittedDate: z.string().nonempty({ message: 'Tanggal harus diisi.' }),
  description: z.string().nonempty({ message: 'Deskripsi harus diisi.' }),
});

function HostingRegistrationFormContent() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get('role');

  const allOpds = useMemo(() => [...new Set(MOCK_USERS.map(user => user.opd).filter(Boolean as any as (x: string | undefined) => x is string))], []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationName: '',
      domainName: '',
      opd: '',
      description: '',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'approved',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('currentUserRole', currentUserRole || '');

      const result = await registerHosting(formData);

      if (result.success) {
        toast({
          title: 'Pencatatan Berhasil',
          description: result.message,
        });
        form.reset();
        router.push(`/hosting?role=${currentUserRole}`);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  }

  return (
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
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih domain yang terdaftar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_DOMAINS.map(domain => (
                        <SelectItem key={domain.id} value={domain.hostname}>{domain.hostname}</SelectItem>
                      ))}
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
                name="opd"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Organisasi Perangkat Daerah (OPD)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih OPD pemilik" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {allOpds.map(opd => (
                                <SelectItem key={opd} value={opd!}>{opd}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
              control={form.control}
              name="framework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Framework / Teknologi</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih teknologi yang digunakan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Next.js">Next.js</SelectItem>
                      <SelectItem value="Laravel">Laravel</SelectItem>
                      <SelectItem value="CMS">CMS (Wordpress, Joomla, dll)</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Pencatatan</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="approved">Disetujui</SelectItem>
                      <SelectItem value="pending_review">Review Admin</SelectItem>
                      <SelectItem value="pending_approval">Persetujuan</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="submittedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pencatatan</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
              <FormLabel>Deskripsi Kebutuhan Hosting</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan kebutuhan teknis seperti perkiraan trafik, kebutuhan database, dll..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Mencatat...' : 'Simpan Pencatatan Hosting'}
        </Button>
      </form>
    </Form>
  );
}

export function HostingRegistrationForm() {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <HostingRegistrationFormContent />
        </Suspense>
    )
}
