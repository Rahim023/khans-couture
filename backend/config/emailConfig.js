import nodemailer from "nodemailer";

// Validate email configuration
const validateEmailConfig = () => {
  const requiredVars = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS", "EMAIL_FROM"];
  const missing = requiredVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    const error = `❌ CRITICAL: Missing email configuration variables: ${missing.join(", ")}`;
    console.error(error);
    console.error("Please add these to your .env file:");
    console.error(`
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_NOTIFICATION_EMAIL=your-email@gmail.com
    `);
    return false;
  }
  return true;
};

// Log email configuration (without password)
const logEmailConfig = () => {
  console.log("\n📧 EMAIL CONFIGURATION:");
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   Secure: ${process.env.EMAIL_SECURE}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM}`);
  console.log(`   Admin Email: ${process.env.ADMIN_NOTIFICATION_EMAIL || "not set"}\n`);
};

// Create transporter AFTER dotenv.config() is called in server.js
export const createEmailTransporter = () => {
  if (!validateEmailConfig()) {
    throw new Error("Email configuration validation failed");
  }

  logEmailConfig();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST.trim(),
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.trim(),
    },
  });

  return transporter;
};

// Verify transporter connection
export const verifyEmailTransporter = async (transporter) => {
  try {
    await transporter.verify();
    console.log("✅ Email transporter verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email transporter verification failed:");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.code === "ECONNREFUSED") {
      console.error("   This usually means:");
      console.error("   1. Gmail SMTP server is unreachable (check internet)");
      console.error("   2. The EMAIL_HOST is incorrect (should be: smtp.gmail.com)");
      console.error("   3. The EMAIL_PORT is incorrect (should be: 587 for TLS)");
    }
    return false;
  }
};

// Export singleton transporter instance
let emailTransporter = null;

export const getEmailTransporter = () => {
  if (!emailTransporter) {
    emailTransporter = createEmailTransporter();
  }
  return emailTransporter;
};
