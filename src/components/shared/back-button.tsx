
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

function BackButtonContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    
    const handleBack = () => {
        // We prioritize router.back() for a more natural back navigation.
        // However, if the user navigated here directly, router.back() might take them
        // out of the app. So, we check if there's history to go back to.
        if (typeof window !== 'undefined' && window.history.length > 2) {
             router.back();
        } else {
            // Fallback to a safe dashboard route if there's no history
            const roleQuery = role ? `?role=${encodeURIComponent(role)}` : '';
            if (role === 'Kepala Bidang' || role === 'Pengelola Sistem') {
                router.push(`/super-admin/dashboard${roleQuery}`);
            } else if (role) {
                router.push(`/dashboard${roleQuery}`);
            } else {
                router.push('/'); // Absolute fallback
            }
        }
    };

    return (
        <Button variant="outline" size="sm" className="gap-2" onClick={handleBack}>
            <ArrowLeft className="size-4" />
            Kembali
        </Button>
    );
}

export function BackButton() {
    return (
        <Suspense fallback={<Button variant="outline" size="sm" className="gap-2" disabled>
            <Loader2 className="size-4 animate-spin" />
            Kembali
        </Button>}>
            <BackButtonContent />
        </Suspense>
    )
}
