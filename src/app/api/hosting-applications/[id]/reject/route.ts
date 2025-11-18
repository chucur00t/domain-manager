import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/backend/database/services/application.service";
import { auditService } from "@/backend/services/audit.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, reason } = body;

    if (!role) {
      return NextResponse.json(
        { message: "Role is required" },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { message: "Alasan penolakan harus diisi" },
        { status: 400 }
      );
    }

    // Update application status to Rejected
    await applicationService.updateApplication(parseInt(id), {
      status: "Rejected",
      reason: reason,
    });

    // Log audit
    await auditService.logAction({
      action: "REJECT_HOSTING_APPLICATION",
      resourceType: "hosting_application",
      resourceId: id,
      description: `Permohonan hosting ID ${id} ditolak: ${reason}`,
      userId: "1", // TODO: Get from session
      userRole: role,
    });

    return NextResponse.json({
      success: true,
      message: "Permohonan hosting berhasil ditolak",
    });
  } catch (error) {
    console.error("Error rejecting hosting application:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
