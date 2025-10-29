
import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/backend/services';

export async function GET() {
  try {
    const logs = await getAuditLogs();
    // Sort logs by timestamp descending
    const sortedLogs = [...logs].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json(sortedLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
