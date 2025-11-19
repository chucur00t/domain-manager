import { NextRequest, NextResponse } from 'next/server';
import { getDomainById } from '@/backend/services';
import { activateDomain, deactivateDomain } from '@/backend/actions/domains';

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;

  try {
    const domain = await getDomainById(id);
    if (!domain) {
      return NextResponse.json({ message: 'Domain not found' }, { status: 404 });
    }
    return NextResponse.json(domain);
  } catch (error) {
    console.error(`Error fetching domain ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status, action, expiryDate, activationDate, reason } = body;

    // Get current user role from query params or headers
    const searchParams = request.nextUrl.searchParams;
    const currentUserRole = searchParams.get('role') as any || 'Super Admin';

    // Handle reactivate action with expiry date update
    if (action === 'reactivate') {
      const result = await activateDomain(id, currentUserRole);
      if (!result.success) {
        return NextResponse.json({ message: result.message }, { status: 403 });
      }

      // Update expiry date if provided
      if (expiryDate) {
        const { updateDomain } = await import('@/backend/actions/domains');
        await updateDomain(id, { 
          expires_at: new Date(expiryDate),
          status: 'Active'
        });
      }

      return NextResponse.json({ message: result.message });
    }

    // Handle activate/deactivate actions
    if (action === 'activate' || status === 'active') {
      const result = await activateDomain(id, currentUserRole);
      if (!result.success) {
        return NextResponse.json({ message: result.message }, { status: 403 });
      }
      return NextResponse.json({ message: result.message });
    }

    if (action === 'deactivate' || action === 'suspend' || status === 'inactive') {
      const result = await deactivateDomain(id, currentUserRole);
      if (!result.success) {
        return NextResponse.json({ message: result.message }, { status: 403 });
      }
      return NextResponse.json({ message: result.message });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(`Error updating domain ${id}:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
