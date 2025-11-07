
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';
import React, { Suspense } from 'react';
import LoginContent from './login-content';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full bg-muted/40">
      {/* Left side - Logo and Title */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-primary/5 p-8">
        <div className="mb-8 w-32 h-32">
          <Logo />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-4">DOMAIN MANAGER</h1>
        <p className="text-lg text-muted-foreground text-center">
          Sistem Pengelolaan Domain Pemerintah Daerah
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 text-center">
              <div className="lg:hidden flex justify-center mb-4">
                <Logo />
              </div>
              <CardTitle className="text-3xl font-bold">
                Selamat Datang!
              </CardTitle>
              <CardDescription className="text-lg">
                Silakan pilih akses untuk melanjutkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={
                <div className="space-y-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              }>
                <LoginContent />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
