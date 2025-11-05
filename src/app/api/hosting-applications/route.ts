
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

    const application = await applicationService.create({
      applicationName,
      applicantName,
      opd,
      description,
      framework,
      purpose,
      domainName: domainName || null,
      expectedUsers: expectedUsers || null,
      storage: storage || null,
      bandwidth: bandwidth || null,
      documents: JSON.stringify(documents),
      status: 'Pending',
      type: 'hosting'
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating hosting application:', error);
    if (error instanceof Error) {
      if (error.message.includes('duplicate')) {
        return NextResponse.json(
          { message: 'Nama aplikasi sudah terdaftar' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
