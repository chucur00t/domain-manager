
import { NextResponse } from 'next/server';
import { getApplications } from '@/backend/services';


export async function GET() {
  try {
    const applications = await getApplications();
    // Sort by most recent
    applications.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
