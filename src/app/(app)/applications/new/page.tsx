import { ApplicationForm } from '@/components/features/applications/application-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewApplicationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Formulir Permohonan Sub Domain Baru
        </CardTitle>
        <CardDescription>
          Isi detail di bawah ini untuk mengajukan subdomain baru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ApplicationForm />
      </CardContent>
    </Card>
  );
}
