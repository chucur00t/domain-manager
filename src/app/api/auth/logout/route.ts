import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/backend/database/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session_id")?.value;

    if (sessionId) {
      await authService.logoutSuperAdmin(parseInt(sessionId));
    }

    // Clear cookies
    const response = NextResponse.json(
      { success: true, message: "Logout berhasil" },
      { status: 200 }
    );

    response.cookies.delete("user_id");
    response.cookies.delete("user_role");
    response.cookies.delete("session_id");

    return response;
  } catch (error) {
    console.error("Error in logout API:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
