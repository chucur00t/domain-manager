
'use client';

import { useState, type ReactNode, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateDomainInfo } from '@/backend/actions/domains';
import type { Domain, User } from '@/backend/models/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useSearchParams } from 'next/navigation';

const formSchema = z.object({
  domain_name: z.string().min(3, { message: 'Nama domain minimal 3 karakter.' }),
  ttl: z.string().optional(),
  recordType: z.string().optional(),
  priority: z.string().optional(),
  destination: z.string().optional(),
});

type EditDomainFormProps = {
  domain: Domain;
  children: ReactNode;
};

export function EditDomainForm({ domain, children }: EditDomainFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get('role') as User['role'];
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain_name: domain.domain_name || '',
      ttl: domain.ttl || '',
      recordType: domain.recordType || '',
      priority: domain.priority || '',
      destination: domain.destination || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await updateDomainInfo(
        domain.id, 
        values.domain_name,
        values.ttl || '',
        values.recordType || '',
        values.priority || '',
        values.destination || '',
        currentUserRole
        );
      
      if (result.success) {
        toast({
          title: 'Sukses',
          description: result.message,
        });
        setIsOpen(false);
        router.refresh();
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Ubah Informasi Teknis</DialogTitle>
          <DialogDescription>
            Perbarui informasi teknis untuk domain {domain.hostname}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
            <FormField
              control={form.control}
              name="domain_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: subdomain.kalbarprov.go.id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="ttl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TTL</FormLabel>
                    <FormControl>
                      <Input placeholder="cth: 3600" {...field} />
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
                    <FormLabel>Record Type</FormLabel>
                    <FormControl>
                      <Input placeholder="cth: A, CNAME, MX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input placeholder="cth: 10 (untuk MX record)" {...field} />
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
                      <Textarea placeholder="cth: 103.123.45.67 atau mail.provider.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isPending}>Batal</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
