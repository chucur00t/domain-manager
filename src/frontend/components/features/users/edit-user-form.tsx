"use client";

import {
  useState,
  type ReactNode,
  useTransition,
  useEffect,
  Suspense,
  useMemo,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useToast } from "@/hooks/use-toast";
import {
  updateUser,
  deleteUser,
  updateUserStatus,
} from "@/backend/actions/users";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "@/backend/models/types";
import { Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { cn } from "@/utils/utils";
import { Separator } from "@/components/ui/separator";

const formSchema = z
  .object({
    name: z.string().min(3, { message: "Nama minimal 3 karakter." }),
    email: z.string().email({ message: "Format email tidak valid." }),
    role: z.enum(["Super Admin", "Admin Daerah"], {
      required_error: "Peran harus dipilih.",
    }),
    opd: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.role === "Admin Daerah" &&
        (!data.opd || data.opd.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "OPD harus diisi untuk peran Admin Daerah.",
      path: ["opd"],
    }
  );

type EditUserFormProps = {
  user: User | null;
  currentUser: User | null;
  allOpds: string[];
  onFormAction: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

function EditUserFormContent({
  user,
  currentUser,
  onFormAction,
  allOpds,
  isOpen,
  onOpenChange,
}: EditUserFormProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isStatusUpdating, startStatusUpdateTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const currentUserRole = currentUser?.role;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: (user?.role === 'Super Admin' || user?.role === 'Admin Daerah') 
        ? user.role 
        : "Admin Daerah",
      opd: user?.opd || "",
    },
  });

  const selectedRole = form.watch("role");
  const isAdminDaerah = currentUserRole === "Admin Daerah";

  useEffect(() => {
    if (selectedRole !== "Admin Daerah" && selectedRole !== "Super Admin") {
      form.setValue("opd", "");
    }
  }, [selectedRole, form]);

  useEffect(() => {
    if (user) {
      const validRole: 'Super Admin' | 'Admin Daerah' = 
        (user.role === 'Super Admin' || user.role === 'Admin Daerah') 
          ? user.role 
          : 'Admin Daerah';
      
      form.reset({
        name: user.name,
        email: user.email,
        role: validRole,
        opd: user.opd || "",
      });
    }
  }, [user, form, isOpen]);

  if (!user || !currentUser) return null;

  function onUpdateSubmit(values: z.infer<typeof formSchema>) {
    startUpdateTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("role", values.role);
      if (values.role === "Admin Daerah" && values.opd) {
        formData.append("opd", values.opd);
      }

      const result = await updateUser(user!.id, {
        name: values.name,
        email: values.email,
        role: values.role,
        opd: values.opd,
      });

      if (result.success) {
        toast({
          title: "Sukses",
          description: result.message,
        });
        onOpenChange(false);
        onFormAction();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  }

  const handleConfirmDelete = async () => {
    if (!user) return;

    startDeleteTransition(async () => {
      const result = await deleteUser(user.id);

      if (result.success) {
        toast({
          title: "Sukses",
          description: result.message,
        });
        onFormAction();
        setIsAlertOpen(false);
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleStatus = () => {
    if (!user) return;
    startStatusUpdateTransition(async () => {
      const newStatus = user.status === "active" ? "inactive" : "active";
      const result = await updateUserStatus(user.id, newStatus);
      if (result.success) {
        toast({
          title: "Status Diperbarui",
          description: result.message,
        });
        onFormAction();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const isProcessing = isUpdating || isDeleting || isStatusUpdating;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Ubah Pengguna</DialogTitle>
            <DialogDescription>
              Perbarui detail untuk pengguna {user.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="w-full sm:w-1/2 flex flex-col gap-4">
              <Button
                variant={user.status === "active" ? "outline" : "default"}
                onClick={handleToggleStatus}
                disabled={isProcessing}
              >
                {isStatusUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : user.status === "active" ? (
                  <ToggleLeft className="mr-2 h-4 w-4" />
                ) : (
                  <ToggleRight className="mr-2 h-4 w-4" />
                )}
                {user.status === "active"
                  ? "Nonaktifkan Akun"
                  : "Aktifkan Akun"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsAlertOpen(true)}
                disabled={isProcessing}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Hapus Pengguna
              </Button>
            </div>
            <Separator
              orientation="vertical"
              className="hidden sm:block h-auto"
            />
            <Separator orientation="horizontal" className="sm:hidden w-full" />
            <div className="w-full sm:w-1/2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onUpdateSubmit)}
                  className="space-y-4"
                >
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
                          <Input
                            placeholder="cth: john.doe@example.com"
                            {...field}
                          />
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={currentUser?.role === "Admin Daerah"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih peran pengguna" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isAdminDaerah ? (
                              <SelectItem value="Admin Daerah">
                                Admin Daerah
                              </SelectItem>
                            ) : (
                              <>
                                <SelectItem value="Super Admin">
                                  Super Admin
                                </SelectItem>
                                <SelectItem value="Admin Daerah">
                                  Admin Daerah
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {selectedRole === "Admin Daerah" && (
                    <FormField
                      control={form.control}
                      name="opd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Organisasi Perangkat Daerah (OPD)
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isAdminDaerah}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih OPD" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allOpds.map((opd) => (
                                <SelectItem key={opd} value={opd!}>
                                  {opd}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <DialogFooter className="pt-4 !justify-end">
                    <Button type="submit" disabled={isProcessing}>
                      {isUpdating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan Perubahan
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna "{user?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function EditUserForm(props: EditUserFormProps) {
  return (
    <Suspense
      fallback={
        <div className="p-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      }
    >
      <EditUserFormContent {...props} />
    </Suspense>
  );
}
