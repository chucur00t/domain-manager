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

    let documents;
    try {
      documents = await applicationService.getDocumentsByApplicationId(
        applicationId
      );
    } catch (dbError) {
      console.error("Database error fetching documents, returning empty array:", dbError);
      // Return empty array if database fails
      documents = [];
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    // Return empty array instead of 500 error
    return NextResponse.json([]);
  }
}
