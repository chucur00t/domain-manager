import { NextRequest } from 'next/server';
import { passwordResetService } from '@/backend/services/password-reset.service';
import { badRequest, serverError } from '@/backend/config/errors';

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return badRequest('Email harus diisi');
    }

    const token = await passwordResetService.createResetToken(email);
    
    // Tidak memberitahu user apakah email ditemukan untuk keamanan
    return Response.json({
      status: 'success',
      message: 'Jika email terdaftar, instruksi reset password akan dikirim'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return serverError('Gagal memproses permintaan reset password');
  }
}