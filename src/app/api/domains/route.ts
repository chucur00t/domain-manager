
import { NextResponse } from 'next/server';
import { getDomains } from '@/lib/firebase/services';

export async function GET() {
  try {
    const domains = await getDomains();
    // Sort domains by hostname alphabetically
    const sortedDomains = [...domains].sort((a, b) => a.hostname.localeCompare(b.hostname));
    return NextResponse.json(sortedDomains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
