# Analisis Fitur Persetujuan Deaktivasi Domain untuk Super Admin

## 📋 Ringkasan Fitur

Super Admin dapat meninjau dan memberikan keputusan (menyetujui/menolak) terhadap permintaan deaktivasi domain yang diajukan oleh Admin Daerah.

**Input:**

- ID permohonan Deaktivasi
- Keputusan (setujui/tolak)
- Alasan/komentar

---

## 🔧 Bagian yang Perlu Diubah

### 1. **DATABASE SCHEMA** ⚠️ PRIORITAS TINGGI

#### File: `src/backend/database/schema-tables-only.sql`

**Perlu Ditambahkan:**

```sql
-- Tabel baru untuk menyimpan permohonan deaktivasi
CREATE TABLE deactivation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    requester_id INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' COMMENT 'Pending, Approved, Rejected',
    decision_comment TEXT,
    decided_by INT,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP NULL,

    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_domain_id (domain_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel untuk dokumen pendukung deaktivasi
CREATE TABLE deactivation_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deactivation_request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (deactivation_request_id) REFERENCES deactivation_requests(id) ON DELETE CASCADE,
    INDEX idx_request_id (deactivation_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Alasan:** Perlu tabel terpisah untuk menyimpan permohonan deaktivasi agar dapat dilacak statusnya dan memiliki workflow approval.

---

### 2. **TYPES/INTERFACES** ⚠️ PRIORITAS TINGGI

#### File: `src/backend/models/types.ts`

**Perlu Ditambahkan:**

```typescript
// Deactivation Request Status
export type DeactivationRequestStatus = "Pending" | "Approved" | "Rejected";

// Deactivation Request interface
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
  requester_opd?: string;
  decider_name?: string;
  documents?: DeactivationDocument[];
}

// Deactivation Document interface
export interface DeactivationDocument {
  id: number;
  deactivation_request_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}
```

**Alasan:** TypeScript memerlukan interface yang jelas untuk type safety dan IntelliSense.

---

### 3. **DATABASE SERVICE LAYER** ⚠️ PRIORITAS TINGGI

#### File Baru: `src/backend/database/services/deactivation-request.service.ts`

**Perlu Dibuat:**

```typescript
import { db } from "../config";
import type {
  DeactivationRequest,
  DeactivationDocument,
} from "@/backend/models/types";

export class DeactivationRequestService {
  // Create deactivation request
  async createDeactivationRequest(data: {
    domain_id: number;
    requester_id: number;
    reason: string;
  }): Promise<number>;

  // Get all deactivation requests with filters
  async getDeactivationRequests(filters?: {
    status?: string;
    domain_id?: number;
    opd_id?: number;
  }): Promise<DeactivationRequest[]>;

  // Get single deactivation request by ID
  async getDeactivationRequestById(
    id: number
  ): Promise<DeactivationRequest | null>;

  // Approve deactivation request
  async approveDeactivationRequest(
    id: number,
    decided_by: number,
    comment?: string
  ): Promise<void>;

  // Reject deactivation request
  async rejectDeactivationRequest(
    id: number,
    decided_by: number,
    comment: string
  ): Promise<void>;

  // Upload document for deactivation request
  async addDocument(data: {
    deactivation_request_id: number;
    file_name: string;
    file_path: string;
    file_type: string;
  }): Promise<number>;

