import { NextResponse } from "next/server";
import { getHostingApplicationById } from "@/backend/services";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const application = await getHostingApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { message: "Hosting application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error(`Error fetching hosting application:`, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
