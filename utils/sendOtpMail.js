const nodemailer = require("nodemailer");

const sendOtpMail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP Connected");

    const mailOptions = {
      from: `"Real Estate CRM" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - Real Estate CRM OTP",
      html: `
      <div style="
        background:#f8fafc;
        padding:40px 20px;
        font-family:Arial, Helvetica, sans-serif;
      ">
        <div style="
          max-width:560px;
          margin:0 auto;
          background:#ffffff;
          border:1px solid #e2e8f0;
          border-radius:12px;
          overflow:hidden;
        ">
      
          <div style="
            padding:32px;
            border-bottom:1px solid #e2e8f0;
          ">
            <h1 style="
              margin:0;
              color:#0f172a;
              font-size:24px;
              font-weight:700;
            ">
              EstatePilot CRM
            </h1>
          </div>
      
          <div style="padding:32px;">
      
            <h2 style="
              margin:0 0 16px;
              color:#0f172a;
              font-size:22px;
              font-weight:600;
            ">
              Verify your email address
            </h2>
      
            <p style="
              margin:0 0 24px;
              color:#475569;
              font-size:15px;
              line-height:1.7;
            ">
              Use the verification code below to complete your account setup.
            </p>
      
            <div style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              text-align:center;
              padding:20px;
              margin:24px 0;
            ">
              <div style="
                color:#64748b;
                font-size:13px;
                margin-bottom:8px;
              ">
                Verification Code
              </div>
      
              <div style="
                color:#0f172a;
                font-size:36px;
                font-weight:700;
                letter-spacing:8px;
              ">
                ${otp}
              </div>
            </div>
      
            <p style="
              margin:0 0 16px;
              color:#475569;
              font-size:14px;
              line-height:1.7;
            ">
              This code will expire in <strong>10 minutes</strong>.
            </p>
      
            <p style="
              margin:0;
              color:#64748b;
              font-size:14px;
              line-height:1.7;
            ">
              If you did not request this verification code, you can safely ignore this email.
            </p>
      
          </div>
      
          <div style="
            border-top:1px solid #e2e8f0;
            padding:20px 32px;
            color:#94a3b8;
            font-size:13px;
          ">
            © 2026 EstatePilot CRM. All rights reserved.
          </div>
      
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return "OTP email sent successfully";
  } catch (error) {
    console.log(error);
    return "Email sending failed: " + error.message;
  }
};

module.exports = sendOtpMail;