import { NextRequest, NextResponse } from 'next/server';
import { reactivationRequestService } from '@/backend/database/services/reactivation-request.service';

/**
 * GET /api/reactivation-requests
 * Get all reactivation requests with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const domain_id = searchParams.get('domain_id');
    const opd_id = searchParams.get('opd_id');
    const requester_id = searchParams.get('requester_id');

    const filters: any = {};
    if (status) filters.status = status;
    if (domain_id) filters.domain_id = parseInt(domain_id);
    if (opd_id) filters.opd_id = parseInt(opd_id);
    if (requester_id) filters.requester_id = parseInt(requester_id);

    const requests = await reactivationRequestService.getReactivationRequests(filters);
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching reactivation requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactivation requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reactivation-requests
 * Create new reactivation request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain_id, requester_id, reason } = body;

    // Validation
    if (!domain_id || !requester_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: domain_id, requester_id, reason' },
        { status: 400 }
      );
    }

    if (reason.length < 20) {
      return NextResponse.json(
        { error: 'Reason must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Create reactivation request
    const requestId = await reactivationRequestService.createReactivationRequest({
      domain_id,
      requester_id,
      reason,
    });

    // TODO: Send notification to Super Admin
    // TODO: Create audit log (CREATE_REACTIVATION_REQUEST)

    return NextResponse.json({
      message: 'Reactivation request created successfully',
      id: requestId,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating reactivation request:', error);
    return NextResponse.json(
      { error: 'Failed to create reactivation request' },
      { status: 500 }
    );
  }
}
