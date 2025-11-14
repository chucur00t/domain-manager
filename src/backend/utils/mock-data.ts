/**
 * Mock Data for Domain Manager System
 * Aligned with database schema from schema-tables-only.sql
 * Updated: November 14, 2025
 */

import type {
  User,
  OPD,
  Application,
  Domain,
  Hosting,
  Document,
  AuditLog,
  Notification,
  MockUser,
  ApplicationType,
  ApplicationStatus,
  DomainStatus,
} from "@/backend/models/types";

// Helper functions to add compatibility aliases
export function addDomainAliases(domain: Domain): Domain {
  return {
    ...domain,
    hostname: domain.domain_name,
    expiryDate: domain.expires_at,
    activationDate: domain.activated_at,
  };
}

export function addApplicationAliases(app: Application): Application {
  return {
    ...app,
    submittedDate: app.submitted_at,
    submissionDate: app.submitted_at,
  };
}

export function addUserAliases(user: User): User {
  return {
    ...user,
    name: user.username,
    status: user.is_active ? 'active' : 'inactive',
  };
}

export const MOCK_ROLES = ["Super Admin", "Admin Daerah"];

// ============= OPDS DATA =============
export const MOCK_OPDS: OPD[] = [
  { 
    id: 1, 
    name: "Dinas Komunikasi dan Informatika", 
    address: "Jl. Asia Afrika No. 146, Bandung",
    contact_person: "Ir. Budi Santoso, M.T.",
    phone_number: "022-4233623",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 2, 
    name: "Dinas Pendidikan", 
    address: "Jl. Kawaluyaan Indah II No. 4, Bandung",
    contact_person: "Dr. Siti Nurhaliza, M.Pd.",
    phone_number: "022-7275147",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 3, 
    name: "Dinas Kesehatan", 
    address: "Jl. Citarum No. 34, Bandung",
    contact_person: "dr. Ahmad Wijaya, Sp.PD.",
    phone_number: "022-4222596",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 4, 
    name: "Dinas Pekerjaan Umum dan Penataan Ruang", 
    address: "Jl. Soekarno Hatta No. 590, Bandung",
    contact_person: "Ir. Dewi Kartika, M.T.",
    phone_number: "022-7566155",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 5, 
    name: "Dinas Sosial", 
    address: "Jl. Sancang No. 1, Bandung",
    contact_person: "Drs. Rudi Hartono, M.Si.",
    phone_number: "022-5226339",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 6, 
    name: "Dinas Perdagangan", 
    address: "Jl. Wastukencana No. 2, Bandung",
    contact_person: "Linda Kusuma, S.E., M.M.",
    phone_number: "022-4206372",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 7, 
    name: "Dinas Perindustrian dan Perdagangan", 
    address: "Jl. Asia Afrika No. 120, Bandung",
    contact_person: "Hendra Wijaya, S.T., M.T.",
    phone_number: "022-4232805",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 8, 
    name: "Dinas Kebudayaan dan Pariwisata", 
    address: "Jl. Kawaluyaan Indah II No. 7, Bandung",
    contact_person: "Maya Sari, S.Sn., M.A.",
    phone_number: "022-7275140",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 9, 
    name: "Dinas Kepemudaan dan Olahraga", 
    address: "Jl. Cicendo No. 2, Bandung",
    contact_person: "Agus Priyanto, S.Pd., M.Pd.",
    phone_number: "022-6014581",
    created_at: "2024-01-15 08:00:00"
  },
  { 
    id: 10, 
    name: "Dinas Pemberdayaan Perempuan dan Perlindungan Anak", 
    address: "Jl. Surapati No. 186, Bandung",
    contact_person: "Rina Andriani, S.Sos., M.A.P.",
    phone_number: "022-4206996",
    created_at: "2024-01-15 08:00:00"
  },
];

