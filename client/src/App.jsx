// import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
// import { useEffect } from 'react'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import AOS from 'aos'

// // Common
// import Navbar      from './components/common/Navbar.jsx'
// import Footer      from './components/common/Footer.jsx'
// import ScrollTop   from './components/common/ScrollTop.jsx'
// import ProtectedRoute from './components/dashboard/ProtectedRoute.jsx'

// // Public pages
// import Home     from './pages/Home.jsx'
// import About    from './pages/About.jsx'
// import Courses  from './pages/Courses.jsx'
// import Contact  from './pages/Contact.jsx'
// import Login    from './pages/Login.jsx'
// import Register from './pages/Register.jsx'
// import NotFound from './pages/NotFound.jsx'

// // Dashboard pages
// import AdminDashboard   from './pages/dashboard/AdminDashboard.jsx'
// import TeacherDashboard from './pages/dashboard/TeacherDashboard.jsx'
// import StudentDashboard from './pages/dashboard/StudentDashboard.jsx'

// function ScrollToTop() {
//   const { pathname } = useLocation()
//   useEffect(() => { window.scrollTo(0, 0); AOS.refresh() }, [pathname])
//   return null
// }

// function PublicLayout({ children }) {
//   return (
//     <>
//       <Navbar />
//       <main>{children}</main>
//       <Footer />
//       <ScrollTop />
//     </>
//   )
// }

// function DashboardRedirect() {
//   const user = JSON.parse(localStorage.getItem('kcc_user') || '{}')
//   if (!user?.role) return <Navigate to="/login" replace />
//   const map = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' }
//   return <Navigate to={map[user.role] || '/login'} replace />
// }

// // Helper: wrap with ProtectedRoute
// const PR = (role, el) => <ProtectedRoute role={role}>{el}</ProtectedRoute>

// export default function App() {
//   return (
//     <BrowserRouter>
//       <ScrollToTop />
//       <Routes>
//         {/* ── Public ── */}
//         <Route path="/"         element={<PublicLayout><Home /></PublicLayout>} />
//         <Route path="/about"    element={<PublicLayout><About /></PublicLayout>} />
//         <Route path="/courses"  element={<PublicLayout><Courses /></PublicLayout>} />
//         <Route path="/contact"  element={<PublicLayout><Contact /></PublicLayout>} />
//         <Route path="/login"    element={<Login />} />
//         <Route path="/register" element={<Register />} />

//         {/* ── Smart dashboard redirect ── */}
//         <Route path="/dashboard" element={<DashboardRedirect />} />

//         {/* ── Admin — ALL sub-paths render AdminDashboard (tabs handle routing internally) ── */}
//         <Route path="/admin/dashboard"    element={PR('admin', <AdminDashboard />)} />
//         <Route path="/admin/students"     element={PR('admin', <AdminDashboard />)} />
//         <Route path="/admin/teachers"     element={PR('admin', <AdminDashboard />)} />
//         <Route path="/admin/batches"      element={PR('admin', <AdminDashboard />)} />
//         <Route path="/admin/fees"         element={PR('admin', <AdminDashboard />)} />
//         <Route path="/admin/announcements"element={PR('admin', <AdminDashboard />)} />

//         {/* ── Teacher — all sub-paths render TeacherDashboard ── */}
//         <Route path="/teacher/dashboard"  element={PR('teacher', <TeacherDashboard />)} />
//         <Route path="/teacher/homework"   element={PR('teacher', <TeacherDashboard />)} />
//         <Route path="/teacher/attendance" element={PR('teacher', <TeacherDashboard />)} />
//         <Route path="/teacher/tests"      element={PR('teacher', <TeacherDashboard />)} />
//         <Route path="/teacher/students"   element={PR('teacher', <TeacherDashboard />)} />

//         {/* ── Student — all sub-paths render StudentDashboard ── */}
//         <Route path="/student/dashboard"  element={PR('student', <StudentDashboard />)} />
//         <Route path="/student/homework"   element={PR('student', <StudentDashboard />)} />
//         <Route path="/student/attendance" element={PR('student', <StudentDashboard />)} />
//         <Route path="/student/results"    element={PR('student', <StudentDashboard />)} />
//         <Route path="/student/fees"       element={PR('student', <StudentDashboard />)} />

//         {/* ── 404 ── */}
//         <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
//       </Routes>

//       <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
//     </BrowserRouter>
//   )
// }
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AOS from 'aos'

// Common
import Navbar from './components/common/Navbar.jsx'
import Footer from './components/common/Footer.jsx'
import ScrollTop from './components/common/ScrollTop.jsx'
import ProtectedRoute from './components/dashboard/ProtectedRoute.jsx'

// Public pages
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Courses from './pages/Courses.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx'
import TeacherDashboard from './pages/dashboard/TeacherDashboard.jsx'
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    AOS.refresh()
  }, [pathname])
  return null
}

// Public layout
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ScrollTop />
    </>
  )
}

// Dashboard redirect based on role
function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('kcc_user') || '{}')

  if (!user?.role) return <Navigate to="/login" replace />

  const map = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard'
  }

  return <Navigate to={map[user.role] || '/login'} replace />
}

// Helper for protected routes
const PR = (role, el) => (
  <ProtectedRoute role={role}>
    {el}
  </ProtectedRoute>
)

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>

        {/* ── Public ── */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Health Route (redirects to homepage) */}
        <Route path="/health" element={<Navigate to="/" replace />} />

        {/* ── Smart dashboard redirect ── */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* ── Admin Routes ── */}
        <Route path="/admin/dashboard" element={PR('admin', <AdminDashboard />)} />
        <Route path="/admin/students" element={PR('admin', <AdminDashboard />)} />
        <Route path="/admin/teachers" element={PR('admin', <AdminDashboard />)} />
        <Route path="/admin/batches" element={PR('admin', <AdminDashboard />)} />
        <Route path="/admin/fees" element={PR('admin', <AdminDashboard />)} />
        <Route path="/admin/announcements" element={PR('admin', <AdminDashboard />)} />

        {/* ── Teacher Routes ── */}
        <Route path="/teacher/dashboard" element={PR('teacher', <TeacherDashboard />)} />
        <Route path="/teacher/homework" element={PR('teacher', <TeacherDashboard />)} />
        <Route path="/teacher/attendance" element={PR('teacher', <TeacherDashboard />)} />
        <Route path="/teacher/tests" element={PR('teacher', <TeacherDashboard />)} />
        <Route path="/teacher/students" element={PR('teacher', <TeacherDashboard />)} />

        {/* ── Student Routes ── */}
        <Route path="/student/dashboard" element={PR('student', <StudentDashboard />)} />
        <Route path="/student/homework" element={PR('student', <StudentDashboard />)} />
        <Route path="/student/attendance" element={PR('student', <StudentDashboard />)} />
        <Route path="/student/results" element={PR('student', <StudentDashboard />)} />
        <Route path="/student/fees" element={PR('student', <StudentDashboard />)} />

        {/* ── 404 ── */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />

      </Routes>

      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
    </BrowserRouter>
  )
}