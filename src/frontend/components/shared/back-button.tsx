
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

function BackButtonContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role');
    const from = searchParams.get('from');
    
    const handleBack = () => {
        const roleQuery = role ? `?role=${encodeURIComponent(role)}` : '';
        
        // If 'from' parameter exists, navigate to specific page
        if (from === 'super-admin-applications') {
            router.push(`/super-admin/applications${roleQuery}`);
            return;
        }
        if (from === 'super-admin-hosting') {
            router.push(`/super-admin/hosting-applications${roleQuery}`);
            return;
        }
        
        // Otherwise use browser back if history exists
        if (typeof window !== 'undefined' && window.history.length > 2) {
             router.back();
        } else {
            // Fallback to dashboard route if there's no history
            if (role === 'Super Admin') {
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
