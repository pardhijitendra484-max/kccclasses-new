const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// ✅ Set API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ✅ Send Email (SAFE - won't crash app)
const sendEmail = async (to, subject, html) => {
  try {
    if (!to) throw new Error("Recipient email missing");

    const msg = {
      to,
      from: `"${process.env.APP_NAME || "KCC Classes"}" <${process.env.SENDER_EMAIL}>`, // must be verified in SendGrid
      subject,
      html,
    };

    const response = await sgMail.send(msg);

    console.log("✅ Email sent:", response[0].statusCode);
    return true;
  } catch (err) {
    console.error("❌ Email error:", err.response?.body || err.message);

    // 🚨 IMPORTANT: Do NOT crash app
    return false;
  }
};

// ================== EMAIL TEMPLATES ==================

const emailTemplates = {
   contactMessage: (name, email, phone, subject, message) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;">
    
    <div style="background:#4F46E5;color:#fff;padding:20px;text-align:center;">
      <h2 style="margin:0;">📩 New Contact Inquiry</h2>
    </div>

    <div style="padding:20px;">
      <p>Hello Admin,</p>
      <p>You have received a new inquiry from your website:</p>

      <table style="width:100%;border-collapse:collapse;margin-top:15px;">
        <tr>
          <td style="padding:8px;border:1px solid #ddd;"><strong>Full Name</strong></td>
          <td style="padding:8px;border:1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #ddd;"><strong>Email</strong></td>
          <td style="padding:8px;border:1px solid #ddd;">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #ddd;"><strong>Phone</strong></td>
          <td style="padding:8px;border:1px solid #ddd;">${phone || 'Not Provided'}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #ddd;"><strong>Subject</strong></td>
          <td style="padding:8px;border:1px solid #ddd;">${subject || 'General Inquiry'}</td>
        </tr>
      </table>

      <div style="margin-top:20px;">
        <h4>📝 Message:</h4>
        <div style="background:#f4f4f4;padding:15px;border-radius:5px;">
          ${message}
        </div>
      </div>

      <p style="margin-top:20px;">
        👉 Reply directly to this email to respond to the user.
      </p>
    </div>

    <div style="background:#f9f9f9;padding:10px;text-align:center;font-size:12px;color:#777;">
      KCC Classes Contact System
    </div>

  </div>
`,
  // ✅ Welcome Email
  welcome: (name, role, email, password) => `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#6C63FF;padding:30px;text-align:center;">
                <h1 style="color:#fff;margin:0;">Welcome to KCC Classes! 🎓</h1>
            </div>

            <div style="padding:30px;background:#f9f9f9;">
                <h2>Hello ${name}!</h2>
                <p>Your account has been created as <strong>${role}</strong>.</p>

                <div style="background:#fff;border-left:4px solid #6C63FF;padding:15px;margin:20px 0;">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Password:</strong> ${password}</p>
                    <p><strong>Role:</strong> ${role}</p>
                </div>

                <p>
                    Login at:
                    <a href="${process.env.APP_URL}/login">
                        ${process.env.APP_URL}/login
                    </a>
                </p>

                <p style="color:#888;font-size:12px;">
                    Please change your password after first login.
                </p>
            </div>
        </div>
    `,

  // ✅ Homework Assigned
  homeworkAssigned: (studentName, hwTitle, subject, dueDate, teacherName) => `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#6C63FF;padding:20px;text-align:center;">
                <h2 style="color:#fff;margin:0;">📚 New Homework Assigned</h2>
            </div>

            <div style="padding:25px;">
                <p>Hello <strong>${studentName}</strong>,</p>

                <div style="background:#f0f0ff;border-radius:8px;padding:20px;margin:15px 0;">
                    <p><strong>📖 Subject:</strong> ${subject}</p>
                    <p><strong>📝 Title:</strong> ${hwTitle}</p>
                    <p><strong>📅 Due Date:</strong> ${new Date(dueDate).toDateString()}</p>
                    <p><strong>👨‍🏫 Teacher:</strong> ${teacherName}</p>
                </div>

                <p>
                    Login to view and submit:
                    <a href="${process.env.APP_URL}">
                        ${process.env.APP_URL}
                    </a>
                </p>
            </div>
        </div>
    `,

  // ✅ Fee Reminder
  feeReminder: (studentName, month, amount, dueDate) => `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#FF6B6B;padding:20px;text-align:center;">
                <h2 style="color:#fff;margin:0;">💳 Fee Payment Reminder</h2>
            </div>

            <div style="padding:25px;">
                <p>Dear <strong>${studentName}</strong>,</p>
                <p>This is a reminder that your fee payment is due.</p>

                <div style="background:#fff5f5;border-radius:8px;padding:20px;margin:15px 0;">
                    <p><strong>Month:</strong> ${month}</p>
                    <p><strong>Amount:</strong> ₹${amount}</p>
                    <p><strong>Due Date:</strong> ${new Date(dueDate).toDateString()}</p>
                </div>

                <p>Please contact the institute to make payment.</p>
            </div>
        </div>
    `,
};

module.exports = { sendEmail, emailTemplates };
