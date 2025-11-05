import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/frontend/components/ui/card';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Shield,
  Server,
  Timer,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { DomainHealth } from '@/backend/models/types';

interface DomainHealthCardProps {
  domainId: string;
}

export function DomainHealthCard({ domainId }: DomainHealthCardProps) {
  const [health, setHealth] = useState<DomainHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/domains/${domainId}/health`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data kesehatan domain');
      }
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [domainId]);

  if (loading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg">Status Domain</CardTitle>
          <CardDescription>Memuat status kesehatan domain...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!health) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Status Domain</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHealth}
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
        <CardDescription>
          Terakhir diperiksa: {new Date(health.lastChecked).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Uptime Status */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Uptime</p>
              <p className="text-xs text-muted-foreground">
                Response time: {health.responseTime}ms
              </p>
            </div>
          </div>
          {health.isUp ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </div>

        {/* SSL Status */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">SSL Certificate</p>
              {health.ssl.expiryDate && (
                <p className="text-xs text-muted-foreground">
                  Berlaku hingga: {new Date(health.ssl.expiryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {health.ssl.isValid ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </div>

        {/* DNS Status */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">DNS Records</p>
              <p className="text-xs text-muted-foreground">
                {health.dns.aRecords?.length || 0} A records, {' '}
                {health.dns.aaaaRecords?.length || 0} AAAA records
              </p>
            </div>
          </div>
          {health.dns.hasValidRecords ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}