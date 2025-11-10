/**
 * DNS Status Indicator Component
 * 
 * Menampilkan status DNS provider connection
 * Digunakan di settings atau dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Server, RefreshCw } from 'lucide-react';

interface DNSStatusProps {
  showDetails?: boolean;
}

interface DNSZone {
  id: string;
  name: string;
  status: string;
  nameServers?: string[];
}

export function DNSStatus({ showDetails = false }: DNSStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<string>('manual');
  const [zones, setZones] = useState<DNSZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = async () => {
    setIsTesting(true);
    
    try {
      const response = await fetch('/api/dns?action=test-connection');
      const data = await response.json();

      setIsConnected(data.success);
      setProvider(data.provider || 'manual');

      if (showDetails && data.success) {
        // Fetch zones if connected
        const zonesResponse = await fetch('/api/dns?action=list-zones');
        const zonesData = await zonesResponse.json();
        
        if (zonesData.success) {
          setZones(zonesData.zones || []);
        }
      }
    } catch (error) {
      console.error('Error testing DNS connection:', error);
      setIsConnected(false);
      setProvider('manual');
    } finally {
      setIsTesting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
              <Server className="h-5 w-5" />
              DNS Provider Status
            </CardTitle>
            <CardDescription>
              Status koneksi ke DNS provider
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="font-medium">Connection Status</div>
            <div className="text-sm text-muted-foreground">
              {provider === 'configured' ? 'DNS provider configured' : 'Manual mode'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <Badge variant="default" className="bg-green-600">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-yellow-600" />
                <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                  Manual Mode
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Provider Info */}
        {isConnected && provider === 'configured' && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Provider: CloudFlare</div>
            
            {showDetails && zones.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium mt-4">Managed Zones ({zones.length})</div>
                <div className="space-y-1">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <span className="font-mono">{zone.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {zone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Mode Info */}
        {!isConnected && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Manual Mode:</strong> DNS records tidak dibuat otomatis. 
              Administrator harus membuat DNS records secara manual di DNS provider.
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              Untuk mengaktifkan auto-create, konfigurasikan DNS provider di file .env
            </p>
          </div>
        )}

        {/* Auto-create Status */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          {isConnected 
            ? '✓ DNS records akan dibuat otomatis saat domain disetujui'
            : '✗ DNS records harus dibuat manual oleh administrator'
          }
        </div>
      </CardContent>
    </Card>
  );
}
