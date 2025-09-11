
export type Domain = {
  id: string;
  hostname: string;
  parentDomain: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  opd: string;
  activationDate: string;
  expiryDate?: string;
  ipAddress?: string;
  nameserver?: string;
  ttl?: string;
  recordType?: string;
  destination?: string;
  priority?: string;
  description?: string;
};

export type SubdomainApplication = {
  id: string;
  domainName: string;
  opd: string; // Organisasi Perangkat Daerah
  status: 'pending_review' | 'pending_approval' | 'approved' | 'rejected';
  submittedDate: string;
  applicantName: string;
  description: string;
  documents: string[];
  rejectionReason?: string;
};

export type HostingApplication = {
  id: string;
  applicationName: string;
  domainName: string;
  opd: string;
  status: 'pending_review' | 'pending_approval' | 'approved' | 'rejected';
  submittedDate: string;
  applicantName: string;
  description: string;
  framework: 'Next.js' | 'Laravel' | 'CMS' | 'Lainnya';
  rejectionReason?: string;
};

export type UserRole = 'Super Admin' | 'Administrator' | 'Operator' | 'Auditor';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  opd?: string;
  nip?: string;
  whatsapp?: string;
};

export type AuditLog = {
  id: string;
  user: string;
  userRole: User['role'];
  action: string;
  timestamp: string; // ISO 8601 format
  details: string;
};

export type Permission = {
  c: boolean;
  r: boolean;
  u: boolean;
  d: boolean;
}

export type RolePermissions = {
  [key: string]: Permission;
}
