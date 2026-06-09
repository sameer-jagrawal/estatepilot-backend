const { sendPasswordResetEmail } = require("./email.service");

const sendPasswordResetMail = async (toEmail, resetUrl) => {
  return sendPasswordResetEmail(toEmail, resetUrl);
};

module.exports = sendPasswordResetMail;
