export type UserRole = 'Super Admin' | 'Admin Daerah';
export type UserStatus = 'active' | 'inactive';

// Database User interface - matches users table
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  opd_id?: number;
  opd_address?: string;
  contact?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  opd?: string;
  // Computed/compatibility fields
  name?: string; // For display purposes, usually same as username
  status?: UserStatus; // Computed from is_active
}

// Registration interface
export interface RegistrationData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  opd_id: number;
  opd_address: string;
  contact: string;
}

// Login interfaces
export interface LoginData {
  username: string;
  password: string;
  officer_name?: string; // Required for Super Admin
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: UserRole;
    opd_id?: number;
    opd?: string;
  };
  session_id?: number; // For Super Admin sessions
  message?: string;
}

// Super Admin Session interface
export interface SuperAdminSession {
  id: number;
  user_id: number;
  officer_name: string;
  login_at: string;
  logout_at?: string;
  ip_address?: string;
  user_agent?: string;
}

// OPD interface - matches opds table
export interface OPD {
  id: number;
  name: string;
  address?: string;
  contact_person?: string;
  phone_number?: string;
  created_at: string;
}

// AuditLog interface - matches audit_logs table
export interface AuditLog {
  id: number;
  user_id: number;
  application_id?: number;
  action: string;
  details?: string;
  timestamp: string;
  // Joined fields
  username?: string;
  user_role?: string;
}

export interface ChangeUserStatusRequest {
  is_active: boolean;
}

export type DomainStatus = 'Active' | 'Suspended' | 'Deactivated' | 'Expired';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
export type ApplicationType = 'domain' | 'hosting';

import { RowDataPacket } from 'mysql2';

export interface DatabaseRow extends RowDataPacket {}

// Domain interface - matches domains table
export interface Domain {
  id: number;
  application_id: number;
  domain_name: string;
  status: DomainStatus;
  activated_at: string;
  expires_at: string;
  // Joined fields
  opd?: string;
  opd_id?: number;
  // Technical/DNS fields (optional, for DNS management)
  ttl?: string;
  recordType?: string;
  priority?: string;
  destination?: string;
  parentDomain?: string;
  // Compatibility aliases
  hostname?: string; // Alias for domain_name
  expiryDate?: string; // Alias for expires_at
  activationDate?: string; // Alias for activated_at
}

// Application interface - matches applications table
export interface Application {
  id: number;
  application_type: ApplicationType;
  requested_domain_name?: string; // Domain name requested in application
  opd_id: number;
  submitter_id: number;
  status: ApplicationStatus;
  reason?: string;
  submitted_at: string;
  approved_at?: string;
  last_updated_by?: number;
  // Joined fields
  opd?: string;
  submitter_username?: string;
  submitter_email?: string;
  // Compatibility fields
  domainName?: string; // For display (alias for requested_domain_name)
  submittedDate?: string; // Alias for submitted_at
  submissionDate?: string; // Alias for submitted_at
}

// Hosting interface - matches hostings table
export interface Hosting {
  id: number;
  application_id: number;
  domain_id: number;
  storage_capacity?: string;
  bandwidth?: string;
  server_type?: string;
  status: 'Active' | 'Deactivated' | 'Expired';
  activated_at: string;
  // Joined fields
  domain_name?: string;
  opd?: string;
  // Compatibility fields
  applicationName?: string; // For display
  domainName?: string; // Alias for domain_name
  submittedDate?: string; // For display
  rejectionReason?: string; // For rejected applications
  applicantName?: string; // For display
  framework?: string; // For application details
  description?: string; // For application details
}
  domain_name?: string;
  opd?: string;
}

// Document interface - matches documents table
export interface Document {
  id: number;
  application_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

// Notification interface - matches notifications table
export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type: 'domain' | 'hosting' | 'perpanjangan' | 'suspensi' | 'deaktivasi' | 'system';
  status: 'unread' | 'read';
  related_entity_type?: string;
  related_entity_id?: number;
  link?: string;
  created_at: string;
  read_at?: string;
  expires_at?: string;
  is_email_sent: boolean;
}

// Deactivation Request Status
export type DeactivationRequestStatus = 'Pending' | 'Approved' | 'Rejected';

// Deactivation Request interface - matches deactivation_requests table
export interface DeactivationRequest {
  id: number;
  domain_id: number;
  requester_id: number;
  reason: string;
  status: DeactivationRequestStatus;
  decision_comment?: string;
  decided_by?: number;
  requested_at: string;
  decided_at?: string;
  // Joined fields
  domain_name?: string;
  requester_name?: string;
  requester_email?: string;
  requester_opd?: string;
  decider_name?: string;
  opd_id?: number;
  domain_status?: DomainStatus;
}

// Deactivation Document interface - matches deactivation_documents table
export interface DeactivationDocument {
  id: number;
  deactivation_request_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

// Reactivation Request Status
export type ReactivationRequestStatus = 'Pending' | 'Approved' | 'Rejected';

// Reactivation Request interface - matches reactivation_requests table
export interface ReactivationRequest {
  id: number;
  domain_id: number;
  requester_id: number;
  reason: string;
  status: ReactivationRequestStatus;
  decision_comment?: string;
  decided_by?: number;
  requested_at: string;
  decided_at?: string;
  // Joined fields from query
  domain_name?: string;
  requester_name?: string;
  requester_email?: string;
  requester_opd?: string;
  decider_name?: string;
  opd_id?: number;
  domain_status?: DomainStatus;
  domain_expires_at?: string;
}

// Reactivation Document interface - matches reactivation_documents table
export interface ReactivationDocument {
  id: number;
  reactivation_request_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

// Domain Health Monitoring interface
export interface DomainHealth {
  id: number;
  domain_id: number;
  is_up: boolean;
  response_time?: number;
  status_code?: number;
  ssl_valid: boolean;
  ssl_expiry_date?: string;
  last_checked: string;
  error_message?: string;
  // Compatibility aliases
  isUp?: boolean; // Alias for is_up
  responseTime?: number; // Alias for response_time
  lastChecked?: string; // Alias for last_checked
  ssl?: {
    isValid: boolean;
    expiryDate?: string;
    issuer?: string;
  };
  dns?: {
    hasValidRecords: boolean;
    aRecords?: string[];
    aaaaRecords?: string[];
  };
}

// Legacy compatibility types for gradual migration
export type SubdomainApplication = Application;
export type HostingApplication = Hosting;

// Mock data compatibility interfaces (will be deprecated)
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  opd?: string;
  nip?: string;
  whatsapp?: string;
}
