
'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { userLogin } from '@/backend/actions/users';
import type { User } from '@/backend/models/types';

export function LoginLogger() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const loggedInRef = useRef(false);

    useEffect(() => {
        const role = searchParams.get('role');
        const isDashboard = pathname.includes('dashboard');
        
        if (role && isDashboard && !loggedInRef.current) {
            // Note: This is a simplified login - in production use proper email/password
            const mockEmail = role === 'Super Admin' ? 'admin@example.com' : 'user@example.com';
            userLogin(mockEmail, 'password123'); // Placeholder password
            loggedInRef.current = true; // Mark as logged to prevent re-triggering
        }
    }, [pathname, searchParams]);

    return null;
}
