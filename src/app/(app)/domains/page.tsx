
'use client';

import { useState, useMemo, useTransition, Suspense, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DomainsTable } from '@/components/features/domains/domains-table';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { User, Domain } from '@/backend/models/types';
import { MOCK_USERS } from '@/backend/utils/mock-data';


function DomainsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as User['role'] | null;
  const searchTermParam = searchParams.get('q') || '';
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchTermParam);
  const [isPending, startTransition] = useTransition();

  const currentUser = MOCK_USERS.find(user => user.role === role);
  const USER_OPD = currentUser?.opd;
  
  useEffect(() => {
    const fetchDomains = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/domains');
            if (!response.ok) {
                throw new Error('Failed to fetch domains');
            }
            const data = await response.json();
            setDomains(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchDomains();
  }, []);

  const allDomains = useMemo(() => {
    if (role === 'Operator' && USER_OPD) {
      return domains.filter(domain => domain.opd === USER_OPD);
    }
    return domains;
  }, [role, USER_OPD, domains]);


  const filteredDomains = useMemo(() => {
    if (!searchTerm) return allDomains;
    
    return allDomains.filter(domain => 
        domain.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.opd.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allDomains]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newSearchTerm) {
      params.set('q', newSearchTerm);
    } else {
      params.delete('q');
    }
    
    startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Domain</CardTitle>
        <CardDescription>
          Daftar semua subdomain yang terdaftar di sistem.
        </CardDescription>
         <div className="flex items-center gap-4 pt-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari domain atau OPD..."
              className="w-full rounded-lg bg-background pl-8"
              onChange={handleSearchChange}
              value={searchTerm}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
         {isLoading || isPending ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
         ) : (
            <DomainsTable domains={filteredDomains} />
         )}
      </CardContent>
    </Card>
  );
}

export default function DomainsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>}>
      <DomainsPageContent />
    </Suspense>
  )
}
