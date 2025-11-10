/**
 * DNS Management API
 * 
 * Endpoint untuk mengelola DNS records
 * GET /api/dns/records?domain=xxx - List DNS records
 * POST /api/dns/test-connection - Test DNS provider connection
 * GET /api/dns/zones - List DNS zones
 */

import { NextRequest, NextResponse } from 'next/server';
import { dnsManagerService } from '@/backend/services/dns/dns-manager.service';

/**
 * GET /api/dns/records?domain=xxx
 * List DNS records untuk domain
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Test connection
    if (action === 'test-connection') {
      const isConnected = await dnsManagerService.testConnection();
      
      return NextResponse.json({
        success: isConnected,
        provider: dnsManagerService.isProviderConfigured() ? 'configured' : 'manual',
        message: isConnected 
          ? 'DNS provider connection successful' 
          : 'DNS provider not configured or connection failed',
      });
    }

    // List zones
    if (action === 'list-zones') {
      const zones = await dnsManagerService.listZones();
      
      return NextResponse.json({
        success: true,
        zones,
      });
    }

    // List records for domain
    const domainId = searchParams.get('domainId');
    const hostname = searchParams.get('hostname');

    if (!hostname) {
      return NextResponse.json(
        { success: false, error: 'hostname parameter required' },
        { status: 400 }
      );
    }

    const result = await dnsManagerService.listDomainRecords({
      id: domainId || '0',
      hostname,
    } as any);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      records: result.records || [],
    });
  } catch (error) {
    console.error('Error in DNS API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
