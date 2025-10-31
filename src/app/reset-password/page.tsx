import { ResetPasswordForm } from '@/frontend/components/features/auth/reset-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Halaman reset password untuk Domain Manager',
};

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ResetPasswordForm />
    </div>
  );
}