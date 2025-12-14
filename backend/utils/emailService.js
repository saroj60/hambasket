import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter
// For dev, we can use Ethereal or just log to console if no creds
const transporter = nodemailer.createTransport({
    service: "gmail", // Or use host/port for other providers
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes('your-email')) {
        console.log("⚠️ No valid Email Credentials found. Logging email to console:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"HyperBasket" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("✅ Email sent: %s", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", error);
        // Fallback log
        console.log(`(Fallback) To: ${to}, Subject: ${subject}, Body: ${html}`);
    }
};

export const sendVerificationEmail = async (email, token) => {
    const url = `http://localhost:5173/verify-email?token=${token}`;
    const html = `
    <h1>Verify your email</h1>
    <p>Click the link below to verify your account:</p>
    <a href="${url}">${url}</a>
  `;
    await sendEmail({ to: email, subject: "Verify your HyperBasket Account", html });
};

export const sendPasswordResetEmail = async (email, token) => {
    const url = `http://localhost:5173/reset-password?token=${token}`;
    const html = `
    <h1>Reset your password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${url}">${url}</a>
  `;
    await sendEmail({ to: email, subject: "Reset Password Request", html });
};
