import { NextRequest } from 'next/server';
import { passwordResetService } from '@/backend/services/password-reset.service';
import { badRequest, serverError } from '@/backend/config/errors';
import * as z from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token harus diisi'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'Password harus mengandung huruf besar, huruf kecil, dan angka'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
});

// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return badRequest(validationResult.error.errors[0].message);
    }

    const { token, password } = validationResult.data;
    
    const success = await passwordResetService.resetPassword(token, password);
    
    if (!success) {
      return badRequest('Token tidak valid atau sudah kadaluarsa');
    }

    return Response.json({
      status: 'success',
      message: 'Password berhasil direset'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return serverError('Gagal mereset password');
  }
}