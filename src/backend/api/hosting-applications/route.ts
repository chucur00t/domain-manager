
import { NextRequest, NextResponse } from 'next/server';
import { getHostingApplications } from '@/backend/services';
import { applicationService } from '@/backend/database/services/application.service';

export async function GET() {
  try {
    const applications = await getHostingApplications();
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching hosting applications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      applicationName,
      applicantName,
      opd,
      description,
      framework,
      purpose,
      domainName,
      expectedUsers,
      storage,
      bandwidth,
      documents = []
    } = body;

    // Validate required fields
    if (!applicationName || !applicantName || !opd || !description || !framework || !purpose) {
      return NextResponse.json(
        { message: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Validate domain name format if provided
    if (domainName) {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
      if (!domainRegex.test(domainName)) {
        return NextResponse.json(
          { message: 'Format nama domain tidak valid' },
          { status: 400 }
        );
      }
    }

    // Create hosting application
    const applicationId = await applicationService.createHostingApplication({
      userId: '1', // In real app, get from auth token
      applicationName,
      framework,
      opd,
      description,
      purpose,
      domainName,
      expectedUsers,
      storage,
      bandwidth,
      documents
    });

    return NextResponse.json(
      {
        message: 'Permohonan hosting berhasil dibuat',
        id: applicationId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hosting application:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat membuat permohonan hosting' },
      { status: 500 }
    );
  }
}
