
import type { User, SubdomainApplication, Domain, AuditLog, HostingApplication, UserRole, RolePermissions } from './types';

export const MOCK_USERS: User[] = [
    { id: 'USR001', name: 'Administrator', email: 'admin@diskominfo.go.id', role: 'Administrator', status: 'active', nip: '197001011990031001', whatsapp: '081234567890', opd: 'Dinas Komunikasi dan Informatika' },
    { id: 'USR002', name: 'Super Admin', email: 'super.admin@diskominfo.go.id', role: 'Super Admin', status: 'active', nip: '197001011990031003', whatsapp: '081234567890', opd: 'Dinas Komunikasi dan Informatika' },
    { id: 'USR003', name: 'Ahmad Subarjo', email: 'ahmad.s@inspektorat.go.id', role: 'Operator', status: 'active', opd: 'Inspektorat', nip: '198502022005011002', whatsapp: '081234567891' },
    { id: 'USR004', name: 'Dr. Siti Nurbaya', email: 'siti.n@dinkes.go.id', role: 'Operator', status: 'active', opd: 'Dinas Kesehatan', nip: '198203032006042001', whatsapp: '081234567892' },
    { id: 'USR005', name: 'Auditor Utama', email: 'auditor.utama@inspektorat.go.id', role: 'Auditor', status: 'active', nip: 'AUDITOR001', whatsapp: '081234567893', opd: 'Inspektorat' },
    { id: 'USR006', name: 'Budi Santoso', email: 'budi.s@disdukcapil.go.id', role: 'Operator', status: 'active', opd: 'Disdukcapil', nip: '199004042010011003', whatsapp: '081234567894' },
    { id: 'USR007', name: 'Retno Wulandari', email: 'retno.w@bkpsdm.go.id', role: 'Operator', status: 'inactive', opd: 'BKPSDM', nip: '198805052009022004', whatsapp: '081234567895' },
    { id: 'USR008', name: 'Joko Susilo', email: 'joko.s@dpmptsp.go.id', role: 'Operator', status: 'active', opd: 'DPMPTSP', nip: '199206062014031005', whatsapp: '081234567896' },
];

export const MOCK_APPLICATIONS: SubdomainApplication[] = [
  {
    id: 'APP001',
    domainName: 'dinkes.kalbarprov.go.id',
    opd: 'Dinas Kesehatan',
    status: 'pending_approval',
    submittedDate: '2023-10-26',
    applicantName: 'Dr. Siti Nurbaya',
    description: 'Portal utama untuk informasi kesehatan dan layanan publik Dinas Kesehatan Provinsi Kalimantan Barat. Akan menampilkan berita, artikel, dan data statistik kesehatan.',
    documents: ['surat_permohonan_dinkes.pdf', 'kak_dinkes.pdf'],
  },
  {
    id: 'APP002',
    domainName: 'inspektorat.kalbarprov.go.id',
    opd: 'Inspektorat',
    status: 'approved',
    submittedDate: '2023-10-25',
    applicantName: 'Ahmad Subarjo',
    description: 'Sistem Informasi Manajemen Pengawasan (SIM-P) untuk keperluan internal Inspektorat Daerah. Digunakan untuk pelaporan dan tindak lanjut hasil pengawasan.',
    documents: ['surat_permohonan_inspektorat.pdf'],
  },
  {
    id: 'APP003',
    domainName: 'disdukcapil.kalbarprov.go.id',
    opd: 'Disdukcapil',
    status: 'pending_review',
    submittedDate: '2023-10-28',
    applicantName: 'Budi Santoso',
    description: 'Layanan online untuk pengurusan dokumen kependudukan, seperti Akta Kelahiran, Kartu Keluarga, dan KTP. Memerlukan integrasi dengan data kependudukan pusat.',
    documents: ['surat_permohonan_dukcapil.pdf'],
  },
  {
    id: 'APP004',
    domainName: 'bkpsdm.kalbarprov.go.id',
    opd: 'BKPSDM',
    status: 'rejected',
    submittedDate: '2023-10-22',
    applicantName: 'Retno Wulandari',
    description: 'Portal e-learning untuk pelatihan dan pengembangan kompetensi ASN di lingkungan Pemprov Kalbar.',
    documents: ['surat_permohonan_bkpsdm.pdf'],
    rejectionReason: 'Nama domain sudah terdaftar namun belum aktif. Mohon ajukan permohonan aktivasi.',
  },
  {
    id: 'APP005',
    domainName: 'covid19.kalbarprov.go.id',
    opd: 'Dinas Kesehatan',
    status: 'approved',
    submittedDate: '2023-09-15',
    applicantName: 'Dr. Siti Nurbaya',
    description: 'Dashboard informasi real-time mengenai perkembangan kasus COVID-19 di Kalimantan Barat. Telah berkoordinasi dengan tim satgas.',
    documents: ['surat_permohonan_covid.pdf'],
  },
];

