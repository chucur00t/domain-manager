// Session configuration
export const sessionConfig = {
  // Session timeout: 8 hours (in milliseconds)
  maxAge: 8 * 60 * 60 * 1000,
  
  // Session cookie settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  },
  
  // Save sessions to MySQL
  store: null, // Will be initialized with MySQL session store
};

// Error response helpers
export function badRequest(message: string) {
  return new Response(
    JSON.stringify({ 
      status: 'error',
      message 
    }), 
    { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export function notFound(message: string) {
  return new Response(
    JSON.stringify({ 
      status: 'error',
      message 
    }), 
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export function serverError(message: string) {
  return new Response(
    JSON.stringify({ 
      status: 'error',
      message 
    }), 
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Error messages configuration
export const errorMessages = {
  auth: {
    invalidCredentials: 'Username atau password tidak valid.',
    accountLocked: 'Akun Anda telah dikunci karena terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
    sessionExpired: 'Sesi Anda telah berakhir. Silakan login kembali.',
    unauthorized: 'Anda tidak memiliki akses ke halaman ini.',
  },
  domain: {
    invalidFormat: 'Format domain tidak valid. Gunakan format yang benar (contoh: subdomain.pemkab-x.go.id)',
    alreadyExists: 'Domain ini sudah terdaftar.',
    expiringSoon: 'Domain akan berakhir dalam {days} hari. Silakan ajukan perpanjangan.',
    activationFailed: 'Gagal mengaktifkan domain. Silakan coba lagi atau hubungi administrator.',
  },
  hosting: {
    quotaExceeded: 'Kuota hosting telah terlampaui. Silakan hubungi administrator untuk penambahan kuota.',
    deploymentFailed: 'Gagal melakukan deployment. Silakan periksa log untuk detail lebih lanjut.',
  },
  upload: {
    invalidType: 'Tipe file tidak didukung. Gunakan format: {formats}',
    sizeExceeded: 'Ukuran file melebihi batas maksimal ({maxSize}MB)',
    uploadFailed: 'Gagal mengunggah file. Silakan coba lagi.',
  },
  general: {
    serverError: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    validationError: 'Data yang dimasukkan tidak valid. Silakan periksa kembali.',
    networkError: 'Koneksi terputus. Silakan periksa koneksi internet Anda.',
  }
};