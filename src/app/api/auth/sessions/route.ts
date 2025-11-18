import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/backend/database/services/auth.service";

export async function GET(request: NextRequest) {
  try {
    const sessions = await authService.getSuperAdminSessions(100);
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
