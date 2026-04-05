const sgMail = require('@sendgrid/mail')
require('dotenv').config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const APP_NAME = process.env.APP_NAME || 'KCC Classes'
const APP_URL  = process.env.APP_URL  || 'http://localhost:5173'
const FROM     = `"${APP_NAME}" <${process.env.SENDER_EMAIL}>`

// ─────────────────────────────────────────────────────────────────────────────
// CORE SEND HELPER — never crashes the app
// ─────────────────────────────────────────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  try {
    if (!to || !process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
      console.warn('⚠️  Email skipped — SENDGRID_API_KEY or SENDER_EMAIL not configured')
      return false
    }
    await sgMail.send({ to, from: FROM, subject, html })
    console.log(`✅ Email sent → ${to} | ${subject}`)
    return true
  } catch (err) {
    console.error('❌ Email error:', err.response?.body?.errors || err.message)
    return false
  }
}

// Send to multiple recipients (batched)
const sendBulkEmail = async (recipients, subject, htmlFn) => {
  const results = await Promise.allSettled(
    recipients.map(r => sendEmail(r.email, subject, htmlFn(r)))
  )
  const sent   = results.filter(r => r.status === 'fulfilled' && r.value).length
  const failed = results.length - sent
  console.log(`📧 Bulk email: ${sent} sent, ${failed} failed`)
  return { sent, failed }
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HTML COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const header = (title, color = '#6C63FF', icon = '🎓') => `
  <div style="background:${color};padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
    <div style="font-size:36px;margin-bottom:8px;">${icon}</div>
    <h1 style="color:#fff;margin:0;font-family:Arial,sans-serif;font-size:22px;font-weight:700;">${title}</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;font-family:Arial,sans-serif;">${APP_NAME}</p>
  </div>`

const footer = () => `
  <div style="background:#F8FAFC;padding:20px 24px;text-align:center;border-radius:0 0 12px 12px;border-top:1px solid #E2E8F0;">
    <p style="margin:0;font-size:12px;color:#94A3B8;font-family:Arial,sans-serif;">
      This is an automated notification from <strong>${APP_NAME}</strong>.<br/>
      Please do not reply to this email.
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:#94A3B8;font-family:Arial,sans-serif;">
      © ${new Date().getFullYear()} ${APP_NAME} — All rights reserved
    </p>
  </div>`

const wrap = (content) => `
  <!DOCTYPE html>
  <html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
  <body style="margin:0;padding:20px;background:#F1F5F9;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
      ${content}
    </div>
  </body></html>`

const loginBtn = (label = 'Login to Dashboard') => `
  <div style="text-align:center;margin:24px 0;">
    <a href="${APP_URL}/login" style="display:inline-block;background:#6C63FF;color:#fff;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;font-family:Arial,sans-serif;">${label}</a>
  </div>`

const infoRow = (label, value) => `
  <tr>
    <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;font-weight:600;color:#374151;font-size:13px;width:40%;background:#F8FAFC;">${label}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;color:#1E293B;font-size:13px;">${value}</td>
  </tr>`

const infoTable = (rows) => `
  <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin:16px 0;">
    ${rows}
  </table>`

const badge = (text, color) => `
  <span style="display:inline-block;background:${color}22;color:${color};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">${text}</span>`

// ─────────────────────────────────────────────────────────────────────────────
// 1. WELCOME EMAIL — sent when admin creates a student or teacher account
// ─────────────────────────────────────────────────────────────────────────────
const welcomeEmail = (name, role, email, password, extra = {}) => wrap(`
  ${header(`Welcome to ${APP_NAME}! 🎉`, role === 'teacher' ? '#8B5CF6' : '#6C63FF', role === 'teacher' ? '👨‍🏫' : '🎓')}
  <div style="padding:28px 24px;">
    <p style="font-size:16px;font-weight:700;color:#1E293B;margin:0 0 8px;">Hello ${name}! 👋</p>
    <p style="color:#64748B;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Your ${role} account has been created at <strong>${APP_NAME}</strong>. Here are your login credentials:
    </p>
    ${infoTable(`
      ${infoRow('Full Name', name)}
      ${infoRow('Email / Login ID', email)}
      ${infoRow('Password', `<code style="background:#F0FDF4;padding:2px 8px;border-radius:4px;font-weight:700;color:#16A34A;">${password}</code>`)}
      ${infoRow('Role', badge(role.toUpperCase(), role === 'teacher' ? '#8B5CF6' : '#6C63FF'))}
      ${extra.course ? infoRow('Enrolled Course', extra.course) : ''}
      ${extra.subject ? infoRow('Subject', extra.subject) : ''}
    `)}
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:14px 16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#92400E;font-weight:600;">⚠️ Important Security Notice</p>
      <p style="margin:6px 0 0;font-size:13px;color:#92400E;">Please change your password after your first login for security.</p>
    </div>
    ${loginBtn('Access Your Dashboard')}
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 2. HOMEWORK ASSIGNED — sent to all students when teacher assigns homework
// ─────────────────────────────────────────────────────────────────────────────
const homeworkAssignedEmail = (studentName, hw) => wrap(`
  ${header('New Homework Assigned 📚', '#6C63FF', '📚')}
  <div style="padding:28px 24px;">
    <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Hello <strong>${studentName}</strong>,</p>
    <p style="color:#64748B;font-size:14px;margin:0 0 16px;">Your teacher has assigned new homework. Please complete it before the due date.</p>
    ${infoTable(`
      ${infoRow('Title', `<strong>${hw.title}</strong>`)}
      ${infoRow('Subject', hw.subject)}
      ${infoRow('Description', hw.description)}
      ${infoRow('Due Date', `<span style="color:#EF4444;font-weight:700;">${new Date(hw.dueDate).toDateString()}</span>`)}
      ${infoRow('Priority', badge(hw.priority.toUpperCase(), hw.priority === 'high' ? '#EF4444' : hw.priority === 'medium' ? '#F59E0B' : '#22C55E'))}
      ${infoRow('Assigned By', hw.assignedByName)}
    `)}
    ${loginBtn('Submit Homework')}
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 3. HOMEWORK GRADED — sent to student when teacher grades their submission
// ─────────────────────────────────────────────────────────────────────────────
const homeworkGradedEmail = (studentName, hw, grade, note) => wrap(`
  ${header('Homework Graded ✅', '#22C55E', '✅')}
  <div style="padding:28px 24px;">
    <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Hello <strong>${studentName}</strong>,</p>
    <p style="color:#64748B;font-size:14px;margin:0 0 16px;">Your homework has been graded by your teacher.</p>
    ${infoTable(`
      ${infoRow('Homework', hw.title)}
      ${infoRow('Subject', hw.subject)}
      ${infoRow('Grade', `<span style="font-size:22px;font-weight:900;color:#6C63FF;">${grade}</span>`)}
      ${note ? infoRow('Teacher Note', `<em style="color:#64748B;">${note}</em>`) : ''}
    `)}
    ${loginBtn('View Details')}
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 4. ATTENDANCE SUMMARY — sent to each student with their daily attendance
// ─────────────────────────────────────────────────────────────────────────────
const attendanceSummaryEmail = (studentName, date, status, teacherName, stats) => {
  const statusConfig = {
    present: { color: '#22C55E', icon: '✅', label: 'PRESENT' },
    absent:  { color: '#EF4444', icon: '❌', label: 'ABSENT'  },
    late:    { color: '#F59E0B', icon: '⏰', label: 'LATE'    },
  }
  const s = statusConfig[status] || statusConfig.absent
  return wrap(`
    ${header('Attendance Marked 📋', s.color, s.icon)}
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Hello <strong>${studentName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;margin:0 0 16px;">Your attendance has been recorded for today's class.</p>
      ${infoTable(`
        ${infoRow('Date', new Date(date).toDateString())}
        ${infoRow('Status', badge(s.label, s.color))}
        ${infoRow('Marked By', teacherName)}
        ${stats ? infoRow('Your Attendance %', `<strong style="color:${stats.pct >= 75 ? '#22C55E' : '#EF4444'}">${stats.pct}%</strong> (${stats.present} present / ${stats.total} classes)`) : ''}
      `)}
      ${status === 'absent' ? `
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:14px 16px;margin:16px 0;">
          <p style="margin:0;font-size:13px;color:#DC2626;font-weight:600;">⚠️ Absence Notice</p>
          <p style="margin:6px 0 0;font-size:13px;color:#DC2626;">You were marked absent today. If this is incorrect, please contact your teacher.</p>
        </div>` : ''}
      ${loginBtn('View Full Attendance')}
    </div>
    ${footer()}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TEST RESULT — sent to student when teacher enters their marks
// ─────────────────────────────────────────────────────────────────────────────
const testResultEmail = (studentName, test, marks, grade) => {
  const pct = Math.round((marks / test.maxMarks) * 100)
  const gradeColor = grade === 'A+' || grade === 'A' ? '#22C55E'
    : grade === 'B+' || grade === 'B' ? '#3B82F6'
    : grade === 'C' || grade === 'D' ? '#F59E0B' : '#EF4444'
  return wrap(`
    ${header('Test Result Published 📊', '#3B82F6', '📊')}
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Hello <strong>${studentName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;margin:0 0 16px;">Your result for the following test has been published.</p>
      ${infoTable(`
        ${infoRow('Test Name', `<strong>${test.title}</strong>`)}
        ${infoRow('Subject', test.subject)}
        ${infoRow('Test Date', new Date(test.date).toDateString())}
        ${infoRow('Your Marks', `<span style="font-size:20px;font-weight:900;color:#6C63FF;">${marks} / ${test.maxMarks}</span>`)}
        ${infoRow('Percentage', `<strong>${pct}%</strong>`)}
        ${infoRow('Grade', `<span style="font-size:24px;font-weight:900;color:${gradeColor};">${grade}</span>`)}
      `)}
      <div style="background:${gradeColor}11;border:1px solid ${gradeColor}44;border-radius:8px;padding:14px 16px;margin:16px 0;text-align:center;">
        <p style="margin:0;font-size:14px;color:${gradeColor};font-weight:700;">
          ${pct >= 80 ? '🌟 Excellent performance! Keep it up!' : pct >= 60 ? '👍 Good work! Aim higher next time.' : pct >= 35 ? '📚 Study harder and you will improve.' : '⚠️ Please consult your teacher for guidance.'}
        </p>
      </div>
      ${loginBtn('View All Results')}
    </div>
    ${footer()}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FEE ADDED — sent to student when admin adds a fee record
// ─────────────────────────────────────────────────────────────────────────────
const feeAddedEmail = (studentName, fee) => wrap(`
  ${header('Fee Record Added 💳', '#F59E0B', '💳')}
  <div style="padding:28px 24px;">
    <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Hello <strong>${studentName}</strong>,</p>
    <p style="color:#64748B;font-size:14px;margin:0 0 16px;">A new fee record has been created for your account.</p>
    ${infoTable(`
      ${infoRow('Month', fee.month)}
      ${infoRow('Amount Due', `<span style="font-size:20px;font-weight:900;color:#EF4444;">₹${fee.amount?.toLocaleString('en-IN')}</span>`)}
      ${fee.dueDate ? infoRow('Due Date', `<span style="color:#EF4444;font-weight:700;">${new Date(fee.dueDate).toDateString()}</span>`) : ''}
      ${infoRow('Status', badge('PENDING', '#F59E0B'))}
    `)}
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:14px 16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#92400E;">Please visit the institute or contact the admin to make your payment.</p>
    </div>
    ${loginBtn('View Fee Details')}
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 7. FEE RECEIPT — sent to student after admin collects payment
// ─────────────────────────────────────────────────────────────────────────────
const feeReceiptEmail = (studentName, fee, receiptNo) => wrap(`
  ${header('Payment Receipt 🧾', '#22C55E', '🧾')}
  <div style="padding:28px 24px;">
    <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Dear <strong>${studentName}</strong>,</p>
    <p style="color:#64748B;font-size:14px;margin:0 0 16px;">Your fee payment has been received successfully. Please keep this receipt for your records.</p>

    <div style="background:#F0FDF4;border:2px solid #22C55E;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">Receipt Number</p>
      <p style="margin:4px 0;font-size:22px;font-weight:900;color:#16A34A;font-family:monospace;">${receiptNo}</p>
    </div>

    ${infoTable(`
      ${infoRow('Month', fee.month)}
      ${infoRow('Total Fee', `₹${fee.amount?.toLocaleString('en-IN')}`)}
      ${infoRow('Amount Paid', `<span style="font-weight:900;color:#22C55E;font-size:16px;">₹${fee.paidAmount?.toLocaleString('en-IN')}</span>`)}
      ${infoRow('Payment Method', fee.method?.toUpperCase() || 'CASH')}
      ${infoRow('Payment Date', new Date(fee.paidDate || Date.now()).toDateString())}
      ${infoRow('Status', badge(fee.status.toUpperCase(), fee.status === 'paid' ? '#22C55E' : '#F59E0B'))}
    `)}
    ${loginBtn('View All Fees')}
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 8. ANNOUNCEMENT — sent to students/teachers when admin or teacher posts notice
// ─────────────────────────────────────────────────────────────────────────────
const announcementEmail = (recipientName, announcement, postedByName, postedByRole) => wrap(`
  ${header('New Announcement 📢', '#6C63FF', '📢')}
  <div style="padding:28px 24px;">
    <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Hello <strong>${recipientName}</strong>,</p>
    <p style="color:#64748B;font-size:14px;margin:0 0 16px;">
      A new announcement has been posted by <strong>${postedByName}</strong> (${postedByRole}).
    </p>

    <div style="background:#EEF2FF;border-left:4px solid #6C63FF;border-radius:0 8px 8px 0;padding:18px 20px;margin:16px 0;">
      <h3 style="margin:0 0 10px;color:#1E293B;font-size:16px;">${announcement.title}</h3>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">${announcement.message}</p>
    </div>

    ${infoTable(`
      ${infoRow('Posted By', postedByName)}
      ${infoRow('Role', badge(postedByRole.toUpperCase(), '#6C63FF'))}
      ${infoRow('Date', new Date().toDateString())}
    `)}
    ${loginBtn('View All Notices')}
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 9. SELF-REGISTRATION WELCOME — sent when student registers themselves
// ─────────────────────────────────────────────────────────────────────────────
const registrationWelcomeEmail = (name, role, email) => wrap(`
  ${header(`Registration Successful! 🎉`, '#6C63FF', '🎉')}
  <div style="padding:28px 24px;">
    <p style="font-size:16px;font-weight:700;color:#1E293B;margin:0 0 8px;">Welcome, ${name}!</p>
    <p style="color:#64748B;font-size:14px;margin:0 0 20px;line-height:1.6;">
      Your ${role} account at <strong>${APP_NAME}</strong> has been successfully created.
    </p>
    ${infoTable(`
      ${infoRow('Name', name)}
      ${infoRow('Email', email)}
      ${infoRow('Role', badge(role.toUpperCase(), '#6C63FF'))}
      ${infoRow('Status', badge('ACTIVE', '#22C55E'))}
    `)}
    <div style="background:#EEF2FF;border-radius:8px;padding:14px 16px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#4338CA;">💡 You can now login and access your dashboard to view homework, fees, attendance, and results.</p>
    </div>
    ${loginBtn('Login Now')}
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 10. CONTACT FORM — sent to admin when someone submits contact form
// ─────────────────────────────────────────────────────────────────────────────
const contactFormEmail = (name, email, phone, subject, message) => wrap(`
  ${header('New Contact Inquiry 📩', '#0F0E1A', '📩')}
  <div style="padding:28px 24px;">
    <p style="color:#64748B;font-size:14px;margin:0 0 16px;">A new inquiry has been submitted through the website contact form.</p>
    ${infoTable(`
      ${infoRow('Name', name)}
      ${infoRow('Email', `<a href="mailto:${email}" style="color:#6C63FF;">${email}</a>`)}
      ${infoRow('Phone', phone || 'Not provided')}
      ${infoRow('Subject', subject || 'General Inquiry')}
    `)}
    <div style="margin:16px 0;">
      <p style="font-weight:700;color:#374151;font-size:14px;margin:0 0 8px;">Message:</p>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;font-size:14px;color:#1E293B;line-height:1.7;">
        ${message}
      </div>
    </div>
    <p style="font-size:13px;color:#64748B;">Reply directly to <a href="mailto:${email}" style="color:#6C63FF;">${email}</a> to respond to this inquiry.</p>
  </div>
  ${footer()}`)

// ─────────────────────────────────────────────────────────────────────────────
// 11. FEE REMINDER — bulk reminder for overdue fees
// ─────────────────────────────────────────────────────────────────────────────
const feeReminderEmail = (studentName, fees) => {
  const totalDue = fees.reduce((a, f) => a + (f.amount - (f.paidAmount || 0)), 0)
  const feeRows = fees.map(f => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;font-size:13px;">${f.month}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;font-size:13px;">₹${f.amount?.toLocaleString('en-IN')}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;font-size:13px;">${f.dueDate ? new Date(f.dueDate).toDateString() : '—'}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F1F5F9;">${badge(f.status.toUpperCase(), f.status === 'overdue' ? '#EF4444' : '#F59E0B')}</td>
    </tr>`).join('')

  return wrap(`
    ${header('Fee Payment Reminder ⚠️', '#EF4444', '⚠️')}
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#1E293B;margin:0 0 16px;">Dear <strong>${studentName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;margin:0 0 16px;">This is a reminder that you have outstanding fee payments.</p>

      <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin:16px 0;">
        <thead>
          <tr style="background:#F8FAFC;">
            <th style="padding:10px 14px;text-align:left;font-size:12px;color:#64748B;text-transform:uppercase;">Month</th>
            <th style="padding:10px 14px;text-align:left;font-size:12px;color:#64748B;text-transform:uppercase;">Amount</th>
            <th style="padding:10px 14px;text-align:left;font-size:12px;color:#64748B;text-transform:uppercase;">Due Date</th>
            <th style="padding:10px 14px;text-align:left;font-size:12px;color:#64748B;text-transform:uppercase;">Status</th>
          </tr>
        </thead>
        <tbody>${feeRows}</tbody>
      </table>

      <div style="background:#FEF2F2;border:2px solid #EF4444;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
        <p style="margin:0;font-size:12px;color:#DC2626;">Total Outstanding</p>
        <p style="margin:4px 0 0;font-size:28px;font-weight:900;color:#DC2626;">₹${totalDue.toLocaleString('en-IN')}</p>
      </div>

      <p style="color:#64748B;font-size:13px;">Please contact the institute immediately to clear your dues and avoid any disruption to your classes.</p>
      ${loginBtn('View Fee Details')}
    </div>
    ${footer()}`)
}

module.exports = {
  sendEmail,
  sendBulkEmail,
  // Named template senders — call these from route files
  emails: {
    welcome:              (to, name, role, password, extra)              => sendEmail(to, `Welcome to ${APP_NAME} — Your Login Details`, welcomeEmail(name, role, to, password, extra)),
    registrationWelcome:  (to, name, role)                               => sendEmail(to, `Welcome to ${APP_NAME}! Your account is ready`, registrationWelcomeEmail(name, role, to)),
    homeworkAssigned:     (to, studentName, hw)                          => sendEmail(to, `📚 New Homework: ${hw.title} — ${hw.subject}`, homeworkAssignedEmail(studentName, hw)),
    homeworkGraded:       (to, studentName, hw, grade, note)             => sendEmail(to, `✅ Your Homework Has Been Graded — ${hw.title}`, homeworkGradedEmail(studentName, hw, grade, note)),
    attendanceSummary:    (to, studentName, date, status, teacher, stats)=> sendEmail(to, `📋 Attendance Marked: ${status.toUpperCase()} — ${new Date(date).toDateString()}`, attendanceSummaryEmail(studentName, date, status, teacher, stats)),
    testResult:           (to, studentName, test, marks, grade)          => sendEmail(to, `📊 Test Result: ${test.title} — Grade ${grade}`, testResultEmail(studentName, test, marks, grade)),
    feeAdded:             (to, studentName, fee)                         => sendEmail(to, `💳 Fee Record Added — ${fee.month}`, feeAddedEmail(studentName, fee)),
    feeReceipt:           (to, studentName, fee, receiptNo)              => sendEmail(to, `🧾 Payment Receipt — ${receiptNo}`, feeReceiptEmail(studentName, fee, receiptNo)),
    feeReminder:          (to, studentName, fees)                        => sendEmail(to, `⚠️ Fee Payment Reminder — ${APP_NAME}`, feeReminderEmail(studentName, fees)),
    announcement:         (to, recipientName, ann, postedByName, role)   => sendEmail(to, `📢 ${ann.title} — Announcement from ${APP_NAME}`, announcementEmail(recipientName, ann, postedByName, role)),
    contactForm:          (adminEmail, name, email, phone, subj, msg)    => sendEmail(adminEmail, `📩 New Contact Inquiry from ${name}`, contactFormEmail(name, email, phone, subj, msg)),
  }
}