export const MOCK_DOMAINS: Domain[] = [
    { id: 'DOM001', hostname: 'dinkes.kalbarprov.go.id', parentDomain: 'kalbarprov.go.id', status: 'pending', opd: 'Dinas Kesehatan', activationDate: '2023-10-29', ipAddress: '103.120.30.40', ttl: '3600', recordType: 'A', destination: '103.120.30.40' },
    { id: 'DOM002', hostname: 'inspektorat.kalbarprov.go.id', parentDomain: 'kalbarprov.go.id', status: 'active', opd: 'Inspektorat', activationDate: '2023-10-27', ipAddress: '103.120.30.41', ttl: '3600', recordType: 'A', destination: '103.120.30.41' },
    { id: 'DOM003', hostname: 'diskominfo.kalbarprov.go.id', parentDomain: 'kalbarprov.go.id', status: 'active', opd: 'Dinas Komunikasi dan Informatika', activationDate: '2022-01-15', ipAddress: '103.120.30.30', ttl: '3600', recordType: 'A', destination: '103.120.30.30' },
    { id: 'DOM004', hostname: 'bkpsdm.kalbarprov.go.id', parentDomain: 'kalbarprov.go.id', status: 'inactive', opd: 'BKPSDM', activationDate: '2023-01-20', expiryDate: '2024-01-20' },
    { id: 'DOM005', hostname: 'dpmptsp.kalbarprov.go.id', parentDomain: 'kalbarprov.go.id', status: 'error', opd: 'DPMPTSP', activationDate: '2023-05-10', description: 'Nameserver conflict' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'LOG001', user: 'Administrator', userRole: 'Administrator', action: 'APPROVE_APPLICATION', timestamp: '2023-10-28 14:30:15', details: 'Menyetujui permohonan untuk inspektorat.kalbarprov.go.id' },
    { id: 'LOG002', user: 'Super Admin', userRole: 'Super Admin', action: 'UPDATE_DOMAIN_INFO', timestamp: '2023-10-28 14:05:00', details: 'Memperbarui record DNS untuk diskominfo.kalbarprov.go.id' },
    { id: 'LOG003', user: 'Ahmad Subarjo', userRole: 'Operator', action: 'SUBMIT_APPLICATION', timestamp: '2023-10-28 11:15:45', details: 'Mengajukan permohonan untuk disdukcapil.kalbarprov.go.id' },
    { id: 'LOG004', user: 'Administrator', userRole: 'Administrator', action: 'REJECT_APPLICATION', timestamp: '2023-10-27 10:00:00', details: 'Menolak permohonan untuk bkpsdm.kalbarprov.go.id' },
    { id: 'LOG005', user: 'Auditor Utama', userRole: 'Auditor', action: 'VIEW_AUDIT_TRAIL', timestamp: '2023-10-27 09:00:00', details: 'Melihat log aktivitas sistem' },
    { id: 'LOG006', user: 'Super Admin', userRole: 'Super Admin', action: 'ADD_USER', timestamp: '2023-10-26 16:00:00', details: 'Menambahkan pengguna baru: Budi Santoso (Operator)' },
];

export const MOCK_HOSTING_APPLICATIONS: HostingApplication[] = [
    {
      id: 'HST001',
      applicationName: 'SI-ASN Terpadu',
      domainName: 'bkpsdm.kalbarprov.go.id',
      opd: 'BKPSDM',
      status: 'pending_review',
      submittedDate: '2023-10-29',
      applicantName: 'Retno Wulandari',
      description: 'Membutuhkan hosting untuk aplikasi Sistem Informasi ASN Terpadu berbasis Laravel. Perkiraan database 5GB dan trafik sedang.',
      framework: 'Laravel',
    },
    {
      id: 'HST002',
      applicationName: 'Portal Utama Diskominfo',
      domainName: 'diskominfo.kalbarprov.go.id',
      opd: 'Dinas Komunikasi dan Informatika',
      status: 'approved',
      submittedDate: '2023-09-01',
      applicantName: 'Super Admin',
      description: 'Hosting untuk portal utama Diskominfo. Dibangun menggunakan Next.js dengan trafik tinggi.',
      framework: 'Next.js',
    },
];

export const MOCK_ROLES: Record<UserRole, RolePermissions> = {
  'Super Admin': {
    'Manajemen Domain': { c: true, r: true, u: true, d: true },
    'Manajemen Hosting': { c: true, r: true, u: true, d: true },
    'Manajemen Pengguna': { c: true, r: true, u: true, d: true },
    'Manajemen Role': { c: true, r: true, u: true, d: true },
    'Audit Trail': { c: false, r: true, u: false, d: false },
    'Pengaturan Sistem': { c: true, r: true, u: true, d: true },
  },
  'Administrator': {
    'Manajemen Domain': { c: true, r: true, u: true, d: true },
    'Manajemen Hosting': { c: true, r: true, u: true, d: true },
    'Manajemen Pengguna': { c: true, r: true, u: true, d: true },
    'Manajemen Role': { c: false, r: true, u: false, d: false },
    'Audit Trail': { c: false, r: true, u: false, d: false },
    'Pengaturan Sistem': { c: false, r: true, u: false, d: false },
  },
  'Operator': {
    'Manajemen Domain': { c: true, r: true, u: false, d: false },
    'Manajemen Hosting': { c: true, r: true, u: false, d: false },
    'Manajemen Pengguna': { c: false, r: false, u: false, d: false },
    'Manajemen Role': { c: false, r: false, u: false, d: false },
    'Audit Trail': { c: false, r: false, u: false, d: false },
    'Pengaturan Sistem': { c: false, r: false, u: false, d: false },
  },
  'Auditor': {
    'Manajemen Domain': { c: false, r: true, u: false, d: false },
    'Manajemen Hosting': { c: false, r: true, u: false, d: false },
    'Manajemen Pengguna': { c: false, r: true, u: false, d: false },
    'Manajemen Role': { c: false, r: true, u: false, d: false },
    'Audit Trail': { c: false, r: true, u: false, d: false },
    'Pengaturan Sistem': { c: false, r: true, u: false, d: false },
  },
}
