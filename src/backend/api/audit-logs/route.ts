
import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/backend/services';

export async function GET() {
  try {
    const logs = await getAuditLogs();
    
    // Ensure logs is an array
    if (!Array.isArray(logs)) {
      console.error('getAuditLogs did not return an array');
      return NextResponse.json([], { status: 200 });
    }
    
    // Sort logs by timestamp descending
    const sortedLogs = [...logs].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json(sortedLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([], { status: 200 });
  }
}
