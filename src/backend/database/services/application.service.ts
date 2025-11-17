import { query, execute, buildPagination } from "../utils";
import type { DatabaseRow } from "../types";
import type {
  SubdomainApplication,
  HostingApplication,
  ApplicationStatus,
  Application,
  ApplicationType,
} from "@/backend/models/types";

export interface DocumentRow extends DatabaseRow {
  id: number;
  application_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: Date;
}

export interface ApplicationRow extends DatabaseRow {
  id: number;
  application_type: "domain" | "hosting";
  requested_domain_name?: string;
  opd_id?: number;
  submitter_id?: number;
  status: string;
  reason?: string;
  submitted_at: Date;
  approved_at?: Date;
  last_updated_by?: number;
  opd_name?: string;
  submitter_name?: string;
  updater_name?: string;
  // Domain specific fields
  domain_name?: string;
  // Hosting specific fields
  application_name?: string;
  framework?: string;
  storage_capacity?: string;
  bandwidth?: string;
  expected_users?: string;
}

export interface CreateSubdomainApplicationData {
  userId: string;
  domainName: string;
  purpose: string;
  opd: string;
  description?: string;
  documents?: UploadedFile[];
}

export interface CreateHostingApplicationData {
  userId: string;
  applicationName: string;
  framework: string;
  opd: string;
  description: string;
  purpose: string;
  domainName?: string;
  expectedUsers?: string;
  storage?: string;
  bandwidth?: string;
  documents?: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface UpdateApplicationData {
  status?: ApplicationStatus;
  reason?: string;
}

export interface ApplicationFilter {
  status?: ApplicationStatus;
  application_type?: "domain" | "hosting";
  opd_id?: number;
  submitter_id?: number;
  search?: string;
  date_from?: Date;
  date_to?: Date;
}

export class ApplicationService {
  // Get all applications with pagination and filtering
  async getApplications(
    page: number = 1,
    limit: number = 10,
    filters: ApplicationFilter = {}
  ): Promise<{
    applications: (SubdomainApplication | HostingApplication)[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build where clause
      const conditions = [];
      const params: any[] = [];

      if (filters.status) {
        conditions.push("a.status = ?");
        params.push(filters.status);
      }

      if (filters.application_type) {
        conditions.push("a.application_type = ?");
        params.push(filters.application_type);
      }

      if (filters.opd_id) {
        conditions.push("a.opd_id = ?");
        params.push(filters.opd_id);
      }

      if (filters.submitter_id) {
        conditions.push("a.submitter_id = ?");
        params.push(filters.submitter_id);
      }

      if (filters.search) {
        conditions.push(
          "(o.name LIKE ? OR u.username LIKE ? OR a.reason LIKE ?)"
        );
        params.push(
          `%${filters.search}%`,
          `%${filters.search}%`,
          `%${filters.search}%`
        );
      }

      if (filters.date_from) {
        conditions.push("a.submitted_at >= ?");
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        conditions.push("a.submitted_at <= ?");
        params.push(filters.date_to);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM applications a
        LEFT JOIN opds o ON a.opd_id = o.id
        LEFT JOIN users u ON a.submitter_id = u.id
        ${whereClause}
      `;
      const countResult = await query<{ total: number }>(countSql, params);
      const total = countResult[0]?.total || 0;

      // Get applications with pagination
      const { offset, limit: paginationLimit } = buildPagination(page, limit);

      const applicationsSql = `
        SELECT a.id, a.application_type, a.requested_domain_name, a.opd_id, a.submitter_id, a.status, a.reason,
               a.submitted_at, a.approved_at, a.last_updated_by,
               o.name as opd_name,
               u.username as submitter_name,
               uu.username as updater_name
        FROM applications a
        LEFT JOIN opds o ON a.opd_id = o.id
        LEFT JOIN users u ON a.submitter_id = u.id
        LEFT JOIN users uu ON a.last_updated_by = uu.id
        ${whereClause}
        ORDER BY a.submitted_at DESC
        LIMIT ? OFFSET ?
      `;

      const applications = await query<ApplicationRow>(applicationsSql, [
        ...params,
        paginationLimit,
        offset,
      ]);

      // Convert to application format
      const formattedApplications: Application[] = applications.map((app) => ({
        id: app.id,
        application_type: app.application_type as ApplicationType,
        requested_domain_name: app.requested_domain_name,
        opd_id: app.opd_id,
        submitter_id: app.submitter_id,
        status: app.status as ApplicationStatus,
        reason: app.reason,
        submitted_at: app.submitted_at.toISOString(),
        approved_at: app.approved_at?.toISOString(),
        last_updated_by: app.last_updated_by,
        opd: app.opd_name,
        submitter_username: app.submitter_name,
        domainName: app.opd_name
          ? `${app.opd_name
              .toLowerCase()
              .replace(/\s+/g, "-")}.kalbarprov.go.id`
          : "",
        submittedDate: app.submitted_at.toISOString().split("T")[0],
        submissionDate: app.submitted_at.toISOString().split("T")[0],
      }));

      return {
        applications: formattedApplications,
        total,
        page,
        limit: paginationLimit,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch applications: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get application by ID
  async getApplication(
    id: number
  ): Promise<(SubdomainApplication | HostingApplication) | null> {
    try {
      const sql = `
        SELECT a.id, a.application_type, a.requested_domain_name, a.opd_id, a.submitter_id, a.status, a.reason,
               a.submitted_at, a.approved_at, a.last_updated_by,
               o.name as opd_name,
               u.username as submitter_name,
               uu.username as updater_name
        FROM applications a
        LEFT JOIN opds o ON a.opd_id = o.id
        LEFT JOIN users u ON a.submitter_id = u.id
        LEFT JOIN users uu ON a.last_updated_by = uu.id
        WHERE a.id = ?
      `;

      const applications = await query<ApplicationRow>(sql, [id]);

      if (applications.length === 0) {
        return null;
      }

      const app = applications[0];
      return {
        id: app.id,
        application_type: app.application_type as ApplicationType,
        requested_domain_name: app.requested_domain_name,
        opd_id: app.opd_id,
        submitter_id: app.submitter_id,
        status: app.status as ApplicationStatus,
        reason: app.reason,
        submitted_at: app.submitted_at.toISOString(),
        approved_at: app.approved_at?.toISOString(),
        last_updated_by: app.last_updated_by,
        opd: app.opd_name,
        submitter_username: app.submitter_name,
        domainName: app.requested_domain_name || (app.opd_name
          ? `${app.opd_name
              .toLowerCase()
              .replace(/\s+/g, "-")}.kalbarprov.go.id`
          : ""),
        submittedDate: app.submitted_at.toISOString().split("T")[0],
        submissionDate: app.submitted_at.toISOString().split("T")[0],
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch application: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Create subdomain application
  async createSubdomainApplication(
    data: CreateSubdomainApplicationData
  ): Promise<string> {
    try {
      // First, find or create OPD
      let opdId = await this.findOrCreateOpd(data.opd);

      // Find user by ID
      const userSql = "SELECT id FROM users WHERE id = ?";
      const userResult = await query<{ id: number }>(userSql, [data.userId]);

      if (userResult.length === 0) {
        throw new Error("User not found");
      }

      const insertSql = `
        INSERT INTO applications (application_type, requested_domain_name, opd_id, submitter_id, status, reason)
        VALUES ('domain', ?, ?, ?, 'pending', ?)
      `;

      const params = [data.domainName, opdId, userResult[0].id, data.purpose];

      const result = await execute(insertSql, params);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create subdomain application: Database error");
      }

      if (!result.data.insertId) {
        throw new Error(
          "Failed to create subdomain application: No ID returned"
        );
      }

      const applicationId = result.data.insertId;

      // Save documents if provided
      if (data.documents && data.documents.length > 0) {
        await this.saveDocuments(applicationId, data.documents);
      }

      return applicationId.toString();
    } catch (error) {
      throw new Error(
        `Failed to create subdomain application: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Create hosting application
  async createHostingApplication(
    data: CreateHostingApplicationData
  ): Promise<string> {
    try {
      // First, find or create OPD
      let opdId = await this.findOrCreateOpd(data.opd);

      // Find user by ID
      const userSql = "SELECT id FROM users WHERE id = ?";
      const userResult = await query<{ id: number }>(userSql, [data.userId]);

      if (userResult.length === 0) {
        throw new Error("User not found");
      }

      // Create hosting description combining all the fields
      const hostingDescription = `
        Aplikasi: ${data.applicationName}
        Framework: ${data.framework}
        Tujuan: ${data.purpose}
        Deskripsi: ${data.description}
        ${data.expectedUsers ? `Expected Users: ${data.expectedUsers}` : ""}
        ${data.storage ? `Storage: ${data.storage}` : ""}
        ${data.bandwidth ? `Bandwidth: ${data.bandwidth}` : ""}
      `.trim();

      const insertSql = `
        INSERT INTO applications (application_type, opd_id, submitter_id, status, reason)
        VALUES ('hosting', ?, ?, 'pending', ?)
      `;

      const params = [opdId, userResult[0].id, hostingDescription];

      const result = await execute(insertSql, params);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create hosting application: Database error");
      }

      if (!result.data.insertId) {
        throw new Error("Failed to create hosting application: No ID returned");
      }

      const applicationId = result.data.insertId;

      // Save documents if provided
      if (data.documents && data.documents.length > 0) {
        await this.saveDocuments(applicationId, data.documents);
      }

      return applicationId.toString();
    } catch (error) {
      throw new Error(
        `Failed to create hosting application: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Save documents for an application
  private async saveDocuments(
    applicationId: number,
    documents: UploadedFile[]
  ): Promise<void> {
    try {
      const insertSql = `
        INSERT INTO documents (application_id, file_name, file_path, file_type)
        VALUES (?, ?, ?, ?)
      `;

      for (const doc of documents) {
        await execute(insertSql, [
          applicationId,
          doc.name,
          `/uploads/${doc.name}`, // In real implementation, this would be actual file path
          doc.type,
        ]);
      }
    } catch (error) {
      throw new Error(
        `Failed to save documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get documents for an application
  async getDocuments(applicationId: number): Promise<UploadedFile[]> {
    try {
      const documentsSql = `
        SELECT id, file_name, file_path, file_type, uploaded_at
        FROM documents
        WHERE application_id = ?
        ORDER BY uploaded_at DESC
      `;

      const documents = await query<DocumentRow>(documentsSql, [applicationId]);

      return documents.map((doc) => ({
        id: doc.id.toString(),
        name: doc.file_name,
        size: 0, // Size not stored in DB, would need file system access
        type: doc.file_type,
        url: doc.file_path,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Alias for getDocuments for API consistency
  async getDocumentsByApplicationId(applicationId: number): Promise<UploadedFile[]> {
    return this.getDocuments(applicationId);
  }

  // Update application status
  async updateApplication(
    id: number,
    data: UpdateApplicationData,
    updatedBy: number
  ): Promise<void> {
    try {
      console.log(`[updateApplication] Starting update for application ${id}`, { data, updatedBy });
      
      const updates = [];
      const params: any[] = [];

      if (data.status !== undefined) {
        updates.push("status = ?");
        params.push(data.status);
        console.log(`[updateApplication] Setting status to: ${data.status}`);

        if (data.status === "Approved" || data.status === "approved") {
          updates.push("approved_at = CURRENT_TIMESTAMP");
          console.log(`[updateApplication] Setting approved_at to CURRENT_TIMESTAMP`);
        }
      }

      if (data.reason !== undefined) {
        updates.push("reason = ?");
        params.push(data.reason);
        console.log(`[updateApplication] Setting reason to: ${data.reason}`);
      }

      updates.push("last_updated_by = ?");
      params.push(updatedBy);

      if (updates.length === 0) {
        throw new Error("No fields to update");
      }

      const updateSql = `
        UPDATE applications 
        SET ${updates.join(", ")}
        WHERE id = ?
      `;

      params.push(id);
      
      console.log(`[updateApplication] Executing SQL:`, updateSql);
      console.log(`[updateApplication] With params:`, params);

      const result = await execute(updateSql, params);
      
      console.log(`[updateApplication] Update result:`, result);

      if (!result.success) {
        throw new Error(result.error || "Database update failed");
      }

      if (!result.data || result.data.affectedRows === 0) {
        throw new Error("Application not found or no changes made");
      }
      
      console.log(`[updateApplication] Update successful, affected rows: ${result.data.affectedRows}`);
    } catch (error) {
      console.error(`[updateApplication] Error:`, error);
      throw new Error(
        `Failed to update application: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Delete application
  async deleteApplication(id: number): Promise<void> {
    try {
      const deleteSql = `
        DELETE FROM applications WHERE id = ?
      `;

      const result = await execute(deleteSql, [id]);

      if (!result.success) {
        throw new Error(result.error || "Database delete failed");
      }

      if (!result.data || result.data.affectedRows === 0) {
        throw new Error("Application not found");
      }
    } catch (error) {
      throw new Error(
        `Failed to delete application: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get applications by status
  async getApplicationsByStatus(
    status: ApplicationStatus
  ): Promise<(SubdomainApplication | HostingApplication)[]> {
    try {
      const applicationsSql = `
        SELECT a.id, a.application_type, a.requested_domain_name, a.opd_id, a.submitter_id, a.status, a.reason,
               a.submitted_at, a.approved_at, a.last_updated_by,
               o.name as opd_name,
               u.username as submitter_name
        FROM applications a
        LEFT JOIN opds o ON a.opd_id = o.id
        LEFT JOIN users u ON a.submitter_id = u.id
        WHERE a.status = ?
        ORDER BY a.submitted_at DESC
      `;

      const applications = await query<ApplicationRow>(applicationsSql, [
        status,
      ]);

      return applications.map((app) => ({
        id: app.id,
        application_type: app.application_type as ApplicationType,
        requested_domain_name: app.requested_domain_name,
        opd_id: app.opd_id,
        submitter_id: app.submitter_id,
        status: app.status as ApplicationStatus,
        reason: app.reason,
        submitted_at: app.submitted_at.toISOString(),
        approved_at: app.approved_at?.toISOString(),
        last_updated_by: app.last_updated_by,
        opd: app.opd_name,
        submitter_username: app.submitter_name,
        domainName: app.opd_name
          ? `${app.opd_name
              .toLowerCase()
              .replace(/\s+/g, "-")}.kalbarprov.go.id`
          : "",
        submittedDate: app.submitted_at.toISOString().split("T")[0],
        submissionDate: app.submitted_at.toISOString().split("T")[0],
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch applications by status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Helper method to find or create OPD
  private async findOrCreateOpd(opdName: string): Promise<number> {
    try {
      // Try to find existing OPD
      const findSql = "SELECT id FROM opds WHERE name = ?";
      const existing = await query<{ id: number }>(findSql, [opdName]);

      if (existing.length > 0) {
        return existing[0].id;
      }

      // Create new OPD if not found
      const insertSql =
        "INSERT INTO opds (name, contact_person, phone_number) VALUES (?, ?, ?)";
      const result = await execute(insertSql, [opdName, "Unknown", "Unknown"]);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create OPD: Database error");
      }

      if (!result.data.insertId) {
        throw new Error("Failed to create OPD: No ID returned");
      }

      return result.data.insertId;
    } catch (error) {
      throw new Error(
        `Failed to find or create OPD: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get application statistics
  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const statsSql = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM applications
      `;

      const result = await query<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
      }>(statsSql);

      return result[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
    } catch (error) {
      throw new Error(
        `Failed to fetch application stats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
