import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Auth.css'

const COURSES = ['JEE & Engineering','NEET Preparation','Board Exam (10th)','Board Exam (12th)','Science & Maths (9th)','BE / B.Tech','MTech / PG']

export default function Register() {
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'', course:'' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields.')
    if (form.password !== form.confirm) return toast.error('Passwords do not match.')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters.')
    setLoading(true)
    try {
      await axios.post('/api/auth/register', { ...form, confirm_password: form.confirm, role })
      toast.success('Account created! You can now login.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-orb orb1" /><div className="auth-orb orb2" /><div className="auth-grid" /></div>
      <div className="auth-container">
        <div className="auth-panel">
          <Link to="/" className="auth-logo"><div className="auth-logo-icon"><i className="fas fa-graduation-cap" /></div><span>KCC <em>Classes</em></span></Link>
          <h2>Join 500+ Students at KCC Classes</h2>
          <p>Create your account to get access to all course materials, homework, attendance tracking and more.</p>
          <div className="auth-features">
            {['Access study materials anytime','Get homework notifications','Track your performance','Direct messaging with teacher'].map((f,i) => <div key={i} className="auth-feat"><i className="fas fa-check-circle" />{f}</div>)}
          </div>
          <div className="auth-teacher">
            <div className="at-avatar">OB</div>
            <div><strong>Omendra Baghele</strong><span>Expert Guidance — M.Tech, 10+ Years Experience</span></div>
          </div>
        </div>
        <div className="auth-form-box">
          <h3>Create Account</h3>
          <p className="auth-sub">Fill in your details to get started</p>
          <div className="role-tabs" style={{marginBottom:'20px'}}>
            <button type="button" className={`role-tab${role==='student'?' active':''}`} onClick={()=>setRole('student')}><i className="fas fa-user-graduate"/>Student</button>
            <button type="button" className={`role-tab${role==='teacher'?' active':''}`} onClick={()=>setRole('teacher')}><i className="fas fa-chalkboard-teacher"/>Teacher</button>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-icon-wrap"><i className="fas fa-user" /><input name="name" value={form.name} onChange={handleChange} className="form-input with-icon" placeholder="Your full name" required /></div>
            </div>
            <div className="form-row2">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <div className="input-icon-wrap"><i className="fas fa-envelope" /><input name="email" type="email" value={form.email} onChange={handleChange} className="form-input with-icon" placeholder="Email address" required /></div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="input-icon-wrap"><i className="fas fa-phone" /><input name="phone" value={form.phone} onChange={handleChange} className="form-input with-icon" placeholder="+91 XXXXX XXXXX" /></div>
              </div>
            </div>
            {role === 'student' && (
              <div className="form-group">
                <label className="form-label">Select Course</label>
                <div className="input-icon-wrap"><i className="fas fa-book" /><select name="course" value={form.course} onChange={handleChange} className="form-input with-icon"><option value="">— Choose Course —</option>{COURSES.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
            )}
            <div className="form-row2">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-icon-wrap"><i className="fas fa-lock" /><input name="password" type={showPwd?'text':'password'} value={form.password} onChange={handleChange} className="form-input with-icon" placeholder="Min 8 chars" required /><button type="button" className="pwd-toggle" onClick={()=>setShowPwd(v=>!v)}><i className={`fas fa-eye${showPwd?'-slash':''}`} /></button></div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="input-icon-wrap"><i className="fas fa-lock" /><input name="confirm" type="password" value={form.confirm} onChange={handleChange} className="form-input with-icon" placeholder="Repeat password" required /></div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? <><span className="btn-spinner"/>Creating...</> : <>Create Account <i className="fas fa-arrow-right"/></>}
            </button>
          </form>
          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-outline btn-lg auth-btn">Login Instead</Link>
        </div>
      </div>
    </div>
  )
}
