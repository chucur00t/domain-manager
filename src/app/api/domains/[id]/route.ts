
import { NextResponse } from 'next/server';
import { getDomainById } from '@/lib/firebase/services';

type Params = {
  id: string;
};

export async function GET(request: Request, context: { params: Params }) {
  const { id } = context.params;

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
