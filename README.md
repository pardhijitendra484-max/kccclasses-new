# KCC Classes — Full Stack School Management System

## 🚀 Deploy on Railway (Fix for "Cannot GET /")

### The Problem
Railway runs `npm start` but never builds the React frontend.
The fix: configure Railway to run `npm run build` first.

---

### ✅ Step-by-Step Railway Deployment

#### Step 1 — Push your code to GitHub
Make sure all these files exist in your repo root:
- `railway.toml` ✅ (included)
- `package.json` with `build` and `start` scripts ✅
- `server/server.js` ✅

#### Step 2 — Set Environment Variables in Railway
Go to your Railway project → **Variables** tab and add:

| Variable     | Value                                      |
|--------------|--------------------------------------------|
| `NODE_ENV`   | `production`                               |
| `MONGO_URI`  | your MongoDB connection string             |
| `JWT_SECRET` | any long random string (min 32 chars)      |
| `PORT`       | `5000` (Railway sets this automatically)   |

#### Step 3 — Set Build & Start Commands in Railway
In Railway → your service → **Settings** tab:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

#### Step 4 — Redeploy
Click **Deploy** and watch the build logs. You should see:
```
✅ Serving React build from client/dist
🚀 KCC Server running on port 5000
```

---

## 🔑 Default Login Credentials

| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| Admin   | admin@kccclasses.com      | Admin@123     |
| Teacher | omendra@kccclasses.com    | Teacher@123   |

Run `npm run seed` once after first deployment to create these accounts.

---

## 💻 Local Development

```bash
# Install all dependencies
npm install
npm install --prefix client

# Seed database
npm run seed

# Run both backend + frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 📋 Features

### Admin Dashboard
- Students management (add/edit/delete/search)
- Teachers management
- Fee management with payment collection (cash/UPI/bank/cheque)
- View all homework assigned by teachers
- Teacher attendance records
- Post announcements

### Teacher Dashboard
- Assign homework with due dates and priorities
- Mark daily attendance (present/absent/late) — saved to MongoDB
- Create tests and enter student marks (auto grade A+→F)
- View all students
- Post announcements

### Student Dashboard
- View and submit homework
- View personal attendance history with percentage
- View test results and grades
- View fee records and payment history
- Read announcements from teachers/admin

