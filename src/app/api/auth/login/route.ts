import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/backend/database/services/auth.service";
import type { LoginData } from "@/backend/models/types";

export async function POST(request: NextRequest) {
  try {
    const data: LoginData = await request.json();

    // Validation
    if (!data.username || !data.password) {
      return NextResponse.json(
        { success: false, message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Get IP address and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await authService.login(data, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // Set session cookie (you can implement JWT or session management here)
    const response = NextResponse.json(result, { status: 200 });

    // For now, we'll use simple cookie approach
    // In production, consider using JWT or server-side sessions
    if (result.user) {
      response.cookies.set("user_id", result.user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      response.cookies.set("user_role", result.user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });

      if (result.session_id) {
        response.cookies.set("session_id", result.session_id.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    }

    return response;
  } catch (error) {
    console.error("Error in login API:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
