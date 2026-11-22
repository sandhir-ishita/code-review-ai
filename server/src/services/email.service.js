const nodemailer = require("nodemailer");

function getClientUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("\n==========================================");
    console.log(`[DEV EMAIL FALLBACK] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("==========================================\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Code Review AI" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

async function sendVerificationEmail({ to, name, rawToken }) {
  const verifyUrl = `${getClientUrl()}/verify-email?token=${encodeURIComponent(rawToken)}`;

  await sendEmail({
    to,
    subject: "Verify your email — Code Review AI",
    text: `Hi ${name || "Developer"},\n\nPlease verify your email by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;">
        <h2>Verify your email</h2>
        <p>Hi ${name || "Developer"},</p>
        <p>Click the button below to verify your email address for <strong>Code Review AI</strong>:</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Verify Email</a></p>
        <p style="font-size:13px;color:#64748b;">Or copy this link: ${verifyUrl}</p>
        <p style="font-size:12px;color:#94a3b8;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail({ to, name, rawToken }) {
  const resetUrl = `${getClientUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;

  await sendEmail({
    to,
    subject: "Reset your password — Code Review AI",
    text: `Hi ${name || "Developer"},\n\nReset your password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;">
        <h2>Reset your password</h2>
        <p>Hi ${name || "Developer"},</p>
        <p>We received a request to reset your <strong>Code Review AI</strong> password. Click below to set a new password:</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Reset Password</a></p>
        <p style="font-size:13px;color:#64748b;">Or copy this link: ${resetUrl}</p>
        <p style="font-size:12px;color:#94a3b8;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
