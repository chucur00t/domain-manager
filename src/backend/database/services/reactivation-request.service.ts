import { query, execute } from "../utils";
import type {
  ReactivationRequest,
  ReactivationDocument,
  ReactivationRequestStatus,
} from "@/backend/models/types";

interface ReactivationRequestRow {
  id: number;
  domain_id: number;
  requester_id: number;
  reason: string;
  status: ReactivationRequestStatus;
  decision_comment: string | null;
  decided_by: number | null;
  requested_at: string;
  decided_at: string | null;
  domain_name?: string;
  requester_name?: string;
  requester_email?: string;
  requester_opd?: string;
  opd_id?: number;
  decider_name?: string;
  domain_status?: string;
  domain_expires_at?: string;
}

export class ReactivationRequestService {
  /**
   * Create new reactivation request
   */
  async createReactivationRequest(data: {
    domain_id: number;
    requester_id: number;
    reason: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO reactivation_requests (domain_id, requester_id, reason, status)
      VALUES (?, ?, ?, 'Pending')
    `;

    try {
      const result = await execute(sql, [
        data.domain_id,
        data.requester_id,
        data.reason,
      ]);
      return result.insertId || 0;
    } catch (error) {
      console.error("Failed to create reactivation request:", error);
      throw error;
    }
  }

  /**
   * Get all reactivation requests with optional filters
   */
  async getReactivationRequests(filters?: {
    status?: ReactivationRequestStatus;
    domain_id?: number;
    opd_id?: number;
    requester_id?: number;
  }): Promise<ReactivationRequest[]> {
    let sql = `
      SELECT 
        rr.id,
        rr.domain_id,
        rr.requester_id,
        rr.reason,
        rr.status,
        rr.decision_comment,
        rr.decided_by,
        rr.requested_at,
        rr.decided_at,
        d.domain_name,
        d.status as domain_status,
        d.expires_at as domain_expires_at,
        u.username as requester_name,
        u.email as requester_email,
        o.name as requester_opd,
        o.id as opd_id,
        u2.username as decider_name
      FROM reactivation_requests rr
      LEFT JOIN domains d ON rr.domain_id = d.id
      LEFT JOIN users u ON rr.requester_id = u.id
      LEFT JOIN opds o ON u.opd_id = o.id
      LEFT JOIN users u2 ON rr.decided_by = u2.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.status) {
      conditions.push("rr.status = ?");
      params.push(filters.status);
    }

    if (filters?.domain_id) {
      conditions.push("rr.domain_id = ?");
      params.push(filters.domain_id);
    }

    if (filters?.opd_id) {
      conditions.push("o.id = ?");
      params.push(filters.opd_id);
    }

    if (filters?.requester_id) {
      conditions.push("rr.requester_id = ?");
      params.push(filters.requester_id);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY rr.requested_at DESC";

    try {
      const rows = await query<ReactivationRequestRow>(sql, params);
      return rows.map((row) => ({
        id: row.id,
        domain_id: row.domain_id,
        requester_id: row.requester_id,
        reason: row.reason,
        status: row.status,
        decision_comment: row.decision_comment || undefined,
        decided_by: row.decided_by || undefined,
        requested_at: row.requested_at,
        decided_at: row.decided_at || undefined,
        domain_name: row.domain_name,
        requester_name: row.requester_name,
        requester_email: row.requester_email,
        requester_opd: row.requester_opd,
        decider_name: row.decider_name,
        opd_id: row.opd_id,
        domain_status: row.domain_status as any,
        domain_expires_at: row.domain_expires_at,
      }));
    } catch (error) {
      console.error("Failed to fetch reactivation requests:", error);
      throw error;
    }
  }

  /**
   * Get single reactivation request by ID
   */
  async getReactivationRequestById(
    id: number
  ): Promise<ReactivationRequest | null> {
    const sql = `
      SELECT 
        rr.id,
        rr.domain_id,
        rr.requester_id,
        rr.reason,
        rr.status,
        rr.decision_comment,
        rr.decided_by,
        rr.requested_at,
        rr.decided_at,
        d.domain_name,
        d.status as domain_status,
        d.expires_at as domain_expires_at,
        u.username as requester_name,
        u.email as requester_email,
        o.name as requester_opd,
        o.id as opd_id,
        u2.username as decider_name
      FROM reactivation_requests rr
      LEFT JOIN domains d ON rr.domain_id = d.id
      LEFT JOIN users u ON rr.requester_id = u.id
      LEFT JOIN opds o ON u.opd_id = o.id
      LEFT JOIN users u2 ON rr.decided_by = u2.id
      WHERE rr.id = ?
    `;

    try {
      const rows = await query<ReactivationRequestRow>(sql, [id]);
      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        domain_id: row.domain_id,
        requester_id: row.requester_id,
        reason: row.reason,
        status: row.status,
        decision_comment: row.decision_comment || undefined,
        decided_by: row.decided_by || undefined,
        requested_at: row.requested_at,
        decided_at: row.decided_at || undefined,
        domain_name: row.domain_name,
        requester_name: row.requester_name,
        requester_email: row.requester_email,
        requester_opd: row.requester_opd,
        decider_name: row.decider_name,
        opd_id: row.opd_id,
        domain_status: row.domain_status as any,
        domain_expires_at: row.domain_expires_at,
      };
    } catch (error) {
      console.error("Failed to fetch reactivation request:", error);
      throw error;
    }
  }

