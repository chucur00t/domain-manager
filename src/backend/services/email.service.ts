import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email using Nodemailer
 * Supports both development (console log) and production (SMTP)
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  // Development mode - just log
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
    console.log('📧 Email (Development Mode):');
    console.log('To:', payload.to);
    console.log('Subject:', payload.subject);
    console.log('Body:', payload.text);
    return;
  }

  try {
    // Production mode - send actual email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@domain-manager.com',
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html || payload.text,
    });

    console.log('✅ Email sent successfully to:', payload.to);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}