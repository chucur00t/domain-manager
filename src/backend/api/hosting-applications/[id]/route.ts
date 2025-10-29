
import { NextResponse } from 'next/server';
import { getHostingApplicationById } from '@/lib/services';

type Params = {
  id: string;
};

export async function GET(request: Request, context: { params: Params }) {
  const { id } = context.params;

  try {
    const application = await getHostingApplicationById(id);
    if (!application) {
      return NextResponse.json({ message: 'Hosting application not found' }, { status: 404 });
    }
    return NextResponse.json(application);
  } catch (error) {
    console.error(`Error fetching hosting application ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
