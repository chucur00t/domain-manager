import type { SubdomainApplication, Domain, User, AuditLog, HostingApplication } from '@/backend/models/types';

export const MOCK_ROLES = [
  'Super Admin',
  'Admin Daerah'
];

export const MOCK_USERS: User[] = [
  {
    id: 'user1',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'Super Admin',
    status: 'active',
    nip: 'NIP123456',
    whatsapp: '081234567890'
  },
  {
    id: 'user2',
    name: 'Operator OPD',
    email: 'opd@example.com',
    role: 'Admin Daerah',
    status: 'active',
    opd: 'Dinas XYZ',
    nip: 'NIP789012',
    whatsapp: '081234567891'
  }
];

export const MOCK_DOMAINS: Domain[] = [
  {
    id: 'domain1',
    hostname: 'test.bandung.go.id',
    status: 'active',
    expiryDate: '2024-12-31',
    opd: 'Dinas Kesehatan'
  },
  {
    id: 'domain2',
    hostname: 'demo.bandung.go.id',
    status: 'active',
    expiryDate: '2024-12-31',
    opd: 'Dinas Pendidikan'
  }
];

export const MOCK_APPLICATIONS: SubdomainApplication[] = [
  {
    id: 'app1',
    userId: 'user2',
    domainName: 'newapp.bandung.go.id',
    purpose: 'Website OPD',
    status: 'pending',
    submissionDate: '2024-01-15',
    opd: 'Dinas XYZ'
  },
  {
    id: 'app2',
    userId: 'user2',
    domainName: 'project.bandung.go.id',
    purpose: 'Project Website',
    status: 'approved',
    submissionDate: '2024-01-10',
    approvalDate: '2024-01-12',
    opd: 'Dinas XYZ'
  }
];

export const MOCK_HOSTING_APPLICATIONS: HostingApplication[] = [
  {
    id: 'host1',
    userId: 'user2',
    applicationName: 'E-Health System',
    description: 'Healthcare management system',
    framework: 'Laravel',
    domainName: 'health.bandung.go.id',
    status: 'pending',
    submittedDate: '2024-01-15',
    opd: 'Dinas Kesehatan',
    applicantName: 'Dr. Admin'
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log1',
    timestamp: '2024-01-15T08:00:00Z',
    userId: 'user1',
    action: 'create',
    resourceType: 'domain',
    resourceId: 'domain1',
    description: 'Created new domain test.bandung.go.id'
  },
  {
    id: 'log2',
    timestamp: '2024-01-15T09:00:00Z',
    userId: 'user2',
    action: 'create',
    resourceType: 'application',
    resourceId: 'app1',
    description: 'Submitted new subdomain application'
  }
];
