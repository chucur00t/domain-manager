import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/backend/database/config';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      while (true) {
        try {
          const connection = await db.getConnection();
          try {
            // Get domain stats
            const { rows: [domainStats] } = await connection.query(`
              SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
              FROM domains
            `);

            // Get hosting stats
            const { rows: [hostingStats] } = await connection.query(`
              SELECT 
                COUNT(*) as total,
                AVG(CAST(REPLACE(storage_capacity, 'GB', '') AS DECIMAL)) as avg_storage,
                AVG(CAST(REPLACE(bandwidth, 'GB', '') AS DECIMAL)) as avg_bandwidth
              FROM hostings
              WHERE status = 'Active'
            `);

            const data = {
              timestamp: new Date().toISOString(),
              domainStats,
              hostingStats,
            };

            // Send the data
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

          } finally {
            connection.release();
          }
        } catch (error) {
          console.error('Dashboard update error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to fetch stats' })}\n\n`));
        }

        // Wait for 30 seconds before next update
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}