# 📊 Analisis Dashboard: Super Admin & Admin Daerah

**Tanggal:** November 11, 2025  
**Branch:** chaca  
**Status:** Komprehensif

---

## 📁 Struktur File Dashboard

```
src/
├── frontend/components/features/
│   ├── super-admin/dashboard/
│   │   ├── super-admin-dashboard.tsx           ✅ Component Dashboard
│   │   ├── super-admin-applications-table.tsx  ✅ Table Component
│   │   └── index.ts                            ✅ Export file
│   │
│   └── admin-daerah/dashboard/
│       ├── admin-daerah-dashboard.tsx          ✅ Component Dashboard
│       └── index.ts                            ✅ Export file
│
└── app/(app)/
    ├── super-admin/dashboard/
    │   └── page.tsx                            ✅ Route Page
    │
    └── dashboard/
        └── page.tsx                            ✅ Route Page (Admin Daerah)
```

---

## 🎯 1. SUPER ADMIN DASHBOARD

### 📄 File: `super-admin-dashboard.tsx`

**Lokasi:** `src/frontend/components/features/super-admin/dashboard/`  
**Baris Code:** 221 lines

### 🔑 Props Interface

```typescript
type Props = {
  role: User["role"];
};
```

### 📊 State Management

```typescript
const [isLoading, setIsLoading] = useState(true);
const [stats, setStats] = useState({
  activeDomainsCount: 0,
  pendingApplicationsCount: 0,
  totalUsersCount: 0,
  totalOpdCount: 0,
});
const [applicationsByOpd, setApplicationsByOpd] = useState<
  { opd: string; applications: number }[]
>([]);
const [recentApplications, setRecentApplications] = useState<
  SubdomainApplication[]
>([]);
```

### 🔄 Data Fetching (useEffect)

```typescript
useEffect(() => {
  const fetchData = async () => {
    // 1. Fetch 3 APIs secara parallel
    const [domainsRes, appsRes, usersRes] = await Promise.all([
      fetch("/api/domains"),
      fetch("/api/applications"),
      fetch("/api/users"),
    ]);

    // 2. Parse responses
    const domains: Domain[] = await domainsRes.json();
    const applications: SubdomainApplication[] = await appsRes.json();
    const users: User[] = await usersRes.json();

    // 3. Process data untuk statistics
    // 4. Process data untuk charts
    // 5. Process data untuk recent applications table
  };

  fetchData();
}, []);
```

### 📈 Fungsi-Fungsi Utama

#### 1. **Statistics Calculation**

```typescript
// Active Domains Count
activeDomainsCount: domains.filter((d) => d.status === "active").length;

// Pending Applications Count
pendingApplicationsCount: applications.filter(
  (a) => a.status === "pending_review"
).length;

// Total Users Count
totalUsersCount: users.length;

// Total OPD Count
totalOpdCount: [...new Set(applications.map((app) => app.opd))].length;
```

#### 2. **Applications by OPD (Top 5)**

```typescript
const opdList = [...new Set(applications.map((app) => app.opd))];
const appCounts = opdList
  .map((opd) => ({
    opd,
    applications: applications.filter((app) => app.opd === opd).length,
  }))
  .sort((a, b) => b.applications - a.applications)
  .slice(0, 5);
```

**Output:** Array of top 5 OPDs dengan jumlah aplikasi terbanyak

#### 3. **Recent Applications (Latest 5)**

```typescript
const sortedRecent = [...applications]
  .filter((a) => a.status === "pending_review")
  .sort((a, b) => {
    const dateA = a.submittedDate || a.submissionDate || "";
    const dateB = b.submittedDate || b.submissionDate || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  })
  .slice(0, 5);
```

**Output:** 5 permohonan terbaru yang pending review, sorted by date descending

#### 4. **Page Title Generator**

```typescript
const getPageTitle = () => {
  switch (role) {
    case "Super Admin":
      return "Dashboard Super Admin";
    default:
      return "Dashboard Pengelola";
  }
};
```

### 🎨 UI Components

#### **4 Stat Cards:**

1. **Total Domain Aktif**

   - Icon: Globe
   - Value: `stats.activeDomainsCount`
   - Description: "Jumlah seluruh domain yang aktif."

2. **Permohonan Perlu Direview**

   - Icon: FileText (amber-500)
   - Value: `stats.pendingApplicationsCount`
   - Description: "Permohonan yang menunggu review teknis."

3. **Total Pengguna**

   - Icon: Users
   - Value: `stats.totalUsersCount`
   - Description: "Jumlah pengguna terdaftar di sistem."

4. **Total OPD Terdaftar**
   - Icon: Building
   - Value: `stats.totalOpdCount`
   - Description: "Jumlah OPD yang telah mengajukan."

#### **2 Cards dengan Charts/Tables:**

**Card 1: Bar Chart - Aktivitas Permohonan per OPD (Top 5)**

```typescript
<BarChart
  data={applicationsByOpd}
  margin={{ top: 20, right: 20, bottom: 0, left: -20 }}
>
  <CartesianGrid vertical={false} />
  <XAxis
    dataKey="opd"
    tickFormatter={(value) =>
      value.length > 12 ? `${value.slice(0, 12)}...` : value
    }
  />
  <YAxis />
  <Bar dataKey="applications" fill="var(--color-applications)" radius={4} />
</BarChart>
```

- **X-Axis:** Nama OPD (truncated jika > 12 char)
- **Y-Axis:** Jumlah aplikasi
- **Data:** Top 5 OPDs dengan aplikasi terbanyak

**Card 2: Table - Permohonan Terbaru untuk Direview**

```typescript
<SuperAdminApplicationsTable applications={recentApplications} />
```

- Menampilkan 5 permohonan terbaru
- Columns: Nama Subdomain, OPD, Status
- Link ke detail application

### 🔄 Loading State

```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
```

---

## 📋 SuperAdminApplicationsTable Component

### 📄 File: `super-admin-applications-table.tsx`

**Lokasi:** `src/frontend/components/features/super-admin/dashboard/`  
**Baris Code:** 84 lines

### 🔑 Props Interface

```typescript
{
  applications: SubdomainApplication[];
}
```

### 🎨 Status Configuration

```typescript
const statusConfig = {
  pending: { text: "Menunggu", variant: "default" as const },
  pending_review: { text: "Review Admin", variant: "default" as const },
  pending_approval: { text: "Persetujuan Kabid", variant: "default" as const },
  approved: { text: "Disetujui", variant: "secondary" as const },
  rejected: { text: "Ditolak", variant: "destructive" as const },
};
```

### 📊 Table Structure

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nama Subdomain</TableHead>
      <TableHead>OPD</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {applications.map((app) => (
      <TableRow key={app.id}>
        <TableCell>
          <Link href={`/applications/${app.id}${roleQuery}`}>
            {app.domainName}
          </Link>
        </TableCell>
        <TableCell>{app.opd}</TableCell>
        <TableCell>
          <Badge variant={statusConfig[app.status].variant}>
            {statusConfig[app.status].text}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### ✨ Features

- ✅ Clickable domain names (link to detail page)
- ✅ Color-coded status badges
- ✅ Empty state handling
- ✅ React Suspense wrapper
- ✅ Role query parameter preservation

---

## 🏛️ 2. ADMIN DAERAH DASHBOARD

### 📄 File: `admin-daerah-dashboard.tsx`

**Lokasi:** `src/frontend/components/features/admin-daerah/dashboard/`  
**Baris Code:** 324 lines

### 🔑 Props Interface

```typescript
type Props = {
  applications: SubdomainApplication[];
  domains: Domain[];
  userOpd: string;
};
```

### 🔍 Data Filtering (by OPD)

```typescript
// Filter data by user OPD
const opdApplications = applications.filter((app) => app.opd === userOpd);
const opdDomains = domains.filter((domain) => domain.opd === userOpd);
```

### 📊 Statistics Calculation

```typescript
const stats = {
  totalDomains: opdDomains.length,
  activeDomains: opdDomains.filter((d) => d.status === "active").length,
  pendingApplications: opdApplications.filter(
    (a) => a.status === "pending_review" || a.status === "pending_approval"
  ).length,
  approvedApplications: opdApplications.filter((a) => a.status === "approved")
    .length,
};
```

### 📈 Fungsi-Fungsi Utama

#### 1. **Calculate Countdown Days**

```typescript
const calculateCountdown = (
  activationDate: string
): { days: number; isExpired: boolean } => {
  const activation = new Date(activationDate);
  const now = new Date();
  const year = activation.getFullYear();

  // Check leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;

  // Calculate expiry date (1 year from activation)
  const expiryDate = new Date(activation);
  expiryDate.setDate(expiryDate.getDate() + daysInYear);

  // Calculate remaining days
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: diffDays > 0 ? diffDays : 0,
    isExpired: diffDays <= 0,
  };
};
```

**Input:** Activation date (string)  
**Output:**

- `days`: Sisa hari sebelum expired (0 jika sudah expired)
- `isExpired`: Boolean status expired
- Memperhitungkan leap year (366 hari) vs normal year (365 hari)

#### 2. **Application Status Chart Data**

```typescript
const applicationStatusData = [
  {
    name: "approved",
    value: opdApplications.filter((a) => a.status === "approved").length,
    fill: "var(--color-approved)",
  },
  {
    name: "pending_review",
    value: opdApplications.filter((a) => a.status === "pending_review").length,
    fill: "var(--color-pending_review)",
  },
  {
    name: "pending_approval",
    value: opdApplications.filter((a) => a.status === "pending_approval")
      .length,
    fill: "var(--color-pending_approval)",
  },
  {
    name: "rejected",
    value: opdApplications.filter((a) => a.status === "rejected").length,
    fill: "var(--color-rejected)",
  },
].filter((item) => item.value > 0);
```

**Output:** Array untuk Pie Chart, hanya status dengan value > 0

#### 3. **Active Domains with Countdown**

```typescript
const activeDomainsWithCountdown = opdDomains
  .filter((d) => d.status === "active" && d.activationDate)
  .map((domain) => ({
    ...domain,
    countdown: calculateCountdown(domain.activationDate!),
  }))
  .sort((a, b) => a.countdown.days - b.countdown.days);
```

**Output:**

- Domain yang aktif dan punya activation date
- Sudah dihitung countdown-nya
- Di-sort berdasarkan sisa hari (ascending) - yang mau expired duluan di atas

### 🎨 UI Components

#### **4 Stat Cards:**

1. **Total Domain**

   - Icon: Globe
   - Value: `stats.totalDomains`
   - Description: "Total domain yang Anda kelola."

2. **Domain Aktif**

   - Icon: CheckCircle (green-500)
   - Value: `stats.activeDomains`
   - Description: "Domain yang sedang aktif."

3. **Permohonan Pending**

   - Icon: Clock (amber-500)
   - Value: `stats.pendingApplications`
   - Description: "Permohonan yang sedang diproses."

4. **Permohonan Disetujui**
   - Icon: FileText (green-500)
   - Value: `stats.approvedApplications`
   - Description: "Permohonan yang telah disetujui."

#### **2 Cards dengan Charts/Tables:**

**Card 1: Pie Chart - Status Permohonan**

```typescript
<PieChart accessibilityLayer>
  <Pie
    data={applicationStatusData}
    dataKey="value"
    nameKey="name"
    innerRadius={60}
    strokeWidth={5}
  >
    {applicationStatusData.map((entry) => (
      <Cell key={entry.name} fill={entry.fill} />
    ))}
  </Pie>
  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
</PieChart>
```

- **Type:** Donut Chart (innerRadius=60)
- **Data:** Status distribution (approved, pending_review, pending_approval, rejected)
- **Legend:** Shows all status labels

**Card 2: Table - Status Domain (Countdown)**

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nama Domain</TableHead>
      <TableHead>Sisa Hari</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {activeDomainsWithCountdown.slice(0, 5).map((domain) => (
      <TableRow>
        <TableCell>{domain.hostname}</TableCell>
        <TableCell>
          <span
            className={
              domain.countdown.days <= 30
                ? "text-red-600 font-semibold"
                : domain.countdown.days <= 90
                ? "text-amber-600 font-semibold"
                : "text-green-600"
            }
          >
            {domain.countdown.isExpired
              ? "Expired"
              : `${domain.countdown.days} hari`}
          </span>
        </TableCell>
        <TableCell>
          <Badge
            variant={
              domain.countdown.days <= 30
                ? "destructive"
                : domain.countdown.days <= 90
                ? "default"
                : "secondary"
            }
          >
            {/* Status text */}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### **Color Coding System:**

- **≤ 30 days:** Red (text-red-600, destructive badge) - "Segera Expired"
- **≤ 90 days:** Amber (text-amber-600, default badge) - "Perhatian"
- **> 90 days:** Green (text-green-600, secondary badge) - "Aktif"
- **Expired:** "Expired" text

---

## 🔀 3. DASHBOARD ROUTER PAGES

### 📄 File: `src/app/(app)/super-admin/dashboard/page.tsx`

**Role:** Super Admin  
**Baris Code:** 28 lines

#### Code Structure:

```typescript
function SuperAdminDashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as User["role"];

  return <SuperAdminDashboard role={role} />;
}

export default function SuperAdminDashboardPage() {
  return (
    <React.Suspense fallback={<Loader2 />}>
      <SuperAdminDashboardContent />
    </React.Suspense>
  );
}
```

**Flow:**

1. Get `role` from URL query params
2. Pass `role` to SuperAdminDashboard component
3. Component fetches data from APIs
4. Render dashboard with charts and tables

---

### 📄 File: `src/app/(app)/dashboard/page.tsx`

**Role:** Admin Daerah (dan Super Admin sebagai fallback)  
**Baris Code:** 290 lines

#### Code Structure:

```typescript
function OperatorDashboard() {
  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch data from APIs
      // 2. Find mock user based on role
      // 3. Filter data by OPD for Admin Daerah
      // 4. Set state
    };
    fetchData();
  }, [role]);

  // Render dashboard
}

function DashboardContent() {
  const role = searchParams.get("role") as User["role"];

  switch (role) {
    case "Super Admin":
      return <OperatorDashboard />;
    case "Admin Daerah":
      return <OperatorDashboard />;
    default:
      return <p>Pilih peran untuk melihat dasbor.</p>;
  }
}
```

**Special Features:**

- Uses MOCK_USERS to find user by role
- Filters data by OPD for Admin Daerah
- Shows all data for Super Admin
- Implements countdown calculation inline
- Has Pie Chart for application status
- Has Table for domain countdown

---

## 🆚 PERBANDINGAN: Super Admin vs Admin Daerah

| Aspek                 | Super Admin Dashboard                      | Admin Daerah Dashboard                                |
| --------------------- | ------------------------------------------ | ----------------------------------------------------- |
| **Lokasi Component**  | `features/super-admin/dashboard/`          | `features/admin-daerah/dashboard/`                    |
| **Data Scope**        | Semua data sistem                          | Filtered by user's OPD                                |
| **Statistics Cards**  | 4 cards (Domain, Applications, Users, OPD) | 4 cards (Total/Active Domains, Pending/Approved Apps) |
| **Chart 1**           | Bar Chart - Apps per OPD (Top 5)           | Pie Chart - Application Status Distribution           |
| **Chart 2**           | Table - Recent Applications                | Table - Domain Countdown                              |
| **Data Fetching**     | Inside component (useEffect)               | Props passed from page                                |
| **OPD Filter**        | ❌ No filtering                            | ✅ Filtered by userOpd                                |
| **Countdown Feature** | ❌ Not implemented                         | ✅ Leap year aware calculation                        |
| **Loading State**     | ✅ Loader2 spinner                         | ✅ Loader2 spinner                                    |
| **Empty State**       | ✅ "Tidak ada data"                        | ✅ "Belum ada data"                                   |

---

## 🔧 API ENDPOINTS DIGUNAKAN

### Super Admin Dashboard:

1. `GET /api/domains` - Fetch all domains
2. `GET /api/applications` - Fetch all applications
3. `GET /api/users` - Fetch all users

### Admin Daerah Dashboard (page.tsx):

1. `GET /api/applications` - Fetch all applications (filtered client-side)
2. `GET /api/domains` - Fetch all domains (filtered client-side)
3. `GET /api/users` - Fetch users (to find current user)

---

## 📊 DATA PROCESSING PIPELINE

### Super Admin:

```
APIs → Parse JSON → Process Statistics → Process Chart Data → Render
```

### Admin Daerah (Component):

```
Props (pre-filtered) → Process Statistics → Process Chart Data → Calculate Countdown → Render
```

### Admin Daerah (Page):

```
APIs → Parse JSON → Find User → Filter by OPD → Pass to Component → Render
```

---

## ✨ FUNGSI KHUSUS & ALGORITMA

### 1. **OPD Ranking Algorithm (Super Admin)**

```typescript
// Input: Array of applications
// Output: Top 5 OPDs by application count

Step 1: Extract unique OPDs
  opdList = [...new Set(applications.map(app => app.opd))]

Step 2: Count applications per OPD
  appCounts = opdList.map(opd => ({
    opd,
    applications: applications.filter(app => app.opd === opd).length
  }))

Step 3: Sort descending and take top 5
  .sort((a, b) => b.applications - a.applications)
  .slice(0, 5)
```

### 2. **Countdown Calculator (Admin Daerah)**

```typescript
// Input: activationDate (string)
// Output: { days: number, isExpired: boolean }

Step 1: Parse activation date
Step 2: Determine if leap year
  isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
Step 3: Calculate expiry date (activation + 365/366 days)
Step 4: Calculate difference from now
Step 5: Return days remaining and expired status
```

### 3. **Recent Applications Sorter (Super Admin)**

```typescript
// Input: Array of applications
// Output: 5 most recent pending_review applications

Step 1: Filter by status = "pending_review"
Step 2: Sort by date descending
  .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
Step 3: Take first 5
  .slice(0, 5)
```

### 4. **Chart Data Filter (Admin Daerah)**

```typescript
// Input: Application status counts
// Output: Only non-zero status counts

.filter((item) => item.value > 0)

// Prevents empty slices in pie chart
```

---

## 🎨 UI/UX FEATURES

### Animation Delays:

- Stat Cards: `animate-fade-in` (no delay)
- Chart Card 1: `animate-fade-in` + `animationDelay: "150ms"`
- Chart Card 2: `animate-fade-in` + `animationDelay: "300ms"`

### Responsive Grid:

- Stat Cards: `md:grid-cols-2 lg:grid-cols-4`
- Chart Cards: `lg:grid-cols-2` (stacked on mobile)

### Loading States:

```typescript
<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
```

### Empty States:

```typescript
<p className="text-muted-foreground">Tidak ada data permohonan.</p>
```

### Status Badges:

- Destructive (red): Rejected, Expired, Critical (≤30 days)
- Default (gray): Pending, Warning (≤90 days)
- Secondary (green): Approved, Active (>90 days)

---

## 🐛 POTENTIAL ISSUES & IMPROVEMENTS

### Issues:

1. ⚠️ **Admin Daerah component** requires props, tapi **page.tsx** melakukan filtering sendiri
   - **Solusi:** Component seharusnya fetch data sendiri seperti Super Admin
2. ⚠️ **MOCK_USERS** digunakan di page.tsx untuk find user

   - **Solusi:** Seharusnya ada endpoint `/api/users/me` untuk get current user

3. ⚠️ **Duplicate OperatorDashboard** di page.tsx yang kompleks

   - **Solusi:** Extract ke component terpisah

4. ⚠️ **Client-side filtering** di page.tsx (tidak efisien untuk data besar)
   - **Solusi:** API should support OPD filter query param

### Improvements:

1. ✅ Tambahkan **error handling** untuk API failures
2. ✅ Tambahkan **refresh button** untuk manual data refresh
3. ✅ Tambahkan **date range filter** untuk applications
4. ✅ Tambahkan **export to CSV/PDF** functionality
5. ✅ Implementasikan **real-time updates** dengan WebSocket

---

## 📝 CHECKLIST MIGRASI

### Admin Daerah Component Refactoring:

- [ ] Ubah component dari prop-based ke self-fetching
- [ ] Implement useEffect untuk fetch APIs
- [ ] Remove dependency on page.tsx filtering
- [ ] Add error handling
- [ ] Add refresh functionality

### API Improvements:

- [ ] Create `/api/users/me` endpoint
- [ ] Add OPD filter to `/api/applications?opd={opdName}`
- [ ] Add OPD filter to `/api/domains?opd={opdName}`
- [ ] Implement proper error responses

### Code Cleanup:

- [ ] Remove MOCK_USERS usage from page.tsx
- [ ] Extract OperatorDashboard to separate component file
- [ ] Consolidate duplicate countdown logic
- [ ] Add TypeScript interfaces for all data structures

---

**Generated:** November 11, 2025  
**Analyst:** AI Assistant  
**Status:** Complete & Ready for Review
