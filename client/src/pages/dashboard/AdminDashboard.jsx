import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import DashLayout from '../../components/dashboard/DashLayout.jsx'

const API = (path, method = 'GET', body = null) => {
  const token = localStorage.getItem('kcc_token')
  return axios({ url: `/api${path}`, method, data: body, headers: { Authorization: `Bearer ${token}` } })
}

const COURSES = ['JEE & Engineering','NEET Preparation','Board Exam (10th)','Board Exam (12th)','Science & Maths (9th)','BE / B.Tech','MTech / PG']
const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const STATUS_COLORS = { paid:'green', pending:'orange', overdue:'red', partial:'blue' }

// ─────────────────────────────────────────────────────────────────────────────
// ADD / EDIT USER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function UserModal({ onClose, onSaved, editUser }) {
  const editing = !!editUser
  const [role, setRole]   = useState(editUser?.role || 'student')
  const [form, setForm]   = useState({
    name: editUser?.name || '', email: editUser?.email || '',
    phone: editUser?.phone || '', course: editUser?.course || '',
    subject: editUser?.subject || '', isActive: editUser?.isActive ?? true
  })
  const [loading, setLoading] = useState(false)
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required')
    setLoading(true)
    try {
      if (editing) {
        await API(`/admin/users/${editUser._id}`, 'PUT', { ...form, role })
        toast.success('User updated!')
      } else {
        await API('/admin/users', 'POST', { ...form, role, password: 'Tuition@123' })
        toast.success('Account created! Default password: Tuition@123')
      }
      onSaved()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr">
          <h4><i className={`fas fa-${editing?'user-edit':'user-plus'}`} style={{marginRight:8}} />{editing ? 'Edit User' : 'Add New User'}</h4>
          <button onClick={onClose}>×</button>
        </div>
        <div className="kcc-modal-body">
          {!editing && (
            <div className="df-group">
              <label className="df-label">Role</label>
              <div style={{display:'flex',gap:8}}>
                {['student','teacher'].map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{flex:1,padding:'9px',borderRadius:8,border:`2px solid ${role===r?'#6C63FF':'#E2E8F0'}`,background:role===r?'#EEF2FF':'#fff',color:role===r?'#6C63FF':'#64748B',fontWeight:600,cursor:'pointer',fontSize:13}}>
                    <i className={`fas fa-${r==='student'?'user-graduate':'chalkboard-teacher'}`} style={{marginRight:6}}/>{r.charAt(0).toUpperCase()+r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="df-row">
            <div className="df-group"><label className="df-label">Full Name *</label><input name="name" value={form.name} onChange={ch} className="df-input" placeholder="Full name" /></div>
            <div className="df-group"><label className="df-label">Email *</label><input name="email" type="email" value={form.email} onChange={ch} className="df-input" placeholder="Email address" /></div>
          </div>
          <div className="df-row">
            <div className="df-group"><label className="df-label">Phone</label><input name="phone" value={form.phone} onChange={ch} className="df-input" placeholder="+91 XXXXX XXXXX" /></div>
            {role === 'student' ? (
              <div className="df-group"><label className="df-label">Course</label>
                <select name="course" value={form.course} onChange={ch} className="df-input">
                  <option value="">-- Select --</option>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            ) : (
              <div className="df-group"><label className="df-label">Subject Taught</label><input name="subject" value={form.subject} onChange={ch} className="df-input" placeholder="e.g. Physics, Maths" /></div>
            )}
          </div>
          {editing && (
            <div className="df-group">
              <label className="df-label">Status</label>
              <select name="isActive" value={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.value === 'true'}))} className="df-input">
                <option value="true">Active</option>
                <option value="false">Deactivated</option>
              </select>
            </div>
          )}
          {!editing && (
            <div style={{background:'#F0FDF4',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#16A34A'}}>
              <i className="fas fa-info-circle" style={{marginRight:6}}/>Default password: <strong>Tuition@123</strong>
            </div>
          )}
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={save} disabled={loading}>{loading ? 'Saving...' : <><i className="fas fa-check" /> {editing ? 'Update' : 'Create Account'}</>}</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD FEE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AddFeeModal({ students, onClose, onSaved }) {
  const [form, setForm] = useState({ student:'', month:'', amount:'', dueDate:'' })
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const save = async () => {
    if (!form.student || !form.month || !form.amount) return toast.error('Fill all required fields')
    try {
      await API('/admin/fees', 'POST', { ...form, month: form.month + ' ' + new Date().getFullYear() })
      toast.success('Fee record created!')
      onSaved()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }
  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr"><h4><i className="fas fa-rupee-sign" style={{marginRight:8}}/>Add Fee Record</h4><button onClick={onClose}>×</button></div>
        <div className="kcc-modal-body">
          <div className="df-group"><label className="df-label">Student *</label>
            <select name="student" value={form.student} onChange={ch} className="df-input">
              <option value="">-- Select Student --</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
            </select>
          </div>
          <div className="df-row">
            <div className="df-group"><label className="df-label">Month *</label>
              <select name="month" value={form.month} onChange={ch} className="df-input">
                <option value="">-- Select Month --</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="df-group"><label className="df-label">Amount (₹) *</label><input name="amount" type="number" value={form.amount} onChange={ch} className="df-input" placeholder="e.g. 2000" /></div>
          </div>
          <div className="df-group"><label className="df-label">Due Date</label><input name="dueDate" type="date" value={form.dueDate} onChange={ch} className="df-input" /></div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={save}><i className="fas fa-check" /> Add Record</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLECT FEE MODAL (replaces ugly prompt())
// ─────────────────────────────────────────────────────────────────────────────
function CollectFeeModal({ fee, onClose, onSaved }) {
  const [amount, setAmount] = useState(fee.amount - (fee.paidAmount||0))
  const [method, setMethod] = useState('cash')
  const save = async () => {
    if (!amount || amount <= 0) return toast.error('Enter a valid amount')
    try {
      const r = await API(`/admin/fees/${fee._id}/collect`, 'PUT', { paidAmount: Number(amount), method })
      toast.success(`Payment recorded! Receipt: ${r.data.receiptNo}`)
      onSaved()
    } catch (e) { toast.error('Failed to record payment') }
  }
  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr"><h4><i className="fas fa-hand-holding-usd" style={{marginRight:8}}/>Collect Fee</h4><button onClick={onClose}>×</button></div>
        <div className="kcc-modal-body">
          <div style={{background:'#F8FAFC',borderRadius:12,padding:'14px 16px',marginBottom:4}}>
            <div style={{fontWeight:700,fontSize:14}}>{fee.student?.name}</div>
            <div style={{fontSize:13,color:'#64748B'}}>{fee.month} — Total: ₹{fee.amount?.toLocaleString('en-IN')}</div>
            {fee.paidAmount > 0 && <div style={{fontSize:12,color:'#22C55E'}}>Already paid: ₹{fee.paidAmount?.toLocaleString('en-IN')}</div>}
          </div>
          <div className="df-group"><label className="df-label">Amount Received (₹) *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="df-input" placeholder="Enter amount" />
          </div>
          <div className="df-group"><label className="df-label">Payment Method</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['cash','upi','bank','cheque'].map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{padding:'8px 16px',borderRadius:8,border:`2px solid ${method===m?'#22C55E':'#E2E8F0'}`,background:method===m?'#F0FDF4':'#fff',color:method===m?'#16A34A':'#64748B',fontWeight:600,cursor:'pointer',fontSize:13,textTransform:'capitalize'}}>
                  <i className={`fas fa-${m==='cash'?'money-bill-wave':m==='upi'?'mobile-alt':m==='bank'?'university':'file-invoice'}`} style={{marginRight:5}}/>{m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" style={{background:'#22C55E'}} onClick={save}><i className="fas fa-check-circle" /> Confirm Payment</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AnnModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', message:'', audience:'all' })
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const save = async () => {
    if (!form.title || !form.message) return toast.error('Fill all fields')
    try { await API('/admin/announcements','POST', form); toast.success('Announcement posted!'); onSaved() }
    catch (e) { toast.error('Failed') }
  }
  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr"><h4><i className="fas fa-bullhorn" style={{marginRight:8}}/>Post Announcement</h4><button onClick={onClose}>×</button></div>
        <div className="kcc-modal-body">
          <div className="df-group"><label className="df-label">Title *</label><input name="title" value={form.title} onChange={ch} className="df-input" placeholder="e.g. Holiday Notice" /></div>
          <div className="df-group"><label className="df-label">Audience</label>
            <select name="audience" value={form.audience} onChange={ch} className="df-input">
              <option value="all">Everyone (Students + Teachers)</option>
              <option value="students">Students Only</option>
              <option value="teachers">Teachers Only</option>
            </select>
          </div>
          <div className="df-group"><label className="df-label">Message *</label><textarea name="message" value={form.message} onChange={ch} className="df-input" rows="4" placeholder="Your announcement message..." /></div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={save}><i className="fas fa-paper-plane" /> Post</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,    setStats]    = useState({ students:0, teachers:0, feeCollected:0, feePending:0 })
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [fees,     setFees]     = useState([])
  const [anns,     setAnns]     = useState([])
  const [hwList,   setHwList]   = useState([])
  const [teacherAtt, setTeacherAtt] = useState([])
  const [tab,      setTab]      = useState('overview')
  const [modal,    setModal]    = useState(null)   // 'addUser'|'addFee'|'collectFee'|'ann'|'editUser'
  const [selected, setSelected] = useState(null)   // selected fee / user for modals
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [statsR, stuR, tchR, feeR, annR, hwR, tattR] = await Promise.all([
        API('/admin/dashboard').catch(() => ({data:{data:{students:0,teachers:0,feeCollected:0,feePending:0}}})),
        API('/admin/users?role=student').catch(() => ({data:{data:[]}})),
        API('/admin/users?role=teacher').catch(() => ({data:{data:[]}})),
        API('/admin/fees').catch(() => ({data:{data:[]}})),
        API('/admin/announcements').catch(() => ({data:{data:[]}})),
        API('/admin/homework').catch(() => ({data:{data:[]}})),
        API('/admin/teacher-attendance').catch(() => ({data:{data:[]}})),
      ])
      setStats(statsR.data.data || {})
      setStudents(stuR.data.data || [])
      setTeachers(tchR.data.data || [])
      setFees(feeR.data.data || [])
      setAnns(annR.data.data || [])
      setHwList(hwR.data.data || [])
      setTeacherAtt(tattR.data.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try { await API(`/admin/users/${id}`, 'DELETE'); toast.success('User deleted'); load() }
    catch (e) { toast.error('Failed to delete') }
  }

  const deleteAnn = async (id) => {
    try { await API(`/admin/announcements/${id}`, 'DELETE'); toast.success('Deleted'); load() }
    catch (e) { toast.error('Failed') }
  }

  const filteredStudents = students.filter(s =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredTeachers = teachers.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase())
  )

  const TABS = [
    { key:'overview',     icon:'fas fa-tachometer-alt', label:'Overview'   },
    { key:'students',     icon:'fas fa-user-graduate',  label:'Students'   },
    { key:'teachers',     icon:'fas fa-chalkboard-teacher', label:'Teachers'},
    { key:'fees',         icon:'fas fa-rupee-sign',     label:'Fees'       },
    { key:'homework',     icon:'fas fa-book-open',      label:'Homework'   },
    { key:'teacher-att',  icon:'fas fa-clipboard-list', label:'Teacher Att.'},
    { key:'announcements',icon:'fas fa-bullhorn',       label:'Notices'    },
  ]

  return (
    <DashLayout title="Admin Dashboard">
      {/* ── Tab Navigation ── */}
      <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap',background:'#fff',padding:'10px 14px',borderRadius:14,border:'1px solid #E2E8F0'}}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch('') }}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'1.5px solid',borderColor:tab===t.key?'#6C63FF':'transparent',background:tab===t.key?'#EEF2FF':'transparent',color:tab===t.key?'#6C63FF':'#64748B',fontWeight:600,fontSize:12.5,cursor:'pointer',transition:'all .15s'}}>
            <i className={t.icon} style={{fontSize:11}}/>{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <>
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-box"><div className="stat-icon si-purple"><i className="fas fa-user-graduate"/></div><div><div className="stat-box-val">{stats.students}</div><div className="stat-box-lbl">Total Students</div></div></div>
            <div className="stat-box"><div className="stat-icon si-blue"><i className="fas fa-chalkboard-teacher"/></div><div><div className="stat-box-val">{stats.teachers}</div><div className="stat-box-lbl">Teachers</div></div></div>
            <div className="stat-box"><div className="stat-icon si-green"><i className="fas fa-rupee-sign"/></div><div><div className="stat-box-val">₹{((stats.feeCollected||0)/1000).toFixed(1)}k</div><div className="stat-box-lbl">Fee Collected</div></div></div>
            <div className="stat-box"><div className="stat-icon si-red"><i className="fas fa-exclamation-circle"/></div><div><div className="stat-box-val">{stats.feePending}</div><div className="stat-box-lbl">Fee Pending</div></div></div>
          </div>

          {/* Quick Actions */}
          <div className="dash-card" style={{marginBottom:24}}>
            <div className="dash-card-hdr"><h3><i className="fas fa-bolt" style={{color:'#F59E0B',marginRight:8}}/>Quick Actions</h3></div>
            <div className="dash-card-body">
              <div className="qa-grid">
                <button className="qa-btn qa-primary" onClick={() => setModal('addUser')}><i className="fas fa-user-plus"/>Add Student</button>
                <button className="qa-btn" style={{background:'#8B5CF6',color:'#fff'}} onClick={() => { setModal('addUser') }}><i className="fas fa-chalkboard-teacher"/>Add Teacher</button>
                <button className="qa-btn qa-success" onClick={() => setModal('addFee')}><i className="fas fa-rupee-sign"/>Add Fee Record</button>
                <button className="qa-btn qa-warning" onClick={() => setModal('ann')}><i className="fas fa-bullhorn"/>Post Announcement</button>
              </div>
            </div>
          </div>

          {/* Overview cards */}
          <div className="dash-row">
            <div className="dash-card">
              <div className="dash-card-hdr"><h3><i className="fas fa-user-graduate" style={{color:'#6C63FF',marginRight:8}}/>Recent Students</h3>
                <button className="qa-btn qa-primary" style={{padding:'6px 12px',fontSize:11}} onClick={() => setTab('students')}>View All</button>
              </div>
              <div style={{overflowX:'auto'}}>
                <table className="dash-table">
                  <thead><tr><th>Name</th><th>Course</th><th>Fee</th></tr></thead>
                  <tbody>
                    {students.slice(0,5).map((s,i) => (
                      <tr key={i}>
                        <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:30,height:30,borderRadius:'50%',background:'#EEF2FF',color:'#6C63FF',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>{s.name?.charAt(0)}</div>
                          <div><div style={{fontWeight:600,fontSize:13}}>{s.name}</div><div style={{fontSize:11,color:'#94A3B8'}}>{s.email}</div></div>
                        </div></td>
                        <td style={{fontSize:12}}>{s.course||'—'}</td>
                        <td><span className={`pill pill-${STATUS_COLORS[s.feeStatus]||'orange'}`}>{s.feeStatus||'pending'}</span></td>
                      </tr>
                    ))}
                    {students.length === 0 && <tr><td colSpan="3"><div className="empty-state" style={{padding:'20px'}}><i className="fas fa-users"/><p>No students yet</p></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-hdr"><h3><i className="fas fa-rupee-sign" style={{color:'#22C55E',marginRight:8}}/>Pending Fees</h3>
                <button className="qa-btn qa-success" style={{padding:'6px 12px',fontSize:11}} onClick={() => setTab('fees')}>View All</button>
              </div>
              <div style={{overflowX:'auto'}}>
                <table className="dash-table">
                  <thead><tr><th>Student</th><th>Month</th><th>Amount</th><th>Action</th></tr></thead>
                  <tbody>
                    {fees.filter(f => f.status !== 'paid').slice(0,5).map((f,i) => (
                      <tr key={i}>
                        <td style={{fontWeight:600,fontSize:13}}>{f.student?.name||'—'}</td>
                        <td style={{fontSize:12}}>{f.month}</td>
                        <td style={{fontWeight:700}}>₹{f.amount?.toLocaleString('en-IN')}</td>
                        <td><button className="qa-btn qa-success" style={{padding:'5px 10px',fontSize:11}} onClick={() => { setSelected(f); setModal('collectFee') }}>Collect</button></td>
                      </tr>
                    ))}
                    {fees.filter(f => f.status !== 'paid').length === 0 && <tr><td colSpan="4"><div className="empty-state" style={{padding:'20px'}}><i className="fas fa-check-circle" style={{color:'#22C55E'}}/><p>All fees cleared!</p></div></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Announcements overview */}
          <div className="dash-card">
            <div className="dash-card-hdr"><h3><i className="fas fa-bullhorn" style={{color:'#F59E0B',marginRight:8}}/>Recent Announcements</h3>
              <button className="qa-btn qa-warning" style={{padding:'6px 12px',fontSize:11}} onClick={() => setModal('ann')}><i className="fas fa-plus"/>Post New</button>
            </div>
            <div className="dash-card-body">
              {anns.length === 0 ? <div className="empty-state"><i className="fas fa-bullhorn"/><p>No announcements yet</p></div>
              : anns.slice(0,3).map((a,i) => (
                <div key={i} className="ann-item">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div className="ann-title">{a.title}</div>
                      <div className="ann-msg">{a.message?.substring(0,120)}{a.message?.length > 120 ? '…':''}</div>
                      <div className="ann-date"><i className="fas fa-users" style={{marginRight:4}}/>{a.audience} · <i className="fas fa-clock" style={{marginRight:4}}/>{new Date(a.createdAt).toDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          STUDENTS TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'students' && (
        <div className="dash-card">
          <div className="dash-card-hdr" style={{flexWrap:'wrap',gap:10}}>
            <h3><i className="fas fa-user-graduate" style={{color:'#6C63FF',marginRight:8}}/> Students ({filteredStudents.length})</h3>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / email..." className="df-input" style={{padding:'7px 12px',fontSize:13,width:220}} />
              <button className="qa-btn qa-primary" onClick={() => setModal('addUser')}><i className="fas fa-plus"/>Add Student</button>
            </div>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="dash-table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Course</th><th>Status</th><th>Fee</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredStudents.map((s,i) => (
                  <tr key={s._id}>
                    <td style={{color:'#94A3B8'}}>{i+1}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'#EEF2FF',color:'#6C63FF',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0}}>{s.name?.charAt(0)}</div>
                      <div><div style={{fontWeight:600,fontSize:13}}>{s.name}</div><div style={{fontSize:11,color:'#94A3B8'}}>{s.phone||''}</div></div>
                    </div></td>
                    <td style={{fontSize:13}}>{s.email}</td>
                    <td style={{fontSize:13}}>{s.phone||'—'}</td>
                    <td style={{fontSize:12}}>{s.course||'—'}</td>
                    <td><span className={`pill ${s.isActive!==false?'pill-green':'pill-red'}`}>{s.isActive!==false?'Active':'Inactive'}</span></td>
                    <td><span className={`pill pill-${STATUS_COLORS[s.feeStatus]||'orange'}`}>{s.feeStatus||'pending'}</span></td>
                    <td style={{fontSize:12,color:'#94A3B8'}}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={() => { setSelected(s); setModal('editUser') }} title="Edit" style={{background:'#EEF2FF',border:'none',color:'#6C63FF',cursor:'pointer',fontSize:13,padding:'5px 9px',borderRadius:7}}><i className="fas fa-edit"/></button>
                        <button onClick={() => deleteUser(s._id)} title="Delete" style={{background:'#FEF2F2',border:'none',color:'#EF4444',cursor:'pointer',fontSize:13,padding:'5px 9px',borderRadius:7}}><i className="fas fa-trash"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && <tr><td colSpan="9"><div className="empty-state" style={{padding:'30px'}}><i className="fas fa-users"/><p>{search ? 'No students match search' : 'No students yet. Add your first student!'}</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TEACHERS TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'teachers' && (
        <div className="dash-card">
          <div className="dash-card-hdr" style={{flexWrap:'wrap',gap:10}}>
            <h3><i className="fas fa-chalkboard-teacher" style={{color:'#8B5CF6',marginRight:8}}/>Teachers ({filteredTeachers.length})</h3>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / email..." className="df-input" style={{padding:'7px 12px',fontSize:13,width:220}} />
              <button className="qa-btn" style={{background:'#8B5CF6',color:'#fff'}} onClick={() => setModal('addUser')}><i className="fas fa-plus"/>Add Teacher</button>
            </div>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="dash-table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredTeachers.map((t,i) => (
                  <tr key={t._id}>
                    <td style={{color:'#94A3B8'}}>{i+1}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'#F3E8FF',color:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0}}>{t.name?.charAt(0)}</div>
                      <div><div style={{fontWeight:600,fontSize:13}}>{t.name}</div></div>
                    </div></td>
                    <td style={{fontSize:13}}>{t.email}</td>
                    <td style={{fontSize:13}}>{t.phone||'—'}</td>
                    <td style={{fontSize:13}}>{t.subject||'—'}</td>
                    <td><span className={`pill ${t.isActive!==false?'pill-green':'pill-red'}`}>{t.isActive!==false?'Active':'Inactive'}</span></td>
                    <td style={{fontSize:12,color:'#94A3B8'}}>{t.lastLogin ? new Date(t.lastLogin).toLocaleDateString('en-IN') : 'Never'}</td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={() => { setSelected(t); setModal('editUser') }} title="Edit" style={{background:'#F3E8FF',border:'none',color:'#8B5CF6',cursor:'pointer',fontSize:13,padding:'5px 9px',borderRadius:7}}><i className="fas fa-edit"/></button>
                        <button onClick={() => deleteUser(t._id)} title="Delete" style={{background:'#FEF2F2',border:'none',color:'#EF4444',cursor:'pointer',fontSize:13,padding:'5px 9px',borderRadius:7}}><i className="fas fa-trash"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && <tr><td colSpan="8"><div className="empty-state" style={{padding:'30px'}}><i className="fas fa-chalkboard-teacher"/><p>{search ? 'No teachers match search' : 'No teachers yet.'}</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          FEES TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'fees' && (
        <div className="dash-card">
          <div className="dash-card-hdr" style={{flexWrap:'wrap',gap:10}}>
            <h3><i className="fas fa-rupee-sign" style={{color:'#22C55E',marginRight:8}}/>Fee Management ({fees.length})</h3>
            <button className="qa-btn qa-success" onClick={() => setModal('addFee')}><i className="fas fa-plus"/>Add Fee Record</button>
          </div>
          {/* Summary bar */}
          <div style={{padding:'14px 22px',background:'#F8FAFC',borderBottom:'1px solid #E2E8F0',display:'flex',gap:24,flexWrap:'wrap'}}>
            {[
              { label:'Total Billed', val:'₹'+fees.reduce((a,f)=>a+(f.amount||0),0).toLocaleString('en-IN'), color:'#334155' },
              { label:'Collected',    val:'₹'+fees.reduce((a,f)=>a+(f.paidAmount||0),0).toLocaleString('en-IN'), color:'#22C55E' },
              { label:'Pending',      val:fees.filter(f=>f.status!=='paid').length+' records', color:'#F59E0B' },
              { label:'Paid',         val:fees.filter(f=>f.status==='paid').length+' records', color:'#6C63FF' },
            ].map((s,i) => (
              <div key={i}><div style={{fontSize:12,color:'#94A3B8'}}>{s.label}</div><div style={{fontSize:18,fontWeight:800,color:s.color}}>{s.val}</div></div>
            ))}
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="dash-table">
              <thead><tr><th>#</th><th>Student</th><th>Month</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Method</th><th>Receipt</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {fees.map((f,i) => (
                  <tr key={f._id}>
                    <td style={{color:'#94A3B8'}}>{i+1}</td>
                    <td style={{fontWeight:600,fontSize:13}}>{f.student?.name||'—'}<div style={{fontSize:11,color:'#94A3B8'}}>{f.student?.phone||''}</div></td>
                    <td style={{fontSize:13}}>{f.month}</td>
                    <td style={{fontWeight:700}}>₹{f.amount?.toLocaleString('en-IN')}</td>
                    <td style={{color:'#22C55E',fontWeight:600}}>₹{(f.paidAmount||0).toLocaleString('en-IN')}</td>
                    <td style={{color: (f.amount-(f.paidAmount||0)) > 0 ? '#EF4444':'#22C55E', fontWeight:600}}>₹{(f.amount-(f.paidAmount||0)).toLocaleString('en-IN')}</td>
                    <td style={{fontSize:12,color:'#94A3B8'}}>{f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{fontSize:12}}>{f.method||'—'}</td>
                    <td style={{fontSize:11,color:'#94A3B8',fontFamily:'monospace'}}>{f.receiptNo||'—'}</td>
                    <td><span className={`pill pill-${STATUS_COLORS[f.status]||'orange'}`}>{f.status}</span></td>
                    <td>{f.status !== 'paid' && <button className="qa-btn qa-success" style={{padding:'5px 12px',fontSize:11}} onClick={() => { setSelected(f); setModal('collectFee') }}>Collect</button>}</td>
                  </tr>
                ))}
                {fees.length === 0 && <tr><td colSpan="11"><div className="empty-state" style={{padding:'30px'}}><i className="fas fa-rupee-sign"/><p>No fee records yet</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          HOMEWORK TAB (Admin read-only view of all HW)
      ════════════════════════════════════════════════════════════ */}
      {tab === 'homework' && (
        <div className="dash-card">
          <div className="dash-card-hdr">
            <h3><i className="fas fa-book-open" style={{color:'#3B82F6',marginRight:8}}/>All Homework ({hwList.length})</h3>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="dash-table">
              <thead><tr><th>#</th><th>Title</th><th>Subject</th><th>Assigned By</th><th>Due Date</th><th>Priority</th><th>Submissions</th></tr></thead>
              <tbody>
                {hwList.map((h,i) => (
                  <tr key={h._id}>
                    <td style={{color:'#94A3B8'}}>{i+1}</td>
                    <td><div style={{fontWeight:600,fontSize:13}}>{h.title}</div><div style={{fontSize:11,color:'#94A3B8',marginTop:2}}>{h.description?.substring(0,60)}{h.description?.length>60?'…':''}</div></td>
                    <td style={{fontSize:13}}>{h.subject}</td>
                    <td style={{fontSize:13}}>{h.assignedByName||h.assignedBy?.name||'—'}</td>
                    <td style={{fontSize:12}}>{new Date(h.dueDate).toLocaleDateString('en-IN')}</td>
                    <td><span className={`pill pill-${h.priority==='high'?'red':h.priority==='medium'?'orange':'green'}`}>{h.priority}</span></td>
                    <td><span className="pill pill-blue">{h.submissions?.length||0} submitted</span></td>
                  </tr>
                ))}
                {hwList.length === 0 && <tr><td colSpan="7"><div className="empty-state" style={{padding:'30px'}}><i className="fas fa-book"/><p>No homework assigned yet</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          TEACHER ATTENDANCE TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'teacher-att' && (
        <>
          {/* Summary per teacher */}
          <div className="dash-row" style={{marginBottom:20}}>
            {teachers.map(t => {
              const tAtt = teacherAtt.filter(a => a.markedBy?._id === t._id || a.markedBy === t._id)
              return (
                <div key={t._id} className="stat-box" style={{flexDirection:'column',alignItems:'flex-start',gap:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,width:'100%'}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:'#F3E8FF',color:'#8B5CF6',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,flexShrink:0}}>{t.name?.charAt(0)}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:14}}>{t.name}</div>
                      <div style={{fontSize:12,color:'#64748B'}}>{t.subject||'Teacher'}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:12,width:'100%',marginTop:4}}>
                    <div style={{flex:1,background:'#F0FDF4',borderRadius:8,padding:'8px 12px',textAlign:'center'}}>
                      <div style={{fontSize:20,fontWeight:800,color:'#16A34A'}}>{tAtt.length}</div>
                      <div style={{fontSize:11,color:'#64748B'}}>Days Marked</div>
                    </div>
                    <div style={{flex:1,background:'#EFF6FF',borderRadius:8,padding:'8px 12px',textAlign:'center'}}>
                      <div style={{fontSize:20,fontWeight:800,color:'#2563EB'}}>{tAtt.reduce((a,r)=>a+(r.records?.length||0),0)}</div>
                      <div style={{fontSize:11,color:'#64748B'}}>Total Records</div>
                    </div>
                  </div>
                </div>
              )
            })}
            {teachers.length === 0 && <div style={{gridColumn:'1/-1'}}><div className="empty-state"><i className="fas fa-chalkboard-teacher"/><p>No teachers found</p></div></div>}
          </div>

          <div className="dash-card">
            <div className="dash-card-hdr"><h3><i className="fas fa-clipboard-list" style={{color:'#8B5CF6',marginRight:8}}/>Teacher Attendance Records</h3></div>
            <div style={{overflowX:'auto'}}>
              <table className="dash-table">
                <thead><tr><th>#</th><th>Teacher</th><th>Date</th><th>Students Present</th><th>Students Absent</th><th>Late</th><th>Total</th></tr></thead>
                <tbody>
                  {teacherAtt.map((a,i) => {
                    const present = a.records?.filter(r=>r.status==='present').length||0
                    const absent  = a.records?.filter(r=>r.status==='absent').length||0
                    const late    = a.records?.filter(r=>r.status==='late').length||0
                    return (
                      <tr key={a._id}>
                        <td style={{color:'#94A3B8'}}>{i+1}</td>
                        <td style={{fontWeight:600,fontSize:13}}>{a.markedBy?.name||'—'}</td>
                        <td style={{fontWeight:600}}>{new Date(a.date).toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</td>
                        <td><span className="pill pill-green">{present} present</span></td>
                        <td><span className="pill pill-red">{absent} absent</span></td>
                        <td><span className="pill pill-orange">{late} late</span></td>
                        <td style={{fontWeight:700}}>{a.records?.length||0}</td>
                      </tr>
                    )
                  })}
                  {teacherAtt.length === 0 && <tr><td colSpan="7"><div className="empty-state" style={{padding:'30px'}}><i className="fas fa-clipboard-list"/><p>No attendance records yet. Teachers mark attendance from their dashboard.</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          ANNOUNCEMENTS TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'announcements' && (
        <div className="dash-card">
          <div className="dash-card-hdr">
            <h3><i className="fas fa-bullhorn" style={{color:'#F59E0B',marginRight:8}}/>Announcements</h3>
            <button className="qa-btn qa-warning" onClick={() => setModal('ann')}><i className="fas fa-plus"/>Post New</button>
          </div>
          <div className="dash-card-body">
            {anns.length === 0 ? <div className="empty-state"><i className="fas fa-bullhorn"/><p>No announcements yet</p></div>
            : anns.map((a,i) => (
              <div key={i} className="ann-item" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
                    <div className="ann-title">{a.title}</div>
                    <span className={`pill pill-${a.audience==='all'?'purple':a.audience==='students'?'blue':'green'}`}>{a.audience}</span>
                  </div>
                  <div className="ann-msg">{a.message}</div>
                  <div className="ann-date"><i className="fas fa-clock" style={{marginRight:4}}/>{new Date(a.createdAt).toDateString()}</div>
                </div>
                <button onClick={() => deleteAnn(a._id)} style={{background:'none',border:'none',color:'#EF4444',cursor:'pointer',fontSize:14,padding:'4px 8px',borderRadius:6,flexShrink:0}}><i className="fas fa-trash"/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modal === 'addUser'    && <UserModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {modal === 'editUser'   && <UserModal editUser={selected} onClose={() => { setModal(null); setSelected(null) }} onSaved={() => { setModal(null); setSelected(null); load() }} />}
      {modal === 'addFee'     && <AddFeeModal students={students} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {modal === 'collectFee' && <CollectFeeModal fee={selected} onClose={() => { setModal(null); setSelected(null) }} onSaved={() => { setModal(null); setSelected(null); load() }} />}
      {modal === 'ann'        && <AnnModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
    </DashLayout>
  )
}
