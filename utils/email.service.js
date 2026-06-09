const axios = require("axios");

const brevoUrl = "https://api.brevo.com/v3/smtp/email";

const getSender = () => {
  const email = process.env.BREVO_SENDER_EMAIL;
  const name = process.env.BREVO_SENDER_NAME || "EstatePilot";

  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is required");
  }

  if (!email) {
    throw new Error("BREVO_SENDER_EMAIL is required");
  }

  return { email, name };
};

const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const response = await axios.post(
    brevoUrl,
    {
      sender: getSender(),
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
      htmlContent,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  return response.data;
};

const baseEmail = ({ title, body, cta = "", footer }) => `
  <div style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="padding:24px 28px;border-bottom:1px solid #e2e8f0;background:#0f172a;color:#ffffff;">
          <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#93c5fd;">EstatePilot</div>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;">${title}</h1>
        </div>
        <div style="padding:28px;">
          ${body}
          ${cta}
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">${footer}</p>
        </div>
      </div>
      <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#94a3b8;">
        Copyright ${new Date().getFullYear()} EstatePilot. This is an automated security email.
      </p>
    </div>
  </div>
`;

const sendOtpEmail = async (toEmail, otp, options = {}) => {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">
      Use this one-time password to verify ${options.purpose || "your email address"}. It expires in ${options.expiresIn || "5 minutes"}.
    </p>
    <div style="margin:24px 0;padding:20px;text-align:center;background:#f8fafc;border:1px solid #dbeafe;border-radius:10px;">
      <div style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;">Verification code</div>
      <div style="margin-top:10px;font-size:36px;line-height:1;font-weight:800;letter-spacing:8px;color:#0f172a;">${otp}</div>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
      Do not share this code with anyone. EstatePilot will never ask for your password or OTP outside the official app.
    </p>
  `;

  return sendBrevoEmail({
    toEmail,
    toName: options.toName,
    subject: options.subject || "Verify your EstatePilot email",
    htmlContent: baseEmail({
      title: "Email verification",
      body,
      footer: "If you did not request this verification, you can safely ignore this message.",
    }),
  });
};

const sendPasswordResetEmail = async (toEmail, resetUrl, options = {}) => {
  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
      We received a request to reset your EstatePilot password. Use the secure link below within 15 minutes.
    </p>
  `;
  const cta = `
    <a href="${resetUrl}" style="display:inline-block;background:#2e95f7;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-size:14px;font-weight:800;">
      Reset password
    </a>
  `;

  return sendBrevoEmail({
    toEmail,
    toName: options.toName,
    subject: "Reset your EstatePilot password",
    htmlContent: baseEmail({
      title: "Reset your password",
      body,
      cta,
      footer: "If you did not request this, ignore this email. Your password will stay unchanged.",
    }),
  });
};

module.exports = {
  sendBrevoEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
};
