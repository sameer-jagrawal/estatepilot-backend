const { sendOtpEmail } = require("./email.service");

const sendOtpMail = async (toEmail, otp) => {
  return sendOtpEmail(toEmail, otp, {
    subject: "Verify your EstatePilot account",
    purpose: "your company registration",
    expiresIn: "10 minutes",
  });
};

module.exports = sendOtpMail;
