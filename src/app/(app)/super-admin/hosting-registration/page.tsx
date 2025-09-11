
import { HostingRegistrationForm } from '@/components/features/registration/hosting-registration-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HostingRegistrationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Formulir Pencatatan Hosting
        </CardTitle>
        <CardDescription>
          Isi detail di bawah ini untuk mencatat layanan hosting yang sudah ada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HostingRegistrationForm />
      </CardContent>
    </Card>
  );
}
