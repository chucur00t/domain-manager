import { type NextRequest } from 'next/server';
import { domainActivationService } from '@/backend/services/domain-activation.service';

export async function POST(request: NextRequest) {
  try {
    const { domainId, action, userId, reason } = await request.json();

    if (!domainId || !action || !userId) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await domainActivationService.activateDomain(domainId, userId);
        break;
      case 'deactivate':
        if (!reason) {
          return Response.json({ error: 'Reason is required for deactivation' }, { status: 400 });
        }
        result = await domainActivationService.deactivateDomain(domainId, userId, reason);
        break;
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Error processing domain activation/deactivation:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}