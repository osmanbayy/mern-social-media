import nodemailer from "nodemailer";
import "dotenv/config"

const getSmtpConfig = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP credentials missing!");
    console.error("SMTP_USER:", process.env.SMTP_USER ? "Set" : "NOT SET");
    console.error("SMTP_PASS:", process.env.SMTP_PASS ? "Set" : "NOT SET");
    throw new Error("SMTP credentials are not configured");
  }

  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };
  }

  return {
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };
};

let transporter;

try {
  const config = getSmtpConfig();
  transporter = nodemailer.createTransport(config);
  console.log("Nodemailer transporter created successfully");
} catch (error) {
  console.error("Failed to create nodemailer transporter:", error.message);

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

export default transporter;
