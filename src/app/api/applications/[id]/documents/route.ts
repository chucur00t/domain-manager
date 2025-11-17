import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/backend/database/services/application.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const applicationId = parseInt(params.id);

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { message: "Invalid application ID" },
        { status: 400 }
      );
    }

    const documents = await applicationService.getDocumentsByApplicationId(
      applicationId
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
