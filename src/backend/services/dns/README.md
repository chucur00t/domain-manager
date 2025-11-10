# DNS Integration - Quick Reference

## ✅ What's Implemented

1. **Auto-create DNS records** saat domain disetujui
2. **CloudFlare Provider** - Fully functional
3. **Manual Mode** - Default (no auto-create)
4. **Health Check** - Verify DNS propagation
5. **Audit Logging** - Track all DNS operations
6. **API Endpoints** - Test & manage DNS

---

## 🚀 Quick Setup

### 1. Configure `.env.local`

```bash
# DNS Provider (cloudflare or manual)
DNS_PROVIDER=cloudflare

# CloudFlare API (dapatkan dari dashboard)
CLOUDFLARE_API_KEY=your_api_key
CLOUDFLARE_API_EMAIL=your_email@domain.com

# DNS Settings
DNS_AUTO_CREATE=true
DEFAULT_SERVER_IP=103.xxx.xxx.xxx
DNS_DEFAULT_TTL=3600
```

### 2. Test Connection

```bash
curl http://localhost:9002/api/dns?action=test-connection
```

### 3. Test Approval Flow

1. Submit application domain
2. Approve domain → DNS records auto-created ✅
3. Check `/api/dns?hostname=xxx.go.id` untuk verify records

---

## 📁 Files Structure

```
src/backend/services/dns/
├── dns-provider.interface.ts   # Interface untuk providers
├── cloudflare-provider.ts      # CloudFlare implementation
└── dns-manager.service.ts      # Main DNS service

src/app/api/dns/
└── route.ts                    # DNS API endpoints

src/components/features/
├── dns-records.tsx             # Show DNS records
└── dns-status.tsx              # Show DNS provider status

Integration:
├── src/backend/actions/applications.ts  # Auto-create on approval
└── src/backend/actions/domains.ts       # Update on activate/deactivate
```

---

## 🔧 How It Works

### Approval Flow
```
User submits application
    ↓
Super Admin approves
    ↓
Domain created in database
    ↓
DNS Manager auto-creates records
    ↓
  A record: subdomain.go.id → 103.xxx.xxx.xxx
  CNAME record: www.subdomain.go.id → subdomain.go.id
    ↓
Logged to Audit Trail
```

### Manual Mode
```
DNS_PROVIDER=manual
    ↓
Domain approved → No DNS auto-create
    ↓
System logs: "DNS record perlu dibuat manual"
    ↓
Admin manually creates DNS in provider dashboard
```

---

## 🧪 API Endpoints

```bash
# Test connection
GET /api/dns?action=test-connection

# List zones
GET /api/dns?action=list-zones

# List records
GET /api/dns?hostname=dinas.go.id&domainId=1
```

---

## 📊 Components Usage

### DNSStatus Component
```tsx
import { DNSStatus } from '@/components/features/dns-status';

<DNSStatus showDetails={true} />
```

### DNSRecords Component
```tsx
import { DNSRecords } from '@/components/features/dns-records';

<DNSRecords domain={domain} />
```

---

## 🔍 Troubleshooting

### DNS Provider Not Connected
- Check `.env.local` untuk API keys
- Verify CloudFlare API key permissions
- Restart dev server

### DNS Records Not Created
- Check Audit Trail untuk error logs
- Verify `DNS_AUTO_CREATE=true`
- Check `DEFAULT_SERVER_IP` is set
- Verify parent domain exists in CloudFlare

### Zone Not Found
- Ensure parent domain (e.g., `go.id`) is in CloudFlare
- Use `/api/dns?action=list-zones` to verify

---

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DNS_PROVIDER` | Yes | `manual` | `cloudflare` or `manual` |
| `CLOUDFLARE_API_KEY` | If CloudFlare | - | CloudFlare Global API Key |
| `CLOUDFLARE_API_EMAIL` | If CloudFlare | - | CloudFlare account email |
| `DNS_AUTO_CREATE` | No | `false` | Auto-create on approval |
| `DEFAULT_SERVER_IP` | If auto-create | - | Server IP for A records |
| `DNS_DEFAULT_TTL` | No | `3600` | Default TTL (seconds) |

---

## ✅ Testing Checklist

- [ ] Test DNS connection via API
- [ ] List zones from CloudFlare
- [ ] Submit test application
- [ ] Approve application → Check DNS created
- [ ] Verify A record in CloudFlare dashboard
- [ ] Check Audit Trail for DNS logs
- [ ] Test domain activation/deactivation
- [ ] Verify DNS records via `nslookup`

---

## 📚 Full Documentation

See `docs/DNS-INTEGRATION-GUIDE.md` for complete documentation.

---

**Status:** ✅ Production Ready  
**Last Updated:** November 10, 2025
