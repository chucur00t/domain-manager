
import { NextResponse } from 'next/server';
import { getDomains } from '@/backend/services';

export async function GET() {
  try {
    const domains = await getDomains();
    // Sort domains by hostname or domain_name alphabetically
    const sortedDomains = [...domains].sort((a, b) => {
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
