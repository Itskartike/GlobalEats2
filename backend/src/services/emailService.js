const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const path = require("path");
const fs = require("fs").promises;

// ─── Email Provider Setup ───────────────────────────────────────────
// Uses Resend (HTTP API) when RESEND_API_KEY is set (production on Render)
// Falls back to SMTP/nodemailer for local development
const useResend = !!process.env.RESEND_API_KEY;
let resend = null;
let transporter = null;

if (useResend) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("📧 Email provider: Resend (HTTP API)");
} else {
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  console.log("📧 Email provider: SMTP");
}

// Email templates
const emailTemplates = {
  welcome: {
    subject: "Welcome to GlobalEats!",
    template: "welcome.html",
  },
  orderConfirmation: {
    subject: "Order Confirmed - GlobalEats",
    template: "order-confirmation.html",
  },
  orderStatusUpdate: {
    subject: "Order Status Update - GlobalEats",
    template: "order-status-update.html",
  },
  passwordReset: {
    subject: "Password Reset Request - GlobalEats",
    template: "password-reset.html",
  },
  emailVerification: {
    subject: "Verify Your Email - GlobalEats",
    template: "email-verification.html",
  },
  restaurantApproval: {
    subject: "Restaurant Approval - GlobalEats",
    template: "restaurant-approval.html",
  },
};

// Load email template
const loadTemplate = async (templateName) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../templates/emails",
      templateName
    );
    const template = await fs.readFile(templatePath, "utf8");
    return template;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    return null;
  }
};

// Replace placeholders in template
const replacePlaceholders = (template, data) => {
  let result = template;

  Object.keys(data).forEach((key) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), data[key]);
  });

  return result;
};

// Send email via the configured provider
const sendEmail = async (to, templateName, data = {}) => {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const htmlTemplate = await loadTemplate(template.template);
    if (!htmlTemplate) {
      throw new Error(`Email template file '${template.template}' not found`);
    }

    const html = replacePlaceholders(htmlTemplate, {
      ...data,
      appUrl: getFrontendUrl(),
      currentYear: new Date().getFullYear(),
    });

    const fromAddress =
      process.env.RESEND_FROM || process.env.SMTP_FROM || "Global-Eats <onboarding@resend.dev>";

    if (useResend) {
      // Send via Resend HTTP API (works on Render)
      const { data: result, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: template.subject,
        html: html,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Email sent via Resend:", result.id);
      return { success: true, messageId: result.id };
    } else {
      // Send via SMTP/nodemailer (local dev)
      const info = await transporter.sendMail({
        from: fromAddress,
        to: to,
        subject: template.subject,
        html: html,
      });

      console.log("Email sent via SMTP:", info.messageId);
      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const data = {
    userName: user.name,
    userEmail: user.email,
    verificationLink: `${getFrontendUrl()}/verify-email?token=${user.verification_token}`,
  };

  return sendEmail(user.email, "welcome", data);
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order, user) => {
  const data = {
    userName: user.name,
    orderNumber: order.order_number,
    orderTotal: `₹${order.total_amount}`,
    orderDate: new Date(order.created_at).toLocaleDateString(),
    deliveryAddress: order.delivery_address,
    estimatedDeliveryTime: order.estimated_delivery_time
      ? new Date(order.estimated_delivery_time).toLocaleString()
      : "TBD",
    orderLink: `${process.env.APP_URL}/orders/${order.id}`,
  };

  return sendEmail(user.email, "orderConfirmation", data);
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (order, user, status) => {
  const statusMessages = {
    confirmed: "Your order has been confirmed and is being prepared",
    preparing: "Your order is being prepared by the restaurant",
    ready: "Your order is ready and will be picked up soon",
    picked_up: "Your order has been picked up and is on its way",
    out_for_delivery: "Your order is out for delivery",
    delivered: "Your order has been delivered successfully",
  };

  const data = {
    userName: user.name,
    orderNumber: order.order_number,
    status: status,
    statusMessage:
      statusMessages[status] || "Your order status has been updated",
    orderLink: `${process.env.APP_URL}/orders/${order.id}`,
  };

  return sendEmail(user.email, "orderStatusUpdate", data);
};

// Helper to get frontend URL for email links
const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000"
  );
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const data = {
    userName: user.name,
    resetLink: `${getFrontendUrl()}/reset-password?token=${resetToken}`,
    expiryTime: "10 minutes",
  };

  return sendEmail(user.email, "passwordReset", data);
};

// Send email verification email
const sendEmailVerificationEmail = async (user, verificationToken) => {
  const data = {
    userName: user.name,
    verificationLink: `${getFrontendUrl()}/verify-email?token=${verificationToken}`,
  };

  return sendEmail(user.email, "emailVerification", data);
};

// Send restaurant approval email
const sendRestaurantApprovalEmail = async (restaurant, user, approved) => {
  const data = {
    userName: user.name,
    restaurantName: restaurant.name,
    status: approved ? "approved" : "rejected",
    message: approved
      ? "Your restaurant has been approved and is now live on GlobalEats!"
      : "Your restaurant application has been reviewed and requires some modifications.",
    dashboardLink: `${process.env.APP_URL}/restaurant/dashboard`,
  };

  return sendEmail(user.email, "restaurantApproval", data);
};

// Send bulk email
const sendBulkEmail = async (recipients, templateName, data = {}) => {
  const results = [];

  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, templateName, {
      ...data,
      userName: recipient.name,
    });
    results.push({ recipient, result });
  }

  return results;
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    if (useResend) {
      console.log("✅ Email configured via Resend (HTTP API — no SMTP needed)");
      return true;
    }
    await transporter.verify();
    console.log("✅ Email configuration is valid (SMTP)");
    return true;
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendRestaurantApprovalEmail,
  sendBulkEmail,
  testEmailConfig,
};
