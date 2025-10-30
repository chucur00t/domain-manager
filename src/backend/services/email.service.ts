interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// TODO: Implement actual email sending using a provider like SendGrid or AWS SES
export async function sendEmail(payload: EmailPayload) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Email would be sent in production:');
    console.log(payload);
    return;
  }

  // Implement actual email sending here
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: payload.to,
  //   from: process.env.MAIL_FROM,
  //   subject: payload.subject,
  //   text: payload.text,
  //   html: payload.html
  // });
}