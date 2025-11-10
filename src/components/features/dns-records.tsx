/**
 * DNS Records Component
 * 
 * Menampilkan DNS records untuk domain
 * Digunakan di halaman domain management
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Globe } from 'lucide-react';
import type { Domain } from '@/backend/models/types';

interface DNSRecord {
  id?: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

interface DNSRecordsProps {
  domain: Domain;
}

export function DNSRecords({ domain }: DNSRecordsProps) {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dns?hostname=${domain.hostname}&domainId=${domain.id}`
      );
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch DNS records');
      }

      if (data.success) {
        setRecords(data.records || []);
        setIsConfigured(true);
      } else {
        setError(data.error || 'DNS provider not configured');
        setIsConfigured(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [domain.id]);

  if (!isConfigured && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            DNS Records
          </CardTitle>
          <CardDescription>
            DNS records untuk domain ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">DNS provider belum dikonfigurasi</p>
            <p className="text-sm">DNS records harus dikelola secara manual di DNS provider Anda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              DNS Records
            </CardTitle>
            <CardDescription>
              DNS records aktif untuk domain {domain.hostname}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecords}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Tidak ada DNS records ditemukan</p>
            <p className="text-sm mt-2">
              DNS records mungkin belum dibuat atau perlu dibuat secara manual
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record, index) => (
              <div
                key={record.id || index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {record.type}
                    </Badge>
                    <span className="font-mono text-sm">{record.name}</span>
                    {record.proxied && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Proxied
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    → {record.content}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>TTL: {record.ttl || 'Auto'}</div>
                  {record.priority && <div>Priority: {record.priority}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {records.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total records: {records.length}</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                DNS Active
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