// ============= USERS DATA (Legacy format for compatibility) =============
export const MOCK_USERS: MockUser[] = [
  {
    id: "1",
    name: "Ahmad Supardi",
    email: "superadmin@bandung.go.id",
    role: "Super Admin",
    status: "active",
    nip: "198501012010011001",
    whatsapp: "081234567890",
    opd: "Dinas Komunikasi dan Informatika"
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "admin.diskominfo@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Komunikasi dan Informatika",
    nip: "198702152011012002",
    whatsapp: "081234567891",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "admin.disdik@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Pendidikan",
    nip: "198905202012011003",
    whatsapp: "081234567892",
  },
  {
    id: "4",
    name: "Dewi Kartika",
    email: "admin.dinkes@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Kesehatan",
    nip: "199003102013012004",
    whatsapp: "081234567893",
  },
  {
    id: "5",
    name: "Rudi Hartono",
    email: "admin.dpupr@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Pekerjaan Umum dan Penataan Ruang",
    nip: "198801252014011005",
    whatsapp: "081234567894",
  },
  {
    id: "6",
    name: "Linda Kusuma",
    email: "admin.dinsos@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Sosial",
    nip: "199107182015012006",
    whatsapp: "081234567895",
  },
  {
    id: "7",
    name: "Hendra Wijaya",
    email: "admin.disdag@bandung.go.id",
    role: "Admin Daerah",
    status: "inactive",
    opd: "Dinas Perdagangan",
    nip: "198612302016011007",
    whatsapp: "081234567896",
  },
  {
    id: "8",
    name: "Maya Sari",
    email: "admin.disperin@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Perindustrian dan Perdagangan",
    nip: "199204152017012008",
    whatsapp: "081234567897",
  },
  {
    id: "9",
    name: "Agus Priyanto",
    email: "admin.disbudpar@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Kebudayaan dan Pariwisata",
    nip: "198809222018011009",
    whatsapp: "081234567898",
  },
  {
    id: "10",
    name: "Rina Andriani",
    email: "admin.dispora@bandung.go.id",
    role: "Admin Daerah",
    status: "active",
    opd: "Dinas Kepemudaan dan Olahraga",
    nip: "199306282019012010",
    whatsapp: "081234567899",
  },
];

// ============= APPLICATIONS DATA (matches applications table) =============
export const MOCK_APPLICATIONS: Application[] = [
  // === APPROVED DOMAIN APPLICATIONS ===
  {
    id: 1,
    application_type: "domain",
    opd_id: 1,
    submitter_id: 2,
    status: "Approved",
    submitted_at: "2024-09-10 10:00:00",
    approved_at: "2024-09-12 14:30:00",
    last_updated_by: 1,
    opd: "Dinas Komunikasi dan Informatika",
    submitter_username: "admin.diskominfo",
    submitter_email: "admin.diskominfo@bandung.go.id"
  },
  {
    id: 2,
    application_type: "domain",
    opd_id: 2,
    submitter_id: 3,
    status: "Approved",
    submitted_at: "2024-10-01 09:15:00",
    approved_at: "2024-10-05 11:20:00",
    last_updated_by: 1,
    opd: "Dinas Pendidikan",
    submitter_username: "admin.disdik",
    submitter_email: "admin.disdik@bandung.go.id"
  },
  {
    id: 3,
    application_type: "domain",
    opd_id: 3,
    submitter_id: 4,
    status: "Approved",
    submitted_at: "2024-10-15 08:30:00",
    approved_at: "2024-10-20 10:15:00",
    last_updated_by: 1,
    opd: "Dinas Kesehatan",
    submitter_username: "admin.dinkes",
    submitter_email: "admin.dinkes@bandung.go.id"
  },
  {
    id: 4,
    application_type: "domain",
    opd_id: 4,
    submitter_id: 5,
    status: "Approved",
    submitted_at: "2024-07-25 14:20:00",
    approved_at: "2024-07-30 16:45:00",
    last_updated_by: 1,
    opd: "Dinas Pekerjaan Umum dan Penataan Ruang",
    submitter_username: "admin.dpupr",
    submitter_email: "admin.dpupr@bandung.go.id"
  },
  {
    id: 5,
    application_type: "domain",
    opd_id: 5,
    submitter_id: 6,
    status: "Approved",
    submitted_at: "2024-06-10 11:00:00",
    approved_at: "2024-06-15 13:30:00",
    last_updated_by: 1,
    opd: "Dinas Sosial",
    submitter_username: "admin.dinsos",
    submitter_email: "admin.dinsos@bandung.go.id"
  },
  // === PENDING DOMAIN APPLICATIONS ===
  {
    id: 6,
    application_type: "domain",
    opd_id: 3,
    submitter_id: 4,
    status: "Pending",
    submitted_at: "2025-11-10 10:30:00",
    opd: "Dinas Kesehatan",
    submitter_username: "admin.dinkes",
    submitter_email: "admin.dinkes@bandung.go.id"
  },
  {
    id: 7,
    application_type: "domain",
    opd_id: 2,
    submitter_id: 3,
    status: "Pending",
    submitted_at: "2025-11-08 09:45:00",
    opd: "Dinas Pendidikan",
    submitter_username: "admin.disdik",
    submitter_email: "admin.disdik@bandung.go.id"
  },
  // === REJECTED DOMAIN APPLICATION ===
  {
    id: 8,
    application_type: "domain",
    opd_id: 5,
    submitter_id: 6,
    status: "Rejected",
    reason: "Nama domain tidak sesuai dengan konvensi penamaan yang ditetapkan",
    submitted_at: "2025-10-20 13:15:00",
    approved_at: "2025-10-25 15:40:00",
    last_updated_by: 1,
    opd: "Dinas Sosial",
    submitter_username: "admin.dinsos",
    submitter_email: "admin.dinsos@bandung.go.id"
  },
  // === APPROVED HOSTING APPLICATIONS ===
  {
    id: 9,
    application_type: "hosting",
    opd_id: 1,
    submitter_id: 2,
    status: "Approved",
    submitted_at: "2024-09-15 11:00:00",
    approved_at: "2024-09-18 14:20:00",
    last_updated_by: 1,
    opd: "Dinas Komunikasi dan Informatika",
    submitter_username: "admin.diskominfo",
    submitter_email: "admin.diskominfo@bandung.go.id"
  },
  {
    id: 10,
    application_type: "hosting",
    opd_id: 2,
    submitter_id: 3,
    status: "Approved",
    submitted_at: "2024-10-10 10:30:00",
    approved_at: "2024-10-12 16:00:00",
    last_updated_by: 1,
    opd: "Dinas Pendidikan",
    submitter_username: "admin.disdik",
    submitter_email: "admin.disdik@bandung.go.id"
  },
  // === PENDING HOSTING APPLICATION ===
  {
    id: 11,
    application_type: "hosting",
    opd_id: 3,
    submitter_id: 4,
    status: "Pending",
    submitted_at: "2025-11-09 14:20:00",
    opd: "Dinas Kesehatan",
    submitter_username: "admin.dinkes",
    submitter_email: "admin.dinkes@bandung.go.id"
  },
];

