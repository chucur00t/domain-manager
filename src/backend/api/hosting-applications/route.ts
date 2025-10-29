
import { NextResponse } from 'next/server';
import { getHostingApplications } from '@/backend/services';

export async function GET() {
  try {
    const applications = await getHostingApplications();
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching hosting applications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
