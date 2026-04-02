import transporter from "../../config/nodemailer.js";
import { ok, fail } from "../../lib/httpResult.js";

export async function sendTestEmail({ email }) {
  if (!email) {
    return fail(400, "Email is required", { success: false });
  }

  try {
    const testMailOptions = {
      from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Test Email - OnSekiz",
      html: `
        <h1>Test Email</h1>
        <p>Bu bir test e-postasıdır.</p>
        <p>Eğer bu e-postayı alıyorsanız, email yapılandırması doğru çalışıyor demektir.</p>
        <p>Zaman: ${new Date().toISOString()}</p>
      `,
    };

    const info = await transporter.sendMail(testMailOptions);
    return ok(200, {
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
    });
  } catch (error) {
    return fail(500, "Failed to send test email", {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        response: error.response,
      },
    });
  }
}
