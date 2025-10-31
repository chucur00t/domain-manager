import { NextRequest } from 'next/server';
import { domainHealthManager } from '@/backend/services/domain-health-manager';
import { notFound, serverError } from '@/backend/config/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const health = await domainHealthManager.getLatestHealthCheck(params.id);
    return Response.json(health);
  } catch (error) {
    console.error('Error checking domain health:', error);
    
    if (error instanceof Error && error.message === 'Domain tidak ditemukan') {
      return notFound('Domain tidak ditemukan');
    }
    
    return serverError('Gagal mengecek kesehatan domain');
  }
}