// ============= DOMAINS DATA (matches domains table) =============
export const MOCK_DOMAINS: Domain[] = [
  {
    id: 1,
    application_id: 1,
    domain_name: "diskominfo.bandung.go.id",
    status: "Active",
    activated_at: "2024-09-20 08:00:00",
    expires_at: "2025-09-20 08:00:00",
    opd: "Dinas Komunikasi dan Informatika",
    opd_id: 1
  },
  {
    id: 2,
    application_id: 2,
    domain_name: "disdik.bandung.go.id",
    status: "Active",
    activated_at: "2024-10-15 09:00:00",
    expires_at: "2025-10-15 09:00:00",
    opd: "Dinas Pendidikan",
    opd_id: 2
  },
  {
    id: 3,
    application_id: 3,
    domain_name: "dinkes.bandung.go.id",
    status: "Active",
    activated_at: "2024-11-01 10:00:00",
    expires_at: "2025-11-01 10:00:00",
    opd: "Dinas Kesehatan",
    opd_id: 3
  },
  {
    id: 4,
    application_id: 4,
    domain_name: "dpupr.bandung.go.id",
    status: "Active",
    activated_at: "2024-08-10 08:30:00",
    expires_at: "2025-08-10 08:30:00",
    opd: "Dinas Pekerjaan Umum dan Penataan Ruang",
    opd_id: 4
  },
  {
    id: 5,
    application_id: 5,
    domain_name: "dinsos.bandung.go.id",
    status: "Suspended",
    activated_at: "2024-06-25 11:00:00",
    expires_at: "2025-06-25 11:00:00",
    opd: "Dinas Sosial",
    opd_id: 5
  },
];

