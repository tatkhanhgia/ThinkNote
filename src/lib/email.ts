import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    // Log but don't throw — email failure must not block the auth flow
    console.error('[email] Failed to send email to', to, error);
  }
}

export function verificationEmailHtml(userName: string, verifyUrl: string): string {
  return `
    <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;color:#1f2937">
      <div style="padding:32px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
        <h2 style="margin:0 0 8px;color:#1e40af">ThinkNote</h2>
        <p>Hi ${userName},</p>
        <p>Click the button below to verify your email address:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${verifyUrl}"
             style="display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
            Verify Email
          </a>
        </div>
        <p style="font-size:13px;color:#6b7280">
          If the button doesn't work, copy this link:<br/>
          <a href="${verifyUrl}" style="color:#2563eb;word-break:break-all">${verifyUrl}</a>
        </p>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}
