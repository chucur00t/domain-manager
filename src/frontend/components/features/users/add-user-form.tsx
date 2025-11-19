
'use client';

import { useState, useTransition, Suspense, useEffect, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addUser } from '@/backend/actions/users';
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
import { Loader2, PlusCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { User } from '@/backend/models/types';
import React from 'react';
import { MOCK_USERS } from '@/backend/utils/mock-data';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal 3 karakter.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  role: z.enum(['Super Admin', 'Admin Daerah'], {
    required_error: 'Peran harus dipilih.',
  }),
  opd: z.string().optional(),
}).refine(data => {
    if (data.role === 'Admin Daerah' && (!data.opd || data.opd.trim() === '')) {
      return false;
    }
    return true;
  }, {
    message: 'OPD harus diisi untuk peran Admin Daerah.',
    path: ['opd'],
  });

type AddUserFormProps = {
  allOpds: string[];
  allUsers: User[];
  onUserAdded: () => void;
};


function AddUserFormContent({ allOpds, allUsers, onUserAdded }: AddUserFormProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const currentUserRole = searchParams.get('role') as User['role'];
  
  // Get current logged-in user from MOCK_USERS (same as users-table.tsx)
  const currentUser = useMemo(
    () => MOCK_USERS.find((u) => u.role === currentUserRole),
    [currentUserRole]
  );
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      opd: '',
    },
  });
  
  useEffect(() => {
    if(isOpen) {
        if (currentUserRole === 'Admin Daerah') {
            form.reset({
                name: '',
                email: '',
                role: 'Admin Daerah',
                opd: currentUser?.opd || '',
            });
        } else {
            form.reset({
                name: '',
                email: '',
                role: undefined,
                opd: '',
            });
        }
    }
  }, [currentUserRole, currentUser, form, isOpen]);

  const selectedRole = form.watch('role');
  const isAdminDaerah = currentUserRole === 'Admin Daerah';

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
        toast({
            title: "Error",
            description: "Tidak dapat menemukan pengguna saat ini.",
            variant: "destructive"
        })
        return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('role', values.role);
      if ((values.role === 'Admin Daerah') && values.opd) {
          formData.append('opd', values.opd);
      }
      formData.append('currentUserId', String(currentUser.id));

      const userData = {
        name: values.name,
        email: values.email,
        role: values.role,
        opd: values.opd
      };
      const result = await addUser(userData);
      
      if (result.success) {
        toast({
          title: 'Sukses',
          description: result.message,
        });
        setIsOpen(false);
        onUserAdded();
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
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 w-full sm:w-auto">
            <PlusCircle className="size-3.5" />
            Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Isi detail di bawah ini untuk membuat pengguna baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isAdminDaerah}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran pengguna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isAdminDaerah ? (
                        <SelectItem value="Admin Daerah">Admin Daerah</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="Super Admin">Super Admin</SelectItem>
                          <SelectItem value="Admin Daerah">Admin Daerah</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedRole === 'Admin Daerah' && (
               <FormField
                control={form.control}
                name="opd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisasi Perangkat Daerah (OPD)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={currentUserRole === 'Admin Daerah'}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih OPD" />
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
            )}
            {selectedRole === 'Super Admin' && (
              <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 p-3 rounded-md">
                <p className="font-medium text-blue-900">OPD: Dinas Komunikasi dan Informatika</p>
                <p className="text-xs mt-1">Super Admin otomatis terdaftar di Diskominfo</p>
              </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary" disabled={isPending}>Batal</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? 'Menyimpan...' : 'Simpan Pengguna'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


export function AddUserForm({ allOpds, allUsers, onUserAdded }: AddUserFormProps) {
    return (
        <React.Suspense fallback={<Button size="sm" className="gap-1 w-full sm:w-auto" disabled><Loader2 className="size-3.5 animate-spin" /> Tambah</Button>}>
            <AddUserFormContent allOpds={allOpds} allUsers={allUsers} onUserAdded={onUserAdded} />
        </React.Suspense>
    )
}