// ============= HOSTINGS DATA (matches hostings table) =============
export const MOCK_HOSTINGS: Hosting[] = [
  {
    id: 1,
    application_id: 9,
    domain_id: 1,
    storage_capacity: "10GB",
    bandwidth: "100GB/month",
    server_type: "Shared Hosting",
    status: "Active",
    activated_at: "2024-09-20 08:30:00",
    domain_name: "diskominfo.bandung.go.id",
    opd: "Dinas Komunikasi dan Informatika",
    // Compatibility fields for UI
    applicationName: "Hosting Portal Diskominfo",
    domainName: "diskominfo.bandung.go.id",
    submittedDate: "2024-09-15 11:00:00",
    applicantName: "Siti Nurhaliza",
    framework: "Laravel 10",
    description: "Portal website resmi Dinas Komunikasi dan Informatika Kota Bandung"
  },
  {
    id: 2,
    application_id: 10,
    domain_id: 2,
    storage_capacity: "20GB",
    bandwidth: "200GB/month",
    server_type: "VPS",
    status: "Active",
    activated_at: "2024-10-15 09:30:00",
    domain_name: "disdik.bandung.go.id",
    opd: "Dinas Pendidikan",
    // Compatibility fields for UI
    applicationName: "Hosting PPDB Online",
    domainName: "disdik.bandung.go.id",
    submittedDate: "2024-10-10 10:30:00",
    applicantName: "Budi Santoso",
    framework: "Next.js 14",
    description: "Sistem Penerimaan Peserta Didik Baru Online"
  },
];

// ============= DOCUMENTS DATA (matches documents table) =============
export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 1,
    application_id: 1,
    file_name: "surat_permohonan_diskominfo.pdf",
    file_path: "/uploads/documents/2024/09/surat_permohonan_1.pdf",
    file_type: "application/pdf",
    uploaded_at: "2024-09-10 10:15:00"
  },
  {
    id: 2,
    application_id: 2,
    file_name: "surat_permohonan_disdik.pdf",
    file_path: "/uploads/documents/2024/10/surat_permohonan_2.pdf",
    file_type: "application/pdf",
    uploaded_at: "2024-10-01 09:30:00"
  },
  {
    id: 3,
    application_id: 3,
    file_name: "surat_permohonan_dinkes.pdf",
    file_path: "/uploads/documents/2024/10/surat_permohonan_3.pdf",
    file_type: "application/pdf",
    uploaded_at: "2024-10-15 08:45:00"
  },
  {
    id: 4,
    application_id: 9,
    file_name: "spesifikasi_hosting_diskominfo.pdf",
    file_path: "/uploads/documents/2024/09/spesifikasi_hosting_1.pdf",
    file_type: "application/pdf",
    uploaded_at: "2024-09-15 11:20:00"
  },
  {
    id: 5,
    application_id: 10,
    file_name: "spesifikasi_hosting_disdik.pdf",
    file_path: "/uploads/documents/2024/10/spesifikasi_hosting_2.pdf",
    file_type: "application/pdf",
    uploaded_at: "2024-10-10 10:45:00"
  },
];