  // Get documents for deactivation request
  async getDocuments(
    deactivation_request_id: number
  ): Promise<DeactivationDocument[]>;
}
```

**Alasan:** Memisahkan business logic dari controller dan menyediakan reusable methods.

---

### 4. **API ENDPOINTS** ⚠️ PRIORITAS TINGGI

#### File Baru: `src/app/api/deactivation-requests/route.ts`

**Endpoint GET - List semua permohonan:**

```typescript
// GET /api/deactivation-requests?status=Pending&opd_id=1
export async function GET(request: NextRequest) {
  // Return list of deactivation requests with filters
}
```

**Endpoint POST - Create permohonan baru:**

```typescript
// POST /api/deactivation-requests
export async function POST(request: NextRequest) {
  // Create new deactivation request
  // Handle file uploads
}
```

#### File Baru: `src/app/api/deactivation-requests/[id]/route.ts`

**Endpoint GET - Detail permohonan:**

```typescript
// GET /api/deactivation-requests/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return single deactivation request with details
}
```

**Endpoint PATCH - Approve/Reject:**

```typescript
// PATCH /api/deactivation-requests/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Approve or reject deactivation request
  // Update domain status if approved
  // Create audit log
  // Send notification
}
```

**Alasan:** API endpoints diperlukan untuk CRUD operations dari frontend.

---

### 5. **NAVIGATION MENU** ⚠️ PRIORITAS SEDANG

#### File: `src/frontend/components/layout/main-nav.tsx`

**Perubahan pada subItems Super Admin Persetujuan:**

```typescript
// SUPER ADMIN: Menu Persetujuan (untuk menyetujui permohonan)
{
  href: (role) => "#",
  label: "Persetujuan",
  icon: ClipboardCheck,
  roles: ["Super Admin"],
  subItems: [
    {
      href: (role) =>
        `/super-admin/applications?role=${encodeURIComponent(role)}`,
      label: "Permohonan Domain",
      icon: FileText,
      roles: ["Super Admin"],
    },
    {
      href: (role) =>
        `/super-admin/hosting-applications?role=${encodeURIComponent(role)}`,
      label: "Permohonan Hosting",
      icon: Server,
      roles: ["Super Admin"],
    },
    // ✅ TAMBAHKAN INI
    {
      href: (role) =>
        `/super-admin/deactivation-requests?role=${encodeURIComponent(role)}`,
      label: "Permohonan Deaktivasi",
      icon: Globe, // atau icon lain seperti XCircle
      roles: ["Super Admin"],
    },
  ],
},
```

**Alasan:** Super Admin perlu akses menu untuk melihat permohonan deaktivasi.

---

### 6. **HALAMAN SUPER ADMIN - LIST PERMOHONAN** ⚠️ PRIORITAS TINGGI

#### File Baru: `src/app/(app)/super-admin/deactivation-requests/page.tsx`

**Fitur yang perlu ada:**

- Tabel list permohonan deaktivasi
- Filter berdasarkan status (Pending, Approved, Rejected)
- Filter berdasarkan OPD
- Search berdasarkan domain name
- Action button untuk review permohonan
- Badge untuk status
- Informasi lengkap: Domain, OPD, Pemohon, Tanggal, Status

**Contoh struktur:**

```typescript
export default function DeactivationRequestsPage() {
  const [requests, setRequests] = useState<DeactivationRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "Approved" | "Rejected"
  >("all");

  // Fetch data dari API
  // Filter data
  // Display table dengan actions
}
```

**Alasan:** Halaman utama untuk Super Admin melihat semua permohonan.

---

### 7. **HALAMAN SUPER ADMIN - DETAIL & APPROVAL** ⚠️ PRIORITAS TINGGI

#### File Baru: `src/app/(app)/super-admin/deactivation-requests/[id]/page.tsx`

**Fitur yang perlu ada:**

- Informasi lengkap domain yang akan dideaktivasi
- Detail pemohon (nama, OPD, kontak)
- Alasan deaktivasi dari Admin Daerah
- Download dokumen pendukung
- Form keputusan:
  - Radio button: Setujui / Tolak
  - Textarea: Alasan/Komentar
  - Button: Kirim Keputusan
- Riwayat status (jika ada)

**Contoh struktur:**

```typescript
export default function DeactivationRequestDetailPage() {
  const [request, setRequest] = useState<DeactivationRequest | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [comment, setComment] = useState("");

  // Handle submit approval/rejection
  const handleSubmit = async () => {
    // Call API to approve/reject
    // Update domain status if approved
    // Show success message
    // Redirect
  };
}
```

**Alasan:** Halaman detail untuk review dan keputusan permohonan.

---

### 8. **UPDATE HALAMAN ADMIN DAERAH** ⚠️ PRIORITAS SEDANG

#### File: `src/app/(app)/domains/deactivate/page.tsx`

**Perubahan yang diperlukan:**

- Integrasi dengan API endpoint `/api/deactivation-requests`
- Upload file dokumen pendukung ke server
- Validasi form lebih ketat
- Error handling yang lebih baik
- Success notification dengan redirect

**Yang perlu diubah:**

```typescript
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();

  // Prepare FormData untuk file upload
  const formData = new FormData();
  formData.append("domain_id", formData.domainId);
  formData.append("reason", formData.reason);
  formData.documents.forEach((file) => {
    formData.append("documents", file);
  });

  // POST ke /api/deactivation-requests
  const response = await fetch("/api/deactivation-requests", {
    method: "POST",
    body: formData,
  });

  // Handle response
};
```

**Alasan:** Integrasi dengan backend real (bukan simulasi).

---

### 9. **NOTIFICATIONS** ⚠️ PRIORITAS SEDANG

#### File: `src/backend/services/notification.service.ts`

**Perlu ditambahkan method:**

```typescript
// Notification untuk Admin Daerah saat permohonan dibuat
async notifyDeactivationRequestCreated(
  request: DeactivationRequest
): Promise<void>;

