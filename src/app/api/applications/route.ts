import { NextRequest, NextResponse } from "next/server";
import { getApplications } from "@/backend/services";
import { applicationService } from "@/backend/database/services/application.service";

export async function GET(request: NextRequest) {
  try {
    const applications = await getApplications();
    // Sort by most recent, handle undefined dates
    applications.sort((a, b) => {
      const dateA = a.submittedDate ? new Date(a.submittedDate).getTime() : 0;
      const dateB = b.submittedDate ? new Date(b.submittedDate).getTime() : 0;
      return dateB - dateA;
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      domainName,
      applicantName,
      opd,
      description,
      purpose,
      subdomainType,
      documents = [],
    } = body;

    // Validate required fields
    if (!domainName || !applicantName || !opd || !description || !purpose) {
      return NextResponse.json(
        { message: "Field wajib tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Validate domain name format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    if (!domainRegex.test(domainName)) {
      return NextResponse.json(
        { message: "Format nama domain tidak valid" },
        { status: 400 }
      );
    }

    try {
      // Try to create subdomain application in database
      const applicationId = await applicationService.createSubdomainApplication({
        userId: "1", // In real app, get from auth token
        domainName,
        purpose: `${purpose}: ${description}`,
        opd,
        description,
        documents,
      });

      return NextResponse.json(
        {
          message: "Permohonan domain berhasil dibuat",
          id: applicationId,
        },
        { status: 201 }
      );
    } catch (dbError) {
      // Fallback: If database is not available, simulate successful creation
      console.error("Database not available for creating application, simulating success:", dbError);
      
      // Generate mock application ID
      const mockApplicationId = `MOCK-${Date.now()}`;
      
      console.log("Mock application created:", {
        id: mockApplicationId,
        domainName,
        applicantName,
        opd,
        description,
        purpose,
        documents: documents.length,
        status: "Pending",
        createdAt: new Date().toISOString()
      });

      return NextResponse.json(
        {
          message: "Permohonan domain berhasil dibuat (mode simulasi - database tidak tersedia)",
          id: mockApplicationId,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat permohonan" },
      { status: 500 }
    );
  }
}
