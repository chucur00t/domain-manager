import { NextRequest, NextResponse } from "next/server";
import { deactivationRequestService } from "@/backend/database/services/deactivation-request.service";
import type { DeactivationRequestStatus } from "@/backend/models/types";

/**
 * GET /api/deactivation-requests
 * Get all deactivation requests with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get(
      "status"
    ) as DeactivationRequestStatus | null;
    const domain_id = searchParams.get("domain_id");
    const opd_id = searchParams.get("opd_id");
    const requester_id = searchParams.get("requester_id");

    const filters: any = {};
    if (status) filters.status = status;
    if (domain_id) filters.domain_id = parseInt(domain_id);
    if (opd_id) filters.opd_id = parseInt(opd_id);
    if (requester_id) filters.requester_id = parseInt(requester_id);

    const requests = await deactivationRequestService.getDeactivationRequests(
      filters
    );

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching deactivation requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch deactivation requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deactivation-requests
 * Create a new deactivation request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain_id, requester_id, reason } = body;

    // Validation
    if (!domain_id || !requester_id || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: domain_id, requester_id, reason" },
        { status: 400 }
      );
    }

    const requestId =
      await deactivationRequestService.createDeactivationRequest({
        domain_id: parseInt(domain_id),
        requester_id: parseInt(requester_id),
        reason,
      });

    // TODO: Send notification to Super Admin
    // TODO: Create audit log

    return NextResponse.json(
      { id: requestId, message: "Deactivation request created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating deactivation request:", error);
    return NextResponse.json(
      { error: "Failed to create deactivation request" },
      { status: 500 }
    );
  }
}
