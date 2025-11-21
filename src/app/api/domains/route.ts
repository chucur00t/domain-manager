
import { NextResponse } from 'next/server';
import { getDomains } from '@/backend/services';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    
    const domains = await getDomains();
    
    // Filter by status if provided
    let filteredDomains = domains;
    if (statusFilter) {
      filteredDomains = domains.filter(d => d.status === statusFilter);
    }
    
    // Sort domains by hostname or domain_name alphabetically
    const sortedDomains = [...filteredDomains].sort((a, b) => {
      const nameA = a.hostname || a.domain_name || '';
      const nameB = b.hostname || b.domain_name || '';
      return nameA.localeCompare(nameB);
    });
    return NextResponse.json(sortedDomains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
