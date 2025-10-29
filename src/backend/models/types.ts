export type UserRole = 'Super Admin' | 'Administrator' | 'Operator' | 'Admin Perangkat Daerah' | 'Admin Dinas Kominfo' | 'Auditor' | 'Kepala Bidang' | 'Pengelola Sistem';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  opd?: string;
  nip: string;
  whatsapp: string;
}

export interface AuditLogInput {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
}

export interface AuditLog extends AuditLogInput {
  id: string;
  timestamp: string;
  resourceId: string;
  description: string;
  user?: string;
  userRole?: string;
  details?: string;
}

export interface ChangeUserStatusRequest {
  status: UserStatus;
}

export type DomainStatus = 'active' | 'inactive' | 'expired' | 'pending';

export interface Domain {
  id: string;
  hostname: string;
  status: DomainStatus;
  expiryDate: string;
  opd: string;
  parentDomain?: string;
  activationDate?: string;
  ttl?: string;
  recordType?: string;
  priority?: string;
  destination?: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'pending_review' | 'pending_approval';

export interface SubdomainApplication {
  id: string;
  userId: string;
  domainName: string;
  purpose: string;
  status: ApplicationStatus;
  submissionDate: string;
  submittedDate?: string;
  approvalDate?: string;
  opd: string;
  applicantName?: string;
  description?: string;
  documents?: string[];
  rejectionReason?: string;
}

export interface HostingApplication {
  id: string;
  userId: string;
  applicationName: string;
  description: string;
  framework: string;
  domainName: string;
  opd: string;
  applicantName: string;
  status: ApplicationStatus;
  submittedDate: string;
  rejectionReason?: string;
}

// Role Permissions interface (for super admin roles)
export interface RolePermissions {
  [key: string]: {
    c: boolean;
    r: boolean;
    u: boolean;
    d: boolean;
  };
}
