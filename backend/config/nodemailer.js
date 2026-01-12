import nodemailer from "nodemailer";
import "dotenv/config"

// SMTP yapılandırması - Environment variables'dan alınır
// Farklı email servisleri için kullanılabilir (Gmail, Outlook, Brevo, SendGrid, vb.)

const getSmtpConfig = () => {
  // Eğer özel SMTP host belirtilmişse onu kullan
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }

  // Varsayılan: Gmail (en yaygın kullanılan)
  return {
    service: 'gmail', // Gmail için service kullanılabilir
    auth: {
      user: process.env.SMTP_USER, // Gmail adresiniz
      pass: process.env.SMTP_PASS, // Gmail App Password
    },
  };
};

const transporter = nodemailer.createTransport(getSmtpConfig());

export default transporter;
