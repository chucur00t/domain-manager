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
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { message: "Role is required" },
        { status: 400 }
      );
    }

    // Update application status to Approved
    await applicationService.updateApplication(parseInt(id), {
      status: "Approved",
      approved_at: new Date().toISOString(),
    });

    // Log audit
    await auditService.logAction({
      action: "APPROVE_HOSTING_APPLICATION",
      resourceType: "hosting_application",
      resourceId: id,
      description: `Permohonan hosting ID ${id} disetujui`,
      userId: "1", // TODO: Get from session
      userRole: role,
    });

    return NextResponse.json({
      success: true,
      message: "Permohonan hosting berhasil disetujui",
    });
  } catch (error) {
    console.error("Error approving hosting application:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
