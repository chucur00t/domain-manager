import { db } from '@/backend/database/config';
import { Domain } from '../models/types';
import { sendEmail } from '@/backend/services/email.service';

export async function checkDomainExpiry() {
  const connection = await db.getConnection();
  try {
    // Get domains that will expire in 30, 14, 7, and 3 days
    const { rows: domains } = await connection.query(`
      SELECT d.*, u.email, o.name as opd_name
      FROM domains d
      JOIN applications a ON d.application_id = a.id
      JOIN users u ON a.submitter_id = u.id
      JOIN opds o ON a.opd_id = o.id
      WHERE d.status = 'active'
      AND d.expires_at BETWEEN NOW() 
      AND DATE_ADD(NOW(), INTERVAL 30 DAY)
    `);

    if (Array.isArray(domains)) {
      for (const domain of domains as any[]) {
        const daysUntilExpiry = Math.ceil(
          (new Date(domain.expires_at).getTime() - new Date().getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        // Send notifications based on days until expiry
        if (
          daysUntilExpiry === 30 ||
          daysUntilExpiry === 14 ||
          daysUntilExpiry === 7 ||
          daysUntilExpiry === 3
        ) {
          await sendEmail({
            to: domain.email,
            subject: `Domain ${domain.domain_name} akan berakhir dalam ${daysUntilExpiry} hari`,
            text: `
              Yth. Admin ${domain.opd_name},
              
              Domain ${domain.domain_name} akan berakhir dalam ${daysUntilExpiry} hari.
              Silakan lakukan perpanjangan domain melalui sistem SPDPD untuk menghindari suspensi domain.
              
              Terima kasih,
              Tim SPDPD
            `,
          });
        }
      }
    }
  } finally {
    connection.release();
  }
}