import { NextRequest, NextResponse } from "next/server";
import { deactivationRequestService } from "@/backend/database/services/deactivation-request.service";
import { domainService } from "@/backend/database/services/domain.service";

/**
 * GET /api/deactivation-requests/[id]
 * Get single deactivation request by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const deactivationRequest =
      await deactivationRequestService.getDeactivationRequestById(id);

    if (!deactivationRequest) {
      return NextResponse.json(
        { error: "Deactivation request not found" },
        { status: 404 }
      );
    }

    // Get documents for this request
    const documents = await deactivationRequestService.getDocuments(id);

    return NextResponse.json({
      ...deactivationRequest,
      documents,
    });
  } catch (error) {
    console.error("Error fetching deactivation request:", error);
    return NextResponse.json(
      { error: "Failed to fetch deactivation request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/deactivation-requests/[id]
 * Approve or reject deactivation request
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { decision, decided_by, comment } = body;

    // Validation
    if (!decision || !decided_by) {
      return NextResponse.json(
        { error: "Missing required fields: decision, decided_by" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (decision === "reject" && !comment) {
      return NextResponse.json(
        { error: "Comment is required when rejecting a request" },
        { status: 400 }
      );
    }

    // Get the deactivation request to get domain_id
    const deactivationRequest =
      await deactivationRequestService.getDeactivationRequestById(id);

    if (!deactivationRequest) {
      return NextResponse.json(
        { error: "Deactivation request not found" },
        { status: 404 }
      );
    }

    if (deactivationRequest.status !== "Pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    if (decision === "approve") {
      // Approve the deactivation request
      await deactivationRequestService.approveDeactivationRequest(
        id,
        parseInt(decided_by),
        comment
      );

      // Update domain status to Expired/Deactivated
      await domainService.updateDomain(deactivationRequest.domain_id, {
        status: "Expired",
      });

      // TODO: Send notification to Admin Daerah (approved)
      // TODO: Create audit log (APPROVE_DEACTIVATION_REQUEST)
      // TODO: Create audit log (DEACTIVATE_DOMAIN)

      return NextResponse.json({
        message: "Deactivation request approved successfully",
        domain_status: "Expired",
      });
    } else {
      // Reject the deactivation request
      await deactivationRequestService.rejectDeactivationRequest(
        id,
        parseInt(decided_by),
        comment
      );

      // TODO: Send notification to Admin Daerah (rejected)
      // TODO: Create audit log (REJECT_DEACTIVATION_REQUEST)

      return NextResponse.json({
        message: "Deactivation request rejected successfully",
      });
    }
  } catch (error) {
    console.error("Error processing deactivation request:", error);
    return NextResponse.json(
      { error: "Failed to process deactivation request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/deactivation-requests/[id]
 * Delete deactivation request (only if still pending)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    await deactivationRequestService.deleteDeactivationRequest(id);

    return NextResponse.json({
      message: "Deactivation request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting deactivation request:", error);
    return NextResponse.json(
      { error: "Failed to delete deactivation request" },
      { status: 500 }
    );
  }
}
