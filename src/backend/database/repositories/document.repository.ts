import { query, queryOne, execute } from '../helpers';
import { ResultSetHeader } from 'mysql2';

export interface Document {
  id: number;
  application_id: number | null;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: Date;
  // Joined fields
  application_type?: string;
  application_status?: string;
  opd_name?: string;
  uploader_name?: string;
}

export interface CreateDocumentInput {
  application_id?: number;
  file_name: string;
  file_path: string;
  file_type: string;
}

export interface UpdateDocumentInput {
  file_name?: string;
  file_path?: string;
  file_type?: string;
}

/**
 * Document Repository
 * Handles database operations for application documents/attachments
 */
export const DocumentRepository = {
  /**
   * Get all documents with joined application data
   */
  async findAll(): Promise<Document[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.file_name, d.file_path, 
        d.file_type, d.uploaded_at,
        a.application_type,
        a.status as application_status,
        o.name as opd_name,
        u.username as uploader_name
      FROM documents d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      ORDER BY d.created_at DESC
    `;
    const result = await query<Document>(sql);
    return result.data || [];
  },

  /**
   * Get document by ID with joined data
   */
  async findById(id: number): Promise<Document | null> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.file_name, d.file_path, 
        d.file_type, d.uploaded_at,
        a.application_type,
        a.status as application_status,
        o.name as opd_name,
        u.username as uploader_name
      FROM documents d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.id = ?
    `;
    const result = await queryOne<Document>(sql, [id]);
    return result.data || null;
  },

  /**
   * Get documents by application ID
   */
  async findByApplication(applicationId: number): Promise<Document[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.file_name, d.file_path, 
        d.file_type, d.uploaded_at,
        a.application_type,
        a.status as application_status,
        o.name as opd_name,
        u.username as uploader_name
      FROM documents d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.application_id = ?
      ORDER BY d.created_at DESC
    `;
    const result = await query<Document>(sql, [applicationId]);
    return result.data || [];
  },

  /**
   * Get documents by file type
   */
  async findByFileType(fileType: string): Promise<Document[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.file_name, d.file_path, 
        d.file_type, d.uploaded_at,
        a.application_type,
        a.status as application_status,
        o.name as opd_name,
        u.username as uploader_name
      FROM documents d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.file_type = ?
      ORDER BY d.created_at DESC
    `;
    const result = await query<Document>(sql, [fileType]);
    return result.data || [];
  },

  /**
   * Get documents by OPD (through application relationship)
   */
  async findByOPD(opdId: number): Promise<Document[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.file_name, d.file_path, 
        d.file_type, d.uploaded_at,
        a.application_type,
        a.status as application_status,
        o.name as opd_name,
        u.username as uploader_name
      FROM documents d
      INNER JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE a.opd_id = ?
      ORDER BY d.uploaded_at DESC
    `;
    const result = await query<Document>(sql, [opdId]);
    return result.data || [];
  },

  /**
   * Create new document
   */
  async create(data: CreateDocumentInput): Promise<number> {
    const sql = `
      INSERT INTO documents (application_id, file_name, file_path, file_type)
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(sql, [
      data.application_id || null,
      data.file_name,
      data.file_path,
      data.file_type,
    ]);
    return result.data?.insertId || 0;
  },

  /**
   * Update document metadata
   */
  async update(id: number, data: UpdateDocumentInput): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.file_name !== undefined) {
      fields.push('file_name = ?');
      values.push(data.file_name);
    }
    if (data.file_path !== undefined) {
      fields.push('file_path = ?');
      values.push(data.file_path);
    }
    if (data.file_type !== undefined) {
      fields.push('file_type = ?');
      values.push(data.file_type);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const sql = `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`;
    const result = await execute(sql, values);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Delete document
   */
  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM documents WHERE id = ?';
    const result = await execute(sql, [id]);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Delete all documents for an application
   */
  async deleteByApplication(applicationId: number): Promise<number> {
    const sql = 'DELETE FROM documents WHERE application_id = ?';
    const result = await execute(sql, [applicationId]);
    return result.data?.affectedRows || 0;
  },

  /**
   * Count documents by application
   */
  async countByApplication(applicationId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM documents WHERE application_id = ?';
    const result = await queryOne<{ total: number }>(sql, [applicationId]);
    return result.data?.total || 0;
  },

  /**
   * Search documents by file name
   */
  async search(searchTerm: string): Promise<Document[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.file_name, d.file_path, 
        d.file_type, d.uploaded_at,
        a.application_type,
        a.status as application_status,
        o.name as opd_name,
        u.username as uploader_name
      FROM documents d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.file_name LIKE ?
      ORDER BY d.uploaded_at DESC
    `;
    const result = await query<Document>(sql, [`%${searchTerm}%`]);
    return result.data || [];
  },

  /**
   * Get recent documents (last N days)
   */
  async findRecent(days: number = 30): Promise<Document[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.file_name, d.file_path, 
        d.file_type, d.uploaded_at,
        a.application_type,
        a.status as application_status,
        o.name as opd_name,
        u.username as uploader_name
      FROM documents d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.uploaded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY d.uploaded_at DESC
    `;
    const result = await query<Document>(sql, [days]);
    return result.data || [];
  },
};
