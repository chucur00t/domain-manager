import { NextResponse } from "next/server";
import { AuditLogService } from "@/backend/database/services/audit-log.service";

const auditLogService = new AuditLogService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get filters from query params
    const filters: any = {};

    const userId = searchParams.get("userId");
    if (userId) {
      filters.user_id = parseInt(userId);
    }

    const action = searchParams.get("action");
    if (action) {
      filters.action = action;
    }

    const startDate = searchParams.get("startDate");
    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    const endDate = searchParams.get("endDate");
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const result = await auditLogService.getAuditLogs(page, limit, filters);

    return NextResponse.json(result.logs);
  } catch (error) {
    console.error(
      "Error fetching audit logs from database, returning mock data:",
      error
    );

    // Return mock audit logs when database is not available
    const { MOCK_AUDIT_LOGS } = await import("@/backend/utils/mock-data");

    return NextResponse.json(MOCK_AUDIT_LOGS);
  }
}
