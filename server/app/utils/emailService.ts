import { envConfig } from '../config/envConfig';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Universal Email Dispatcher using HTTPS REST API (Resend / EmailJS / Console Fallback)
 * Works 100% in production serverless & cloud environments without SMTP socket blocks.
 */
export const sendEmail = async ({ to, subject, html, text }: SendEmailParams): Promise<boolean> => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Genz Toon <no-reply@comicbd.com>';

  // 1. Production Mode: Resend REST API (over HTTPS Port 443)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ''),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[EmailService] Resend API Error:', data);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to send email via Resend:', err);
      return false;
    }
  }

  // 2. Development / Fallback Mode: Prominent formatted console notification
  console.log('\n==================== 📧 [EMAIL DISPATCH] ====================');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------------------------------------------');
  if (text) {
    console.log(text);
  } else {
    console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
  }
  console.log('============================================================\n');

  return true;
};

/**
 * Password Reset Email Template
 */
export const sendPasswordResetEmail = async ({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name?: string;
  resetUrl: string;
}) => {
  const subject = 'Reset your Genz Toon password';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #16161f; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 32px; text-align: left;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Reset Your Password</h2>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
          Hello ${name ? `<strong>${name}</strong>` : 'there'},<br/>
          We received a request to reset the password for your Genz Toon account. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e11d48; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #71717a; font-size: 12px; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.<br/>
          Or copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color: #e11d48; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to,
    subject,
    html,
    text: `Reset your Genz Toon password by clicking this link: ${resetUrl}`,
  });
};

/**
 * Email Verification Template
 */
export const sendVerificationEmail = async ({
  to,
  name,
  verificationUrl,
}: {
  to: string;
  name?: string;
  verificationUrl: string;
}) => {
  const subject = 'Verify your Genz Toon email address';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d0d12; color: #ffffff; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #16161f; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 32px; text-align: left;">
        <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Welcome to Genz Toon! 🎉</h2>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
          Hello ${name ? `<strong>${name}</strong>` : 'there'},<br/>
          Thank you for joining Genz Toon. Please verify your email address to secure your account and activate your reader rewards:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #e11d48; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #71717a; font-size: 12px; line-height: 1.5;">
          If you did not create an account, please disregard this message.<br/>
          Direct link: <a href="${verificationUrl}" style="color: #e11d48; word-break: break-all;">${verificationUrl}</a>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to,
    subject,
    html,
    text: `Verify your email address on Genz Toon by clicking this link: ${verificationUrl}`,
  });
};
