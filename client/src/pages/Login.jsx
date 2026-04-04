import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Auth.css'

const ROLES = [
  { value: 'student', label: 'Student',  icon: 'fas fa-user-graduate' },
  { value: 'teacher', label: 'Teacher',  icon: 'fas fa-chalkboard-teacher' },
  { value: 'admin',   label: 'Admin',    icon: 'fas fa-user-shield' },
]

export default function Login() {
  const [role,     setRole]    = useState('student')
  const [form,     setForm]    = useState({ email: '', password: '' })
  const [showPwd,  setShowPwd] = useState(false)
  const [loading,  setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields.')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { ...form, role })
      localStorage.setItem('kcc_token', res.data.token)
      localStorage.setItem('kcc_user', JSON.stringify(res.data.data))
      toast.success('Login successful! Redirecting...')
      const map = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' }
      setTimeout(() => navigate(map[role] || '/'), 700)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb1" /><div className="auth-orb orb2" />
        <div className="auth-grid" />
      </div>
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-panel">
          <Link to="/" className="auth-logo"><div className="auth-logo-icon"><i className="fas fa-graduation-cap" /></div><span>KCC <em>Classes</em></span></Link>
          <h2>Welcome back to KCC Classes</h2>
          <p>Login to access your personalised dashboard, track homework, results and more.</p>
          <div className="auth-features">
            {['Track homework & assignments','View attendance & results','Fee payment history','Announcements from teachers'].map((f,i) => <div key={i} className="auth-feat"><i className="fas fa-check-circle" />{f}</div>)}
          </div>
          <div className="auth-teacher">
            <div className="at-avatar">OB</div>
            <div><strong>Omendra Baghele</strong><span>Founder & Lead Teacher — M.Tech, 10+ Years</span></div>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-form-box">
          <h3>Login to Portal</h3>
          <p className="auth-sub">Choose your role and enter your credentials</p>

          {/* Role Tabs */}
          <div className="role-tabs">
            {ROLES.map(r => (
              <button key={r.value} type="button" className={`role-tab${role === r.value ? ' active' : ''}`} onClick={() => setRole(r.value)}>
                <i className={r.icon} />{r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap"><i className="fas fa-envelope" /><input name="email" type="email" value={form.email} onChange={handleChange} className="form-input with-icon" placeholder="Enter your email" required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <i className="fas fa-lock" />
                <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handleChange} className="form-input with-icon" placeholder="Enter your password" required />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}><i className={`fas fa-eye${showPwd ? '-slash' : ''}`} /></button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Logging in...</> : <>Login <i className="fas fa-arrow-right" /></>}
            </button>
          </form>

          <div className="auth-divider"><span>New to KCC Classes?</span></div>
          <Link to="/register" className="btn btn-outline btn-lg auth-btn">Create Account</Link>
          <p className="auth-note">Default password for new accounts: <strong>Tuition@123</strong></p>
        </div>
      </div>
    </div>
  )
}
