// Safe mock data types to avoid mysql2 conflicts
import type { SubdomainApplication, User, AuditLog, HostingApplication, UserRole, UserStatus } from '@/backend/models/types';

interface MockDomain {
  id: string;
  hostname: string;
  status: string;
  expiryDate: string;
  opd: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  nip?: string;
  whatsapp?: string;
  opd?: string;
}

export const MOCK_ROLES = [
  'Super Admin',
  'Admin Daerah'
];

export const MOCK_OPDS = [
  { id: 1, name: 'Dinas Kesehatan' },
  { id: 2, name: 'Dinas Pendidikan' },
  { id: 3, name: 'Dinas Komunikasi dan Informatika' },
  { id: 4, name: 'Dinas Pekerjaan Umum' },
  { id: 5, name: 'Dinas Sosial' },
  { id: 6, name: 'Dinas Perdagangan' },
  { id: 7, name: 'Dinas Perindustrian' },
  { id: 8, name: 'Dinas Kebudayaan' },
  { id: 9, name: 'Dinas Kepemudaan dan Olahraga' },
  { id: 10, name: 'Dinas Perlindungan Anak dan Keluarga Berencana' }
];

export const MOCK_USERS: MockUser[] = [
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
    opd: 'Dinas Komunikasi dan Informatika',
    nip: 'NIP789012',
    whatsapp: '081234567891'
  }
];

export const MOCK_DOMAINS: MockDomain[] = [
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
