interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  name?: string;
  actionUrl?: string;
}

/**
 * Universal Email Dispatcher via Resend REST API (with Dev Console Fallback)
 * Works seamlessly in serverless, cloud (Vercel, Render), and local environments.
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  actionUrl,
}: SendEmailParams): Promise<boolean> => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'Comic BD <onboarding@resend.dev>';

  // 1. Production Mode: Resend REST API (https://api.resend.com/emails)
  if (resendApiKey) {
    try {
      console.log(`[EmailService:Resend] Dispatching "${subject}" to ${to}...`);

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
          text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error(`[EmailService:Resend] API Error (Status ${response.status}):`, data);

        // Auto-fallback: if unverified custom domain error, retry with default onboarding@resend.dev sender
        if (
          (data?.message?.includes('domain is not verified') || data?.message?.includes('domain')) &&
          !fromEmail.includes('onboarding@resend.dev')
        ) {
          console.log(`[EmailService:Resend] Retrying dispatch using sandbox sender "Comic BD <onboarding@resend.dev>"...`);
          const retryResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Comic BD <onboarding@resend.dev>',
              to: [to],
              subject,
              html,
              text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
            }),
          });

          const retryData = await retryResponse.json().catch(() => null);
          if (retryResponse.ok) {
            console.log(`[EmailService:Resend] Email successfully sent to ${to} via onboarding@resend.dev (ID: ${retryData?.id || 'ok'})`);
            return true;
          }
          console.error('[EmailService:Resend] Sandbox retry error:', retryData);
        }

        if (data?.message?.includes('testing email')) {
          console.warn('[EmailService:Resend] Tip: On Resend free tier without a verified domain, you can only send to your Resend account email.');
        }
        return false;
      }

      console.log(`[EmailService:Resend] Email successfully sent to ${to} (ID: ${data?.id || 'ok'})`);
      return true;
    } catch (err) {
      console.error('[EmailService:Resend] Request failed:', err);
      return false;
    }
  }

  // 2. Development / Fallback Mode: Clean, formatted terminal notification
  console.warn('[EmailService] RESEND_API_KEY is not configured. Falling back to terminal display:');
  console.log('\n==================== 📧 [EMAIL DISPATCH] ====================');
  console.log(`To:         ${to}`);
  console.log(`From:       ${fromEmail}`);
  console.log(`Subject:    ${subject}`);
  if (actionUrl) {
    console.log(`Action URL: ${actionUrl}`);
  }
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
 * Password Reset Email Template (Resend)
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
  const subject = 'Reset your Comic BD password';
  const recipientName = name || 'Valued Reader';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0b10; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #14141e; border: 1px solid #232332; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1f1f2e;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Reset Your Password
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">
                Comic BD Security Assistance
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e4e4e7;">
                Hello <strong style="color: #ffffff;">${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                We received a request to reset the password for your Comic BD account. Click the button below to choose a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; padding: 14px 34px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; background-color: #1a1a26; border-radius: 8px; border-left: 3px solid #e11d48;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">
                      ⏱️ <strong>Note:</strong> This link will expire in <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Plain Link -->
              <p style="margin: 28px 0 0 0; font-size: 12px; line-height: 1.5; color: #71717a; word-break: break-all;">
                Or copy and paste this URL into your browser:<br/>
                <a href="${resetUrl}" target="_blank" style="color: #f43f5e; text-decoration: underline; font-size: 11px;">
                  ${resetUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px 32px; background-color: #0f0f17; text-align: center; border-top: 1px solid #1f1f2e;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717a;">
                © 2026 Comic BD. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #52525b;">
                This is an automated security email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return await sendEmail({
    to,
    name,
    subject,
    html,
    text: `Reset your Comic BD password by clicking this link: ${resetUrl}`,
    actionUrl: resetUrl,
  });
};

/**
 * Email Verification Template (Resend)
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
  const subject = 'Verify your Comic BD email address';
  const recipientName = name || 'Valued Reader';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0b10; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #14141e; border: 1px solid #232332; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1f1f2e;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Welcome to Comic BD! 🎉
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">
                Account Activation & Reader Security
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e4e4e7;">
                Hello <strong style="color: #ffffff;">${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Thank you for joining Comic BD. Please verify your email address to secure your account and activate your reader rewards:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" target="_blank" style="background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; padding: 14px 34px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; background-color: #1a1a26; border-radius: 8px; border-left: 3px solid #e11d48;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">
                      🛡️ If you did not create an account on Comic BD, please disregard this message.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Plain Link -->
              <p style="margin: 28px 0 0 0; font-size: 12px; line-height: 1.5; color: #71717a; word-break: break-all;">
                Direct link: <a href="${verificationUrl}" target="_blank" style="color: #f43f5e; text-decoration: underline; font-size: 11px;">${verificationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px 32px; background-color: #0f0f17; text-align: center; border-top: 1px solid #1f1f2e;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #71717a;">
                © 2026 Comic BD. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return await sendEmail({
    to,
    name,
    subject,
    html,
    text: `Verify your email address on Comic BD by clicking this link: ${verificationUrl}`,
    actionUrl: verificationUrl,
  });
};