// ============= AUDIT LOGS DATA (matches audit_logs table) =============
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    application_id: 1,
    action: "APPROVE_APPLICATION",
    details: "Menyetujui permohonan domain diskominfo.bandung.go.id",
    timestamp: "2024-09-12 14:30:00",
    username: "superadmin",
    user_role: "Super Admin"
  },
  {
    id: 2,
    user_id: 1,
    application_id: 2,
    action: "APPROVE_APPLICATION",
    details: "Menyetujui permohonan domain disdik.bandung.go.id",
    timestamp: "2024-10-05 11:20:00",
    username: "superadmin",
    user_role: "Super Admin"
  },
  {
    id: 3,
    user_id: 1,
    application_id: 3,
    action: "APPROVE_APPLICATION",
    details: "Menyetujui permohonan domain dinkes.bandung.go.id",
    timestamp: "2024-10-20 10:15:00",
    username: "superadmin",
    user_role: "Super Admin"
  },
  {
    id: 4,
    user_id: 1,
    application_id: 8,
    action: "REJECT_APPLICATION",
    details: "Menolak permohonan domain: Nama domain tidak sesuai konvensi",
    timestamp: "2025-10-25 15:40:00",
    username: "superadmin",
    user_role: "Super Admin"
  },
  {
    id: 5,
    user_id: 2,
    application_id: 1,
    action: "SUBMIT_APPLICATION",
    details: "Mengajukan permohonan domain diskominfo.bandung.go.id",
    timestamp: "2024-09-10 10:00:00",
    username: "admin.diskominfo",
    user_role: "Admin Daerah"
  },
  {
    id: 6,
    user_id: 3,
    application_id: 2,
    action: "SUBMIT_APPLICATION",
    details: "Mengajukan permohonan domain disdik.bandung.go.id",
    timestamp: "2024-10-01 09:15:00",
    username: "admin.disdik",
    user_role: "Admin Daerah"
  },
  {
    id: 7,
    user_id: 4,
    application_id: 3,
    action: "SUBMIT_APPLICATION",
    details: "Mengajukan permohonan domain dinkes.bandung.go.id",
    timestamp: "2024-10-15 08:30:00",
    username: "admin.dinkes",
    user_role: "Admin Daerah"
  },
  {
    id: 8,
    user_id: 1,
    action: "ACTIVATE_DOMAIN",
    details: "Mengaktifkan domain diskominfo.bandung.go.id",
    timestamp: "2024-09-20 08:00:00",
    username: "superadmin",
    user_role: "Super Admin"
  },
  {
    id: 9,
    user_id: 1,
    action: "SUSPEND_DOMAIN",
    details: "Menangguhkan domain dinsos.bandung.go.id untuk maintenance",
    timestamp: "2025-11-09 16:40:00",
    username: "superadmin",
    user_role: "Super Admin"
  },
  {
    id: 10,
    user_id: 1,
    action: "LOGIN",
    details: "Super Admin masuk ke sistem",
    timestamp: "2025-11-14 08:00:00",
    username: "superadmin",
    user_role: "Super Admin"
  },
];

// ============= NOTIFICATIONS DATA (matches notifications table) =============
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user_id: 2,
    message: "Permohonan domain diskominfo.bandung.go.id telah disetujui",
    type: "domain",
    status: "read",
    related_entity_type: "application",
    related_entity_id: 1,
    link: "/applications/1",
    created_at: "2024-09-12 14:35:00",
    read_at: "2024-09-12 15:00:00",
    expires_at: "2025-03-12 14:35:00",
    is_email_sent: true
  },
  {
    id: 2,
    user_id: 3,
    message: "Permohonan domain disdik.bandung.go.id telah disetujui",
    type: "domain",
    status: "read",
    related_entity_type: "application",
    related_entity_id: 2,
    link: "/applications/2",
    created_at: "2024-10-05 11:25:00",
    read_at: "2024-10-05 12:00:00",
    expires_at: "2025-04-05 11:25:00",
    is_email_sent: true
  },
  {
    id: 3,
    user_id: 4,
    message: "Domain dinkes.bandung.go.id akan kedaluwarsa dalam 30 hari",
    type: "perpanjangan",
    status: "unread",
    related_entity_type: "domain",
    related_entity_id: 3,
    link: "/domains/3",
    created_at: "2025-11-01 08:00:00",
    expires_at: "2026-05-01 08:00:00",
    is_email_sent: true
  },
  {
    id: 4,
    user_id: 6,
    message: "Domain dinsos.bandung.go.id telah ditangguhkan",
    type: "suspensi",
    status: "unread",
    related_entity_type: "domain",
    related_entity_id: 5,
    link: "/domains/5",
    created_at: "2025-11-09 16:45:00",
    expires_at: "2026-05-09 16:45:00",
    is_email_sent: true
  },
  {
    id: 5,
    user_id: 1,
    message: "Ada 2 permohonan domain baru menunggu persetujuan",
    type: "system",
    status: "unread",
    link: "/applications",
    created_at: "2025-11-10 11:00:00",
    expires_at: "2026-05-10 11:00:00",
    is_email_sent: false
  },
];

// Export with compatibility aliases automatically added
export const MOCK_DOMAINS_WITH_ALIASES = MOCK_DOMAINS.map(addDomainAliases);
export const MOCK_APPLICATIONS_WITH_ALIASES = MOCK_APPLICATIONS.map(addApplicationAliases);

// Export legacy compatibility
export const MOCK_APPLICATIONS_LEGACY = MOCK_APPLICATIONS;
export const MOCK_DOMAINS_LEGACY = MOCK_DOMAINS;
export const MOCK_HOSTING_APPLICATIONS = MOCK_HOSTINGS;
