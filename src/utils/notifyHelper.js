const { __transporter } = require("./mailer");

/**
 * Send login credentials to the user via email.
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email HTML/text content
 */
const sendLoginEmail = async (toEmail, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: toEmail,
      subject,
      html: message,
    };

    const result = await __transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Email Send Error:", error.message);
    throw error;
  }
};
