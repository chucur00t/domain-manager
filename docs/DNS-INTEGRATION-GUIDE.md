# DNS Integration Guide

## 📋 Overview

DNS Integration memungkinkan sistem untuk **otomatis membuat, mengupdate, dan mengelola DNS records** saat domain disetujui atau statusnya berubah.

Sistem mendukung:
- ✅ **CloudFlare** - Fully implemented
- 🚧 **AWS Route53** - Coming soon
- ⚙️ **Manual Mode** - Default (no auto-create)

---

## 🚀 Quick Start

### 1. **Pilih DNS Provider**

Edit `.env.local`:
```bash
# Untuk CloudFlare
DNS_PROVIDER=cloudflare

# Untuk manual (default)
DNS_PROVIDER=manual
```

### 2. **Konfigurasi CloudFlare** (jika menggunakan CloudFlare)

#### Dapatkan API Key:
1. Login ke [CloudFlare Dashboard](https://dash.cloudflare.com/)
2. Pergi ke **My Profile** → **API Tokens**
3. Pilih **Global API Key** → **View**
4. Copy API Key dan Email

#### Update `.env.local`:
```bash
DNS_PROVIDER=cloudflare
CLOUDFLARE_API_KEY=your_api_key_here
CLOUDFLARE_API_EMAIL=your_email@domain.com
CLOUDFLARE_ACCOUNT_ID=your_account_id  # Optional

DNS_AUTO_CREATE=true
DEFAULT_SERVER_IP=103.xxx.xxx.xxx  # IP server hosting Anda
DNS_DEFAULT_TTL=3600
```

### 3. **Test Connection**

Test koneksi dari frontend:
```bash
# Akan otomatis test saat aplikasi berjalan
# Atau test manual via API
curl http://localhost:9002/api/dns?action=test-connection
```

---

## 📖 How It Works

### **Auto-Create DNS Records**

Saat domain **disetujui** (approved):

1. ✅ Sistem otomatis membuat **A record** untuk subdomain
2. ✅ Sistem otomatis membuat **CNAME record** untuk www (optional)
3. ✅ DNS records langsung pointing ke server IP
4. ✅ Log audit trail untuk tracking

**Example:**
```
Application: dinas-kesehatan.go.id
↓ Disetujui
↓
DNS Records Created:
  A    dinas-kesehatan.go.id     → 103.xxx.xxx.xxx
  CNAME www.dinas-kesehatan.go.id → dinas-kesehatan.go.id
```

### **Auto-Update DNS Records**

Saat status domain berubah:

- **Activate** → DNS records enabled
- **Suspend** → DNS records dapat redirect ke halaman suspended
- **Deactivate** → DNS records dapat dihapus (optional)

---

## 🔧 Architecture

### **Service Layer**

```
src/backend/services/dns/
├── dns-provider.interface.ts   # Interface untuk semua provider
├── cloudflare-provider.ts      # CloudFlare implementation
├── route53-provider.ts         # AWS Route53 (coming soon)
└── dns-manager.service.ts      # Main service
```

### **API Endpoints**

```
GET  /api/dns?action=test-connection  # Test DNS provider connection
GET  /api/dns?action=list-zones       # List all DNS zones
GET  /api/dns?hostname=xxx.go.id      # List records for domain
```

### **Integration Points**

1. **Domain Approval** (`src/backend/actions/applications.ts`)
   - Auto-create DNS records saat domain disetujui
   
2. **Domain Management** (`src/backend/actions/domains.ts`)
   - Update DNS saat activate/deactivate domain
   
3. **Health Check** (`src/backend/services/monitoring/domain-health.service.ts`)
   - Verify DNS propagation
   - Check DNS records validity

---

## 📝 Configuration Options

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DNS_PROVIDER` | DNS provider (`cloudflare`, `route53`, `manual`) | `manual` | Yes |
| `DNS_AUTO_CREATE` | Auto-create DNS records on approval | `false` | No |
| `DEFAULT_SERVER_IP` | Default server IP for A records | - | Yes if auto-create |
| `DNS_DEFAULT_TTL` | Default TTL for DNS records (seconds) | `3600` | No |
| `CLOUDFLARE_API_KEY` | CloudFlare Global API Key | - | Yes if CloudFlare |
| `CLOUDFLARE_API_EMAIL` | CloudFlare account email | - | Yes if CloudFlare |
| `CLOUDFLARE_ACCOUNT_ID` | CloudFlare account ID | - | No |

### **Manual Mode**

Jika `DNS_PROVIDER=manual`:
- DNS records **TIDAK** dibuat otomatis
- Admin harus create DNS records manual di DNS provider
- System akan log ke audit trail untuk tracking
- Approval tetap berjalan normal

---

## 🔍 Monitoring & Troubleshooting

### **Check DNS Provider Status**

```typescript
// From code
import { dnsManagerService } from '@/backend/services/dns/dns-manager.service';

const isConfigured = dnsManagerService.isProviderConfigured();
const isConnected = await dnsManagerService.testConnection();
```

### **View Audit Logs**

Semua DNS operations tercatat di **Audit Trail**:
- `DNS_RECORD_CREATED` - Record berhasil dibuat
- `DNS_RECORD_CREATE_FAILED` - Gagal create record
- `DNS_RECORD_UPDATED` - Record diupdate
- `DNS_RECORD_DELETED` - Record dihapus
- `DNS_CREATE_MANUAL` - Manual mode, perlu create manual
- `DNS_AUTO_CREATE_WARNING` - Warning saat auto-create

### **Common Issues**

#### ❌ "DNS provider not configured"
**Solution:**
- Check `.env.local` untuk `DNS_PROVIDER`
- Pastikan API keys sudah benar
- Restart aplikasi

#### ❌ "Zone not found"
**Solution:**
- Pastikan parent domain (misal: `go.id`) sudah ada di CloudFlare
- Check CloudFlare dashboard untuk zones
- Gunakan `/api/dns?action=list-zones` untuk list zones

#### ❌ "Failed to create DNS record"
**Solution:**
- Check CloudFlare API limits
- Verify API key permissions
- Check audit trail untuk error details

---

## 🧪 Testing

### **Test CloudFlare Connection**

```bash
# Via API
curl http://localhost:9002/api/dns?action=test-connection

# Response
{
  "success": true,
  "provider": "configured",
  "message": "DNS provider connection successful"
}
```

### **List DNS Zones**

```bash
curl http://localhost:9002/api/dns?action=list-zones

# Response
{
  "success": true,
  "zones": [
    {
      "id": "xxx",
      "name": "go.id",
      "status": "active",
      "nameServers": ["ns1.cloudflare.com", "ns2.cloudflare.com"]
    }
  ]
}
```

### **List Domain Records**

```bash
curl "http://localhost:9002/api/dns?hostname=dinas.go.id"

# Response
{
  "success": true,
  "records": [
    {
      "id": "xxx",
      "type": "A",
      "name": "dinas.go.id",
      "content": "103.xxx.xxx.xxx",
      "ttl": 3600
    }
  ]
}
```

---

## 🔐 Security

### **API Key Protection**

- ✅ API keys disimpan di `.env.local` (not committed to git)
- ✅ Gunakan **environment variables** di production
- ✅ CloudFlare API key hanya di server-side (tidak di client)

### **Permissions Required**

CloudFlare API Key needs:
- ✅ **Zone:Read** - List zones
- ✅ **DNS:Edit** - Create/update/delete DNS records

---

## 📚 API Reference

### **DNSManagerService**

```typescript
// Create DNS records
await dnsManagerService.createDomainRecords({
  domain: Domain,
  targetIP: string,
  createWWW: boolean,
  proxied: boolean,
  userId: string
});

// Update DNS records
await dnsManagerService.updateDomainRecords({
  domain: Domain,
  newIP?: string,
  newStatus?: 'active' | 'suspended',
  userId: string
});

// Delete DNS records
await dnsManagerService.deleteDomainRecords(
  domain: Domain,
  userId: string
);

// List DNS records
await dnsManagerService.listDomainRecords(domain: Domain);

// Test connection
await dnsManagerService.testConnection();
```

---

## 🎯 Next Steps

1. ✅ **Configure CloudFlare** credentials
2. ✅ **Test connection** via API
3. ✅ **Set default server IP** in `.env.local`
4. ✅ **Enable auto-create** dengan `DNS_AUTO_CREATE=true`
5. ✅ **Test approval flow** - approve application dan check DNS records

---

## 📞 Support

Untuk pertanyaan atau issues:
1. Check **Audit Trail** untuk error logs
2. Review CloudFlare dashboard untuk DNS status
3. Contact system administrator

---

**Last Updated:** November 10, 2025
