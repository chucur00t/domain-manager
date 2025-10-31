import { ForgotPasswordForm } from '@/frontend/components/features/auth/forgot-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa Password',
  description: 'Halaman reset password untuk Domain Manager',
};

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ForgotPasswordForm />
    </div>
  );
}