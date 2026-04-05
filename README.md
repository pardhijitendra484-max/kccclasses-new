# KCC Classes — Full Stack School Management System

A complete tuition/classes management website with Admin, Teacher, and Student dashboards.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
npm install --prefix client
```

### 2. Configure environment
Edit `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:8080
```

### 3. Seed default accounts
```bash
npm run seed
```

### 4. Run in development
```bash
npm run dev
```
- Backend: http://localhost:5000
- Frontend: http://localhost:8080

---

## 🔑 Default Login Credentials

| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| Admin   | admin@kccclasses.com      | Admin@123     |
| Teacher | omendra@kccclasses.com    | Teacher@123   |
| Student | (add via admin panel)     | Tuition@123   |

---

## 📋 Features

### Admin Dashboard
- **Overview** — Stats: students count, teachers count, fee collected, fee pending
- **Students tab** — Add, edit, delete students; search by name/email
- **Teachers tab** — Add, edit, delete teachers with subject info
- **Fees tab** — Add fee records, collect payments (cash/UPI/bank/cheque), auto receipt generation
- **Homework tab** — View all homework assigned by teachers
- **Teacher Attendance tab** — View all attendance records marked by teachers with present/absent/late breakdown
- **Notices tab** — Post announcements to all / students only / teachers only

### Teacher Dashboard
- **Dashboard** — Overview stats + quick actions
- **Homework** — Assign homework with subject, due date, priority; view submissions
- **Attendance** — Mark daily student attendance (present/absent/late); history with rates
- **Tests** — Create tests; enter marks for each student; auto grade calculation (A+/A/B+/B/C/D/F)
- **My Students** — Full student list with course and fee status
- **Notices** — Post and manage announcements

### Student Dashboard
- **Homework** — See all assigned homework; submit with notes; view submission status and grades
- **My Fees** — View fee records, payment history, receipts
- **Results** — View test results and grades across all tests
- **Attendance** — View personal attendance history, present/absent/late with percentage
- **Notices** — View announcements from teachers and admin

---

## 🗄 Database Models

| Model        | Purpose                              |
|-------------|--------------------------------------|
| User         | Students, teachers, admins           |
| Fee          | Fee records per student per month    |
| Homework     | Assignments with submissions         |
| Attendance   | Daily attendance records             |
| Test         | Tests with per-student results       |
| Announcement | Notices from teachers/admin          |
| Contact      | Contact form submissions             |

---

## 🛠 Tech Stack

- **Frontend:** React 18, React Router v6, Axios, React-Toastify, AOS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + HTTP-only cookies
- **Styling:** Custom CSS (no UI library dependency)

