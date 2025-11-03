
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
import { submitApplication } from '@/backend/actions/applications';
import { useTransition } from 'react';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  domainName: z.string().min(3, { message: 'Nama subdomain minimal 3 karakter.' }).regex(/^[a-z0-9-]+$/, { message: 'Hanya huruf kecil, angka, dan tanda hubung yang diperbolehkan.'}),
  parentDomain: z.string().nonempty({ message: 'Domain induk harus dipilih.' }),
  applicantName: z.string().nonempty({ message: 'Nama pemohon harus diisi.' }),
  opd: z.string().nonempty({ message: 'OPD harus diisi.' }),
  applicationDescription: z.string().nonempty({ message: 'Deskripsi harus diisi.' }),
  supportingDocuments: z.any().optional(),
});

export function ApplicationForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domainName: '',
      parentDomain: 'kalbarprov.go.id',
      applicantName: '',
      opd: '',
      applicationDescription: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const applicationData = {
        userId: 'current-user', // TODO: Get from auth
        domainName: `${values.domainName}.${values.parentDomain}`,
        applicantName: values.applicantName,
        opd: values.opd,
        purpose: values.applicationDescription,
        submissionDate: new Date().toISOString().split('T')[0],
        description: values.applicationDescription,
      };

      const result = await submitApplication(applicationData, 'Admin Daerah');

      if (result.success) {
        toast({
          title: 'Permohonan Terkirim',
          description: "Permohonan Anda berhasil dikirim dan akan segera ditinjau.",
        });
        form.reset();
        router.push('/applications');
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
                        <FormControl>
                        <Input placeholder="Nama Lengkap" {...field} />
                        </FormControl>
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
                        <Input placeholder="cth: Dinas Komunikasi dan Informatika" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
          <FormField
            control={form.control}
            name="applicationDescription"
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
                  <Input type="file" {...form.register('supportingDocuments')} />
                </FormControl>
                <FormDescription>
                  Unggah surat permohonan, KAK, atau dokumen lain yang relevan (format .pdf).
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
