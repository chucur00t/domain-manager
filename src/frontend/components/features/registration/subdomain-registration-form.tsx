
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
import { useToast } from '@/hooks/use-toast';
import { registerSubdomain } from '@/backend/actions/registration';
import { useTransition, useMemo, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { MOCK_USERS } from '@/backend/utils/mock-data';
import React from 'react';

const formSchema = z.object({
  hostname: z.string().min(3, { message: 'Nama subdomain lengkap minimal 3 karakter.' }).includes('.', { message: 'Hostname harus lengkap, contoh: dinkes.kalbarprov.go.id'}),
  opd: z.string().nonempty({ message: 'OPD harus diisi.' }),
  status: z.enum(['active', 'inactive', 'pending', 'error'], { required_error: 'Status harus dipilih.'}),
  activationDate: z.string().nonempty({ message: 'Tanggal aktivasi harus diisi.' }),
  recordType: z.string().optional(),
  destination: z.string().optional(),
});


function SubdomainRegistrationFormContent() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUserRole = searchParams.get('role');

  const allOpds = useMemo(() => [...new Set(MOCK_USERS.map(user => user.opd).filter(Boolean as any as (x: string | undefined) => x is string))], []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hostname: '',
      opd: '',
      activationDate: new Date().toISOString().split('T')[0],
      recordType: 'A',
      destination: '',
      status: 'active',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });
      formData.append('currentUserRole', currentUserRole || '');

      const result = await registerSubdomain(formData);

      if (result.success) {
        toast({
          title: 'Pencatatan Berhasil',
          description: result.message,
        });
        form.reset();
        router.push(`/domains?role=${currentUserRole}`);
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
        <FormField
            control={form.control}
            name="hostname"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Hostname Lengkap</FormLabel>
                <FormControl>
                <Input placeholder="cth: dinkes.kalbarprov.go.id" {...field} />
                </FormControl>
                <FormDescription>
                    Masukkan nama subdomain beserta domain induknya.
                </FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />
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
                name="status"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih status domain" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
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
                name="activationDate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tanggal Aktivasi</FormLabel>
                    <FormControl>
                    <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipe Record DNS</FormLabel>
                    <FormControl>
                    <Input placeholder="cth: A, CNAME, MX" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
         <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Destination / Value</FormLabel>
                <FormControl>
                    <Textarea placeholder="cth: 103.123.45.67 atau nama.domain.lain" {...field} />
                </FormControl>
                 <FormDescription>
                    Alamat IP untuk record 'A' atau hostname tujuan untuk 'CNAME'.
                </FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Mencatat...' : 'Simpan Pencatatan Subdomain'}
        </Button>
      </form>
    </Form>
  );
}

export function SubdomainRegistrationForm() {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <SubdomainRegistrationFormContent />
        </Suspense>
    )
}