// Notification untuk Super Admin saat ada permohonan baru
async notifyNewDeactivationRequest(
  request: DeactivationRequest
): Promise<void>;

// Notification untuk Admin Daerah saat permohonan disetujui
async notifyDeactivationRequestApproved(
  request: DeactivationRequest
): Promise<void>;

// Notification untuk Admin Daerah saat permohonan ditolak
async notifyDeactivationRequestRejected(
  request: DeactivationRequest
): Promise<void>;
```

**Alasan:** User perlu notifikasi otomatis tentang status permohonan.

---

### 10. **AUDIT TRAIL** ⚠️ PRIORITAS SEDANG

#### File: `src/backend/services/audit.service.ts`

**Action baru yang perlu dicatat:**

```typescript
// Audit actions untuk deactivation requests
"CREATE_DEACTIVATION_REQUEST";
"APPROVE_DEACTIVATION_REQUEST";
"REJECT_DEACTIVATION_REQUEST";
"UPDATE_DEACTIVATION_REQUEST";
```

**Integration points:**

- Saat Admin Daerah submit permohonan
- Saat Super Admin approve/reject
- Saat domain status berubah karena approval

**Alasan:** Tracking semua aktivitas penting untuk compliance dan debugging.

---

### 11. **DOMAIN STATUS UPDATE** ⚠️ PRIORITAS TINGGI

#### File: `src/backend/database/services/domain.service.ts`

**Method yang perlu di-update/tambahkan:**

```typescript
// Update domain status saat deactivation request approved
async deactivateDomainByRequest(
  domain_id: number,
  deactivation_request_id: number
): Promise<void> {
  // Update domain status to 'Expired' or 'Deactivated'
  // Log the change
  // Update expires_at if needed
}
```

**Alasan:** Domain status perlu berubah otomatis saat permohonan disetujui.

---

### 12. **MOCK DATA (DEVELOPMENT)** ⚠️ PRIORITAS RENDAH

#### File: `src/backend/utils/mock-data.ts`

**Perlu ditambahkan:**

```typescript
export const MOCK_DEACTIVATION_REQUESTS: DeactivationRequest[] = [
  {
    id: 1,
    domain_id: 1,
    requester_id: 2,
    reason: "Domain tidak lagi digunakan untuk layanan...",
    status: "Pending",
    requested_at: "2025-11-15 10:00:00",
    domain_name: "diskominfo.kalbarprov.go.id",
    requester_name: "Rina Kusumawati",
    requester_opd: "Dinas Komunikasi dan Informatika",
  },
  // ... more mock data
];
```

**Alasan:** Untuk testing UI tanpa backend yang lengkap.

---

### 13. **DASHBOARD SUPER ADMIN** ⚠️ PRIORITAS RENDAH

#### File: `src/app/(app)/super-admin/dashboard/page.tsx`

**Perlu ditambahkan card/widget:**

- Jumlah permohonan deaktivasi pending
- Link cepat ke halaman permohonan deaktivasi
- Statistik approve/reject ratio

**Alasan:** Dashboard overview untuk Super Admin.

---

### 14. **COMPONENTS REUSABLE** ⚠️ PRIORITAS SEDANG

#### File Baru: `src/frontend/components/features/deactivation/deactivation-request-table.tsx`

**Component untuk:**

- Table list permohonan deaktivasi
- Filter dan search
- Actions (Review, View Details)
- Status badges

**Alasan:** Reusable component untuk konsistensi UI.

---

## 📊 Priority Matrix

### 🔴 PRIORITAS TINGGI (Harus dibuat dulu)

1. Database Schema (Tabel baru)
2. Types/Interfaces
3. Database Service Layer
4. API Endpoints
5. Halaman Super Admin - List & Detail
6. Domain Status Update Logic

### 🟡 PRIORITAS SEDANG (Penting tapi bisa menyusul)

7. Navigation Menu Update
8. Update Halaman Admin Daerah (integrasi API)
9. Notifications
10. Audit Trail
11. Reusable Components

### 🟢 PRIORITAS RENDAH (Nice to have)

12. Mock Data
13. Dashboard Widget
14. Email Notifications
15. Export to Excel/PDF

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN DAERAH                               │
│  1. Pilih Domain Aktif                                          │
│  2. Isi Alasan Deaktivasi                                       │
│  3. Upload Dokumen Pendukung                                    │
│  4. Submit Permohonan                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE                                   │
│  - deactivation_requests (status: Pending)                      │
│  - deactivation_documents                                       │
│  - notifications (Admin Daerah & Super Admin)                   │
│  - audit_logs (CREATE_DEACTIVATION_REQUEST)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                                │
│  1. Lihat List Permohonan (Filter: Pending)                     │
│  2. Klik Detail Permohonan                                      │
│  3. Review Alasan & Dokumen                                     │
│  4. Pilih Keputusan: Setujui / Tolak                           │
│  5. Isi Komentar/Alasan                                         │
│  6. Submit Keputusan                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PROCESSING                                 │
│  IF APPROVED:                                                   │
│    - Update deactivation_requests (status: Approved)            │
│    - Update domains (status: Expired/Deactivated)               │
│    - Create notification (Admin Daerah)                         │
│    - Create audit_log (APPROVE_DEACTIVATION_REQUEST)            │
│    - Create audit_log (DEACTIVATE_DOMAIN)                       │
│  IF REJECTED:                                                   │
│    - Update deactivation_requests (status: Rejected)            │
│    - Create notification (Admin Daerah)                         │
│    - Create audit_log (REJECT_DEACTIVATION_REQUEST)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Kesimpulan

**Total File yang Perlu Dibuat/Diubah:** 14+ files

**Estimasi Waktu Implementasi:**

- Database & Backend: 4-6 jam
- API Endpoints: 2-3 jam
- Frontend Pages: 4-5 jam
- Integration & Testing: 2-3 jam
- **Total: 12-17 jam**

**Dependency Order:**

1. Database Schema → Types → Service Layer
2. API Endpoints → Frontend Pages
3. Navigation → Notifications → Audit Trail
4. Mock Data → Testing → Documentation

**Rekomendasi:**

- Buat dalam sprint kecil, test setiap layer
- Gunakan mock data untuk testing UI dulu
- Implement notification setelah core functionality berjalan
- Tambahkan validasi yang ketat di setiap layer
