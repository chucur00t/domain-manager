'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, Upload, FileText, AlertCircle, CheckCircle, Globe, Server } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@/backend/models/types';
import { MOCK_USERS, MOCK_OPDS } from '@/backend/utils/mock-data';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

type ApplicationType = 'domain' | 'hosting';

export default function NewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const role = searchParams.get('role') as User['role'] | null;
  
  // Application type state
  const [applicationType, setApplicationType] = useState<ApplicationType>('domain');
  
  // Form state - unified untuk both domain dan hosting
  const [formData, setFormData] = useState({
    // Common fields
    applicantName: '',
    opd: '',
    description: '',
    purpose: '',
    
    // Domain specific
    domainName: '',
    subdomainType: 'single',
    
    // Hosting specific  
    applicationName: '',
    framework: '',
    domainNameHosting: '',
    expectedUsers: '',
    storage: '',
    bandwidth: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get current user info
  const currentUser = MOCK_USERS.find(user => user.role === role);
  const USER_OPD = currentUser?.opd;

  // Auto-fill OPD for Admin Daerah
  useEffect(() => {
    if (role === 'Admin Daerah' && USER_OPD) {
      setFormData(prev => ({
        ...prev,
        opd: USER_OPD,
        applicantName: currentUser?.name || ''
      }));
    }
  }, [role, USER_OPD, currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError(`File ${file.name} tidak didukung. Hanya PDF, JPG, PNG, dan DOC/DOCX yang diperbolehkan.`);
        return;
      }

      // Validate file size (5MB untuk domain, 10MB untuk hosting)
      const maxSize = applicationType === 'domain' ? 5 : 10;
      if (file.size > maxSize * 1024 * 1024) {
        setSubmitError(`File ${file.name} terlalu besar. Maksimal ${maxSize}MB.`);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
    });

    // Clear file input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Common validation
      if (!formData.applicantName.trim() || !formData.opd.trim() || !formData.description.trim() || !formData.purpose.trim()) {
        throw new Error('Field wajib tidak boleh kosong');
      }

      let response;
      if (applicationType === 'domain') {
        // Domain validation
        if (!formData.domainName.trim()) {
          throw new Error('Nama domain wajib diisi');
        }

        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
        if (!domainRegex.test(formData.domainName)) {
          throw new Error('Format nama domain tidak valid');
        }

        const applicationData = {
          domainName: formData.domainName,
          subdomainType: formData.subdomainType,
          applicantName: formData.applicantName,
          opd: formData.opd,
          description: formData.description,
          purpose: formData.purpose,
          documents: uploadedFiles
        };

        response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData),
        });

      } else {
        // Hosting validation
        if (!formData.applicationName.trim() || !formData.framework.trim()) {
          throw new Error('Nama aplikasi dan framework wajib diisi');
        }

        // Validate domain name format if provided
        if (formData.domainNameHosting && formData.domainNameHosting.trim()) {
          const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
          if (!domainRegex.test(formData.domainNameHosting)) {
            throw new Error('Format nama domain tidak valid');
          }
        }

        const applicationData = {
          applicationName: formData.applicationName,
          applicantName: formData.applicantName,
          opd: formData.opd,
          description: formData.description,
          framework: formData.framework,
          purpose: formData.purpose,
          domainName: formData.domainNameHosting || undefined,
          expectedUsers: formData.expectedUsers || undefined,
          storage: formData.storage || undefined,
          bandwidth: formData.bandwidth || undefined,
          documents: uploadedFiles
        };

        response = await fetch('/api/hosting-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal mengajukan permohonan');
      }

      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        if (applicationType === 'domain') {
          router.push(`/applications?role=${role}`);
        } else {
          router.push(`/hosting?role=${role}`);
        }
      }, 2000);

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengajukan permohonan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMaxFileSize = () => applicationType === 'domain' ? '5MB' : '10MB';

  if (submitSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-700">
                Permohonan {applicationType === 'domain' ? 'Domain' : 'Hosting'} Berhasil Diajukan!
              </h2>
              <p className="text-muted-foreground">
                Permohonan {applicationType} Anda telah berhasil dikirim dan sedang menunggu review.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Nomor Permohonan:</strong> {applicationType.toUpperCase()}-{Date.now().toString().slice(-6)}
                <br />
                <strong>Status:</strong> Menunggu Review Admin
              </div>
              <p className="text-xs text-muted-foreground">
                Anda akan dialihkan ke halaman permohonan dalam beberapa detik...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={applicationType === 'domain' ? `/applications?role=${role}` : `/hosting?role=${role}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ajukan Permohonan Baru</h1>
            <p className="text-muted-foreground">
              Isi form di bawah untuk mengajukan permohonan domain atau hosting
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Permohonan</CardTitle>
            <CardDescription>
              Semua field bertanda (*) wajib diisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Application Type Selection */}
              <div className="space-y-3">
                <Label>Jenis Permohonan *</Label>
                <RadioGroup 
                  value={applicationType} 
                  onValueChange={(value: ApplicationType) => setApplicationType(value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="domain" id="domain-type" />
                    <Globe className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor="domain-type" className="font-medium">Permohonan Domain</Label>
                      <p className="text-sm text-gray-500">Domain/subdomain baru</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="hosting" id="hosting-type" />
                    <Server className="h-5 w-5 text-green-500" />
                    <div>
                      <Label htmlFor="hosting-type" className="font-medium">Permohonan Hosting</Label>
                      <p className="text-sm text-gray-500">Hosting aplikasi website</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Applicant Name */}
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Nama Pemohon *</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    placeholder="Nama lengkap pemohon"
                    required
                  />
                </div>

                {/* OPD */}
                <div className="space-y-2">
                  <Label htmlFor="opd">Organisasi Perangkat Daerah *</Label>
                  {role === 'Admin Daerah' && USER_OPD ? (
                    <Input
                      id="opd"
                      value={formData.opd}
                      disabled
                      className="bg-gray-50"
                    />
                  ) : (
                    <Select value={formData.opd} onValueChange={(value: string) => handleInputChange('opd', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih OPD" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_OPDS.map((opd) => (
                          <SelectItem key={opd.id} value={opd.name}>
                            {opd.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Tujuan Penggunaan *</Label>
                <Select value={formData.purpose} onValueChange={(value: string) => handleInputChange('purpose', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tujuan penggunaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicationType === 'domain' ? (
                      <>
                        <SelectItem value="website-resmi">Website Resmi OPD</SelectItem>
                        <SelectItem value="sistem-informasi">Sistem Informasi</SelectItem>
                        <SelectItem value="portal-layanan">Portal Layanan Publik</SelectItem>
                        <SelectItem value="aplikasi-internal">Aplikasi Internal</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="sistem-informasi">Sistem Informasi Internal</SelectItem>
                        <SelectItem value="aplikasi-layanan">Aplikasi Layanan Publik</SelectItem>
                        <SelectItem value="sistem-admin">Sistem Administrasi</SelectItem>
                        <SelectItem value="dashboard-laporan">Dashboard dan Laporan</SelectItem>
                        <SelectItem value="aplikasi-mobile">Aplikasi Mobile Backend</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Fields based on Application Type */}
              {applicationType === 'domain' ? (
                // Domain Specific Fields
                <>
                  {/* Domain Name */}
                  <div className="space-y-2">
                    <Label htmlFor="domainName">Nama Domain *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="domainName"
                        value={formData.domainName}
                        onChange={(e) => handleInputChange('domainName', e.target.value)}
                        placeholder="nama-domain"
                        required
                      />
                      <span className="text-muted-foreground">.pemkab.go.id</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Hanya huruf, angka, dan tanda hubung. Tidak boleh dimulai atau diakhiri dengan tanda hubung.
                    </p>
                  </div>

                  {/* Subdomain Type */}
                  <div className="space-y-2">
                    <Label htmlFor="subdomainType">Jenis Domain</Label>
                    <Select value={formData.subdomainType} onValueChange={(value: string) => handleInputChange('subdomainType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Subdomain</SelectItem>
                        <SelectItem value="multi">Multi Subdomain</SelectItem>
                        <SelectItem value="custom">Custom Path</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                // Hosting Specific Fields
                <>
                  {/* Application Name */}
                  <div className="space-y-2">
                    <Label htmlFor="applicationName">Nama Aplikasi *</Label>
                    <Input
                      id="applicationName"
                      value={formData.applicationName}
                      onChange={(e) => handleInputChange('applicationName', e.target.value)}
                      placeholder="Nama aplikasi yang akan dihosting"
                      required
                    />
                  </div>

                  {/* Framework */}
                  <div className="space-y-2">
                    <Label htmlFor="framework">Framework/Teknologi *</Label>
                    <Select value={formData.framework} onValueChange={(value: string) => handleInputChange('framework', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="laravel">Laravel (PHP)</SelectItem>
                        <SelectItem value="codeigniter">CodeIgniter (PHP)</SelectItem>
                        <SelectItem value="nodejs">Node.js (Express)</SelectItem>
                        <SelectItem value="nextjs">Next.js (React)</SelectItem>
                        <SelectItem value="vue">Vue.js</SelectItem>
                        <SelectItem value="django">Django (Python)</SelectItem>
                        <SelectItem value="spring">Spring Boot (Java)</SelectItem>
                        <SelectItem value="net">ASP.NET (C#)</SelectItem>
                        <SelectItem value="golang">Golang</SelectItem>
                        <SelectItem value="static">Static HTML/WordPress</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Domain Name (Optional for Hosting) */}
                  <div className="space-y-2">
                    <Label htmlFor="domainNameHosting">Nama Domain (Opsional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="domainNameHosting"
                        value={formData.domainNameHosting}
                        onChange={(e) => handleInputChange('domainNameHosting', e.target.value)}
                        placeholder="nama-domain"
                      />
                      <span className="text-muted-foreground">.pemkab.go.id</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Kosongkan jika belum确定 domain yang diinginkan
                    </p>
                  </div>

                  {/* Expected Users */}
                  <div className="space-y-2">
                    <Label htmlFor="expectedUsers">Jumlah Pengguna yang Diharapkan</Label>
                    <Select value={formData.expectedUsers} onValueChange={(value: string) => handleInputChange('expectedUsers', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih perkiraan pengguna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 pengguna</SelectItem>
                        <SelectItem value="11-50">11-50 pengguna</SelectItem>
                        <SelectItem value="51-100">51-100 pengguna</SelectItem>
                        <SelectItem value="101-500">101-500 pengguna</SelectItem>
                        <SelectItem value="501-1000">501-1000 pengguna</SelectItem>
                        <SelectItem value="1000+">Lebih dari 1000 pengguna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Storage */}
                  <div className="space-y-2">
                    <Label htmlFor="storage">Kebutuhan Storage</Label>
                    <Select value={formData.storage} onValueChange={(value: string) => handleInputChange('storage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kebutuhan storage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1gb">1 GB</SelectItem>
                        <SelectItem value="5gb">5 GB</SelectItem>
                        <SelectItem value="10gb">10 GB</SelectItem>
                        <SelectItem value="25gb">25 GB</SelectItem>
                        <SelectItem value="50gb">50 GB</SelectItem>
                        <SelectItem value="100gb+">Lebih dari 100 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bandwidth */}
                  <div className="space-y-2">
                    <Label htmlFor="bandwidth">Kebutuhan Bandwidth per Bulan</Label>
                    <Select value={formData.bandwidth} onValueChange={(value: string) => handleInputChange('bandwidth', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kebutuhan bandwidth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10gb">10 GB</SelectItem>
                        <SelectItem value="50gb">50 GB</SelectItem>
                        <SelectItem value="100gb">100 GB</SelectItem>
                        <SelectItem value="500gb">500 GB</SelectItem>
                        <SelectItem value="1tb">1 TB</SelectItem>
                        <SelectItem value="5tb+">Lebih dari 5 TB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi dan Alasan *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={
                    applicationType === 'domain' 
                      ? "Jelaskan secara detail mengapa domain/subdomain ini diperlukan, rencana penggunaan, dan manfaat untuk OPD..."
                      : "Jelaskan secara detail aplikasi yang akan dihosting, fitur-fitur utama, target pengguna, dan alasan mengapa membutuhkan hosting..."
                  }
                  rows={4}
                  required
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <Label>Dokumen Pendukung (Opsional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload dokumen pendukung
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PDF, JPG, PNG, DOC, DOCX hingga {getMaxFileSize()}
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <Button type="button" variant="outline" className="mt-2">
                        Pilih File
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Dokumen yang Diupload:</Label>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href={applicationType === 'domain' ? `/applications?role=${role}` : `/hosting?role=${role}`}>
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    `Ajukan Permohonan ${applicationType === 'domain' ? 'Domain' : 'Hosting'}`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
