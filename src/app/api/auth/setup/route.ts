import { NextResponse } from "next/server";
import { authService } from "@/backend/database/services/auth.service";

/**
 * Setup endpoint - Creates default Super Admin account
 * This should only be called once during initial setup
 */
export async function POST() {
  try {
    await authService.createDefaultSuperAdmin();

    return NextResponse.json(
      {
        success: true,
        message: "Default Super Admin account created successfully",
        credentials: {
          username: "superadmin",
          email: "superadmin@kalbarprov.go.id",
          password: "Superadmin123",
          note: "Please change the password after first login",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in setup:", error);
    return NextResponse.json(
      { success: false, message: "Setup failed" },
      { status: 500 }
    );
  }
}
