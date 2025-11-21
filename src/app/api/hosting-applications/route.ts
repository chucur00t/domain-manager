import { NextRequest, NextResponse } from "next/server";
import { getHostingApplications, createHostingApplication } from "@/backend/services";
import { applicationService } from "@/backend/database/services/application.service";

export async function GET() {
  try {
    const applications = await getHostingApplications();
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching hosting applications:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('=== API RECEIVED DATA ===');
    console.log('Body:', JSON.stringify(body, null, 2));
    
    const {
      applicationName,
      applicantName,
      opd,
      description,
      purpose,
      domainName,
      technicalSpecs,
      documents = [],
    } = body;

    // Validate only critical fields
    if (!applicationName || !applicantName || !opd) {
      console.log('Validation failed:', { applicationName, applicantName, opd });
      return NextResponse.json(
        { message: "Field wajib tidak boleh kosong: Nama Aplikasi, Nama Pemohon, dan OPD" },
        { status: 400 }
      );
    }

    // Validate domain name format if provided
    if (domainName) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
      if (!domainRegex.test(domainName)) {
        return NextResponse.json(
          { message: "Format nama domain tidak valid" },
          { status: 400 }
        );
      }
    }

    // Create hosting application in database
    const applicationData = {
      userId: '1', // Default user ID, atau bisa diambil dari session
      applicationName: applicationName,
      framework: technicalSpecs?.databaseType || 'mysql',
      opd: opd,
      description: description || purpose,
      purpose: purpose || description,
      domainName: domainName || applicationName.toLowerCase().replace(/\s+/g, '-'),
      expectedUsers: technicalSpecs?.estimatedUsers || '',
      storage: technicalSpecs?.storageNeeds || '',
      bandwidth: '100GB',
      documents: documents,
    };

    console.log('Creating hosting application with data:', applicationData);

    const applicationId = await applicationService.createHostingApplication(applicationData);

    console.log('Hosting application created with ID:', applicationId);

    return NextResponse.json(
      {
        message: "Pengajuan hosting berhasil diajukan",
        applicationId,
        applicationName,
        status: "pending",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hosting application:", error);
    if (error instanceof Error) {
      if (error.message.includes("duplicate")) {
        return NextResponse.json(
          { message: "Nama aplikasi sudah terdaftar" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
