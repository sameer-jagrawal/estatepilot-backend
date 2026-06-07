const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetMail = async (toEmail, resetUrl) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required");
  }

  const { data, error } = await resend.emails.send({
    from: `EstatePilot <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: [toEmail],
    subject: "Reset your EstatePilot password",
    html: `
      <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
            <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;">Reset your password</h2>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#475569;">
              We received a request to reset your EstatePilot password. Use the secure link below within 15 minutes.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#2E95F7;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700;">
              Reset password
            </a>
            <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#64748b;">
              If you did not request this, ignore this email. Your password will stay unchanged.
            </p>
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send reset email");
  }

  return data;
};

module.exports = sendPasswordResetMail;