  /**
   * Approve reactivation request
   */
  async approveReactivationRequest(
    id: number,
    decided_by: number,
    comment?: string
  ): Promise<void> {
    const sql = `
      UPDATE reactivation_requests
      SET status = 'Approved',
          decided_by = ?,
          decision_comment = ?,
          decided_at = NOW()
      WHERE id = ?
    `;

    try {
      await query(sql, [decided_by, comment || null, id]);
    } catch (error) {
      console.error("Failed to approve reactivation request:", error);
      throw error;
    }
  }

  /**
   * Reject reactivation request
   */
  async rejectReactivationRequest(
    id: number,
    decided_by: number,
    comment: string
  ): Promise<void> {
    const sql = `
      UPDATE reactivation_requests
      SET status = 'Rejected',
          decided_by = ?,
          decision_comment = ?,
          decided_at = NOW()
      WHERE id = ?
    `;

    try {
      await query(sql, [decided_by, comment, id]);
    } catch (error) {
      console.error("Failed to reject reactivation request:", error);
      throw error;
    }
  }

  /**
   * Add document to reactivation request
   */
  async addDocument(data: {
    reactivation_request_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO reactivation_documents 
      (reactivation_request_id, file_name, file_path, file_type)
      VALUES (?, ?, ?, ?)
    `;

    try {
      const result = await execute(sql, [
        data.reactivation_request_id,
        data.file_name,
        data.file_path,
        data.file_type,
      ]);
      return result.insertId || 0;
    } catch (error) {
      console.error("Failed to add document:", error);
      throw error;
    }
  }

  /**
   * Get documents for reactivation request
   */
  async getDocuments(
    reactivation_request_id: number
  ): Promise<ReactivationDocument[]> {
    const sql = `
      SELECT id, reactivation_request_id, file_name, file_path, file_type, uploaded_at
      FROM reactivation_documents
      WHERE reactivation_request_id = ?
      ORDER BY uploaded_at DESC
    `;

    try {
      return await query<ReactivationDocument>(sql, [reactivation_request_id]);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      throw error;
    }
  }

  /**
   * Delete reactivation request (only if status is Pending)
   */
  async deleteReactivationRequest(id: number): Promise<void> {
    const sql = `
      DELETE FROM reactivation_requests
      WHERE id = ? AND status = 'Pending'
    `;

    try {
      await query(sql, [id]);
    } catch (error) {
      console.error("Failed to delete reactivation request:", error);
      throw error;
    }
  }
}

export const reactivationRequestService = new ReactivationRequestService();
