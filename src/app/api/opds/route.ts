import { NextResponse } from "next/server";
import { query } from "@/backend/database/utils";
import type { OPD } from "@/backend/models/types";

export async function GET() {
  try {
    const opds = await query<OPD>(
      "SELECT id, name, address, contact_person, phone_number FROM opds ORDER BY name ASC"
    );

    return NextResponse.json(opds, { status: 200 });
  } catch (error) {
    console.error("Error fetching OPDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch OPDs" },
      { status: 500 }
    );
  }
}
