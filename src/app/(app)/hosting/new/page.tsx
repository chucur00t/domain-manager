
import { HostingApplicationForm } from '@/components/features/hosting/hosting-application-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewHostingApplicationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Formulir Permohonan Hosting Baru
        </CardTitle>
        <CardDescription>
          Isi detail di bawah ini untuk mengajukan hosting bagi aplikasi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HostingApplicationForm />
      </CardContent>
    </Card>
  );
}
