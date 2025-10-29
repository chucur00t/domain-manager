
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
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-headline">
              Domain Manager
            </CardTitle>
            <CardDescription>
              Sistem Pengelolaan Domain Pemerintah Daerah
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
    </main>
  );
}
