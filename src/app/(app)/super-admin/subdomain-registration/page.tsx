
import { SubdomainRegistrationForm } from '@/components/features/registration/subdomain-registration-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SubdomainRegistrationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Formulir Pencatatan Subdomain
        </CardTitle>
        <CardDescription>
          Isi detail di bawah ini untuk mencatat subdomain yang sudah ada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SubdomainRegistrationForm />
      </CardContent>
    </Card>
  );
}
