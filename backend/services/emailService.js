import { getEmailTransporter } from "../config/emailConfig.js";
import {
  customOrderCustomerTemplate,
  customOrderAdminTemplate,
  orderConfirmationCustomerTemplate,
  orderConfirmationAdminTemplate,
  otpVerificationTemplate,
  newsletterWelcomeTemplate,
} from "../config/emailTemplates.js";

// ============================================
// CUSTOM ORDER EMAILS
// ============================================

export const sendCustomOrderCustomerEmail = async (order) => {
  try {
    const transporter = getEmailTransporter();
    const html = customOrderCustomerTemplate(order);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: order.email,
      subject: "✨ Custom Order Enquiry Received - Khan's Couture",
      html,
    });

    console.log(`✅ Custom order customer email sent to ${order.email}`);
  } catch (error) {
    console.error("❌ Failed to send custom order customer email:", error.message);
    throw error;
  }
};

export const sendCustomOrderAdminEmail = async (order) => {
  try {
    const transporter = getEmailTransporter();
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "info.khanscouture@gmail.com";
    const html = customOrderAdminTemplate(order);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: adminEmail,
      subject: `🎯 NEW CUSTOM ORDER - ${order.fullName} - ID: ${order._id}`,
      html,
    });

    console.log(`✅ Custom order admin email sent to ${adminEmail}`);
  } catch (error) {
    console.error("❌ Failed to send custom order admin email:", error.message);
    throw error;
  }
};

// ============================================
// ORDER CONFIRMATION EMAILS
// ============================================

export const sendOrderConfirmationCustomerEmail = async (order, customer) => {
  try {
    const transporter = getEmailTransporter();
    const html = orderConfirmationCustomerTemplate(order, customer);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: customer.email,
      subject: `📦 Order Confirmed - ID: ${order._id} - Khan's Couture`,
      html,
    });

    console.log(`✅ Order confirmation email sent to ${customer.email}`);
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error.message);
    throw error;
  }
};

export const sendOrderConfirmationAdminEmail = async (order, customer) => {
  try {
    const transporter = getEmailTransporter();
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "info.khanscouture@gmail.com";
    const html = orderConfirmationAdminTemplate(order, customer);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: adminEmail,
      subject: `📦 NEW ORDER - ${customer.username} - Total: ₹${order.totalINR}`,
      html,
    });

    console.log(`✅ Order confirmation admin email sent to ${adminEmail}`);
  } catch (error) {
    console.error("❌ Failed to send order confirmation admin email:", error.message);
    throw error;
  }
};

// ============================================
// OTP VERIFICATION EMAIL
// ============================================

export const sendOTPVerificationEmail = async (email, otp, username) => {
  try {
    const transporter = getEmailTransporter();
    const html = otpVerificationTemplate(otp, username);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Verify Your Khan's Couture Account",
      html,
    });

    console.log(`✅ OTP verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error.message);
    throw error;
  }
};

// ============================================
// NEWSLETTER EMAILS
// ============================================

export const sendNewsletterWelcomeEmail = async (email) => {
  try {
    const transporter = getEmailTransporter();
    const html = newsletterWelcomeTemplate(email);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "✨ Welcome to Khan's Couture Newsletter!",
      html,
    });

    console.log(`✅ Newsletter welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send newsletter welcome email:", error.message);
    throw error;
  }
};

export const sendNewsletterAdminNotification = async (email) => {
  try {
    const transporter = getEmailTransporter();
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "info.khanscouture@gmail.com";

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: adminEmail,
      subject: `📧 New Newsletter Subscriber: ${email}`,
      html: `
        <h3>New Newsletter Subscriber</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subscribed At:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log(`✅ Newsletter admin notification sent`);
  } catch (error) {
    console.error("❌ Failed to send newsletter admin notification:", error.message);
  }
};

// ============================================
// LEGACY FUNCTIONS (For backward compatibility)
// ============================================

export const sendAdminNotification = sendCustomOrderAdminEmail;
export const sendCustomerConfirmation = sendCustomOrderCustomerEmail;


    