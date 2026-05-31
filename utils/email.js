const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // If SMTP configs are not defined, log the email to console (safe fallback for local development)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("==================================================");
    console.log("MOCK EMAIL SENT (Configure EMAIL_USER/EMAIL_PASS in .env)");
    console.log("To:", options.email);
    console.log("Subject:", options.subject);
    console.log("Message:", options.message);
    console.log("==================================================");
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Define email options
  const mailOptions = {
    from: `"AntiGravity Support" <noreply@antigravity-airbnb.com>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  // Send the actual email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
