import { NextRequest, NextResponse } from "next/server";
import { reactivationRequestService } from "@/backend/database/services/reactivation-request.service";
import { domainService } from "@/backend/database/services/domain.service";

/**
 * GET /api/reactivation-requests/[id]
 * Get single reactivation request by ID
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

    const reactivationRequest =
      await reactivationRequestService.getReactivationRequestById(id);

    if (!reactivationRequest) {
      return NextResponse.json(
        { error: "Reactivation request not found" },
        { status: 404 }
      );
    }

    // Get documents for this request
    const documents = await reactivationRequestService.getDocuments(id);

    return NextResponse.json({
      ...reactivationRequest,
      documents,
    });
  } catch (error) {
    console.error("Error fetching reactivation request:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactivation request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/reactivation-requests/[id]
 * Approve or reject reactivation request
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

    // Get the reactivation request to get domain_id
    const reactivationRequest =
      await reactivationRequestService.getReactivationRequestById(id);

    if (!reactivationRequest) {
      return NextResponse.json(
        { error: "Reactivation request not found" },
        { status: 404 }
      );
    }

    if (reactivationRequest.status !== "Pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    if (decision === "approve") {
      // Approve the reactivation request
      await reactivationRequestService.approveReactivationRequest(
        id,
        parseInt(decided_by),
        comment
      );

      // Update domain status to Active and extend expires_at by 1 year
      const newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

      await domainService.updateDomain(reactivationRequest.domain_id, {
        status: "Active",
        expires_at: newExpiryDate,
      });

      // TODO: Send notification to Admin Daerah (approved)
      // TODO: Create audit log (APPROVE_REACTIVATION_REQUEST)
      // TODO: Create audit log (REACTIVATE_DOMAIN)

      return NextResponse.json({
        message: "Reactivation request approved successfully",
        domain_status: "Active",
        new_expiry_date: newExpiryDate.toISOString(),
      });
    } else {
      // Reject the reactivation request
      await reactivationRequestService.rejectReactivationRequest(
        id,
        parseInt(decided_by),
        comment
      );

      // TODO: Send notification to Admin Daerah (rejected)
      // TODO: Create audit log (REJECT_REACTIVATION_REQUEST)

      return NextResponse.json({
        message: "Reactivation request rejected successfully",
      });
    }
  } catch (error) {
    console.error("Error processing reactivation request:", error);
    return NextResponse.json(
      { error: "Failed to process reactivation request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reactivation-requests/[id]
 * Delete reactivation request (only if still pending)
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

    await reactivationRequestService.deleteReactivationRequest(id);

    return NextResponse.json({
      message: "Reactivation request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reactivation request:", error);
    return NextResponse.json(
      { error: "Failed to delete reactivation request" },
      { status: 500 }
    );
  }
}
