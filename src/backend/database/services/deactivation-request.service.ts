import { query, execute } from "../utils";
import type {
  DeactivationRequest,
  DeactivationDocument,
  DeactivationRequestStatus,
} from "@/backend/models/types";

interface DeactivationRequestRow {
  id: number;
  domain_id: number;
  requester_id: number;
  reason: string;
  status: DeactivationRequestStatus;
  decision_comment: string | null;
  decided_by: number | null;
  requested_at: string;
  decided_at: string | null;
  domain_name?: string;
  requester_name?: string;
  requester_email?: string;
  requester_opd?: string;
  decider_name?: string;
  opd_id?: number;
  domain_status?: string;
}

interface DeactivationDocumentRow {
  id: number;
  deactivation_request_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

export class DeactivationRequestService {
  /**
   * Create a new deactivation request
   */
  async createDeactivationRequest(data: {
    domain_id: number;
    requester_id: number;
    reason: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO deactivation_requests (domain_id, requester_id, reason, status)
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
      console.error("Failed to create deactivation request:", error);
      throw error;
    }
  }

  /**
   * Get all deactivation requests with optional filters
   */
  async getDeactivationRequests(filters?: {
    status?: DeactivationRequestStatus;
    domain_id?: number;
    opd_id?: number;
    requester_id?: number;
  }): Promise<DeactivationRequest[]> {
    let sql = `
      SELECT 
        dr.id,
        dr.domain_id,
        dr.requester_id,
        dr.reason,
        dr.status,
        dr.decision_comment,
        dr.decided_by,
        dr.requested_at,
        dr.decided_at,
        d.domain_name,
        d.status as domain_status,
        u.username as requester_name,
        u.email as requester_email,
        o.name as requester_opd,
        o.id as opd_id,
        u2.username as decider_name
      FROM deactivation_requests dr
      LEFT JOIN domains d ON dr.domain_id = d.id
      LEFT JOIN users u ON dr.requester_id = u.id
      LEFT JOIN opds o ON u.opd_id = o.id
      LEFT JOIN users u2 ON dr.decided_by = u2.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.status) {
      sql += ` AND dr.status = ?`;
      params.push(filters.status);
    }

    if (filters?.domain_id) {
      sql += ` AND dr.domain_id = ?`;
      params.push(filters.domain_id);
    }

    if (filters?.opd_id) {
      sql += ` AND o.id = ?`;
      params.push(filters.opd_id);
    }

    if (filters?.requester_id) {
      sql += ` AND dr.requester_id = ?`;
      params.push(filters.requester_id);
    }

    sql += ` ORDER BY dr.requested_at DESC`;

    try {
      const rows = await query<DeactivationRequestRow>(sql, params);
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
      }));
    } catch (error) {
      console.error("Failed to fetch deactivation requests:", error);
      throw error;
    }
  }

  /**
   * Get single deactivation request by ID
   */
  async getDeactivationRequestById(
    id: number
  ): Promise<DeactivationRequest | null> {
    const sql = `
      SELECT 
        dr.id,
        dr.domain_id,
        dr.requester_id,
        dr.reason,
        dr.status,
        dr.decision_comment,
        dr.decided_by,
        dr.requested_at,
        dr.decided_at,
        d.domain_name,
        d.status as domain_status,
        u.username as requester_name,
        u.email as requester_email,
        o.name as requester_opd,
        o.id as opd_id,
        u2.username as decider_name
      FROM deactivation_requests dr
      LEFT JOIN domains d ON dr.domain_id = d.id
      LEFT JOIN users u ON dr.requester_id = u.id
      LEFT JOIN opds o ON u.opd_id = o.id
      LEFT JOIN users u2 ON dr.decided_by = u2.id
      WHERE dr.id = ?
    `;

    try {
      const rows = await query<DeactivationRequestRow>(sql, [id]);
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
      };
    } catch (error) {
      console.error("Failed to fetch deactivation request:", error);
      throw error;
    }
  }

  /**
   * Approve deactivation request
   */
  async approveDeactivationRequest(
    id: number,
    decided_by: number,
    comment?: string
  ): Promise<void> {
    const sql = `
      UPDATE deactivation_requests
      SET status = 'Approved',
          decided_by = ?,
          decision_comment = ?,
          decided_at = NOW()
      WHERE id = ?
    `;

    try {
      await query(sql, [decided_by, comment || null, id]);
    } catch (error) {
      console.error("Failed to approve deactivation request:", error);
      throw error;
    }
  }

  /**
   * Reject deactivation request
   */
  async rejectDeactivationRequest(
    id: number,
    decided_by: number,
    comment: string
  ): Promise<void> {
    const sql = `
      UPDATE deactivation_requests
      SET status = 'Rejected',
          decided_by = ?,
          decision_comment = ?,
          decided_at = NOW()
      WHERE id = ?
    `;

    try {
      await query(sql, [decided_by, comment, id]);
    } catch (error) {
      console.error("Failed to reject deactivation request:", error);
      throw error;
    }
  }

  /**
   * Add document to deactivation request
   */
  async addDocument(data: {
    deactivation_request_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO deactivation_documents 
      (deactivation_request_id, file_name, file_path, file_type)
      VALUES (?, ?, ?, ?)
    `;

    try {
      const result = await execute(sql, [
        data.deactivation_request_id,
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
   * Get documents for deactivation request
   */
  async getDocuments(
    deactivation_request_id: number
  ): Promise<DeactivationDocument[]> {
    const sql = `
      SELECT id, deactivation_request_id, file_name, file_path, file_type, uploaded_at
      FROM deactivation_documents
      WHERE deactivation_request_id = ?
      ORDER BY uploaded_at DESC
    `;

    try {
      const rows = await query<DeactivationDocumentRow>(sql, [
        deactivation_request_id,
      ]);
      return rows;
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      throw error;
    }
  }

  /**
   * Delete deactivation request (if still pending)
   */
  async deleteDeactivationRequest(id: number): Promise<void> {
    const sql = `
      DELETE FROM deactivation_requests
      WHERE id = ? AND status = 'Pending'
    `;

    try {
      await query(sql, [id]);
    } catch (error) {
      console.error("Failed to delete deactivation request:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const deactivationRequestService = new DeactivationRequestService();
