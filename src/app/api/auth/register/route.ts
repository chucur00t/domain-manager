import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/backend/database/services/auth.service";
import type { RegistrationData } from "@/backend/models/types";

export async function POST(request: NextRequest) {
  try {
    const data: RegistrationData = await request.json();

    // Validation
    if (
      !data.full_name ||
      !data.email ||
      !data.username ||
      !data.password ||
      !data.opd_id ||
      !data.opd_address ||
      !data.contact
    ) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validate password length
    if (data.password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Validate username (no spaces, alphanumeric)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(data.username)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username hanya boleh mengandung huruf, angka, dan underscore",
        },
        { status: 400 }
      );
    }

    const result = await authService.register(data);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in registration API:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
