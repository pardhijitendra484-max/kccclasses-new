import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import DashLayout from '../../components/dashboard/DashLayout.jsx'
import './Dashboard.css'

const API = (path, method = 'GET', body = null) => {
  const token = localStorage.getItem('kcc_token')
  return axios({ url: `/api${path}`, method, data: body, headers: { Authorization: `Bearer ${token}` } })
}

// ── Assign Homework Modal ────────────────────────────────────────────────────
function AssignHWModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', subject:'', description:'', dueDate:'', priority:'medium' })
  const [loading, setLoading] = useState(false)
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async () => {
    if (!form.title || !form.subject || !form.dueDate || !form.description)
      return toast.error('Fill all required fields')
    setLoading(true)
    try {
      await API('/teacher/homework', 'POST', form)
      toast.success('Homework assigned successfully!')
      onSaved()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr">
          <h4><i className="fas fa-book-open" style={{marginRight:8}}/>Assign Homework</h4>
          <button onClick={onClose}>×</button>
        </div>
        <div className="kcc-modal-body">
          <div className="df-row">
            <div className="df-group"><label className="df-label">Title *</label><input name="title" value={form.title} onChange={ch} className="df-input" placeholder="e.g. Chapter 3 Exercises" /></div>
            <div className="df-group"><label className="df-label">Subject *</label><input name="subject" value={form.subject} onChange={ch} className="df-input" placeholder="e.g. Physics" /></div>
          </div>
          <div className="df-row">
            <div className="df-group"><label className="df-label">Due Date *</label><input name="dueDate" type="date" value={form.dueDate} onChange={ch} className="df-input" /></div>
            <div className="df-group"><label className="df-label">Priority</label>
              <select name="priority" value={form.priority} onChange={ch} className="df-input">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div className="df-group"><label className="df-label">Description *</label><textarea name="description" value={form.description} onChange={ch} className="df-input" rows="4" placeholder="Describe the task clearly..." /></div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={save} disabled={loading}>
            {loading ? 'Assigning...' : <><i className="fas fa-paper-plane" style={{marginRight:6}}/>Assign & Notify</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Mark Attendance Modal ────────────────────────────────────────────────────
function AttendanceModal({ onClose, onSaved, students }) {
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState(() => students.map(s => ({ studentId: s._id, studentName: s.name, status: 'present' })))

  const toggle = (id, status) => setRecords(r => r.map(x => x.studentId === id ? { ...x, status } : x))

  const save = async () => {
    if (records.length === 0) return toast.error('No students to mark attendance for')
    try {
      await API('/teacher/attendance', 'POST', { date, records })
      const p = records.filter(r => r.status === 'present').length
      toast.success(`Attendance saved! ${p}/${records.length} present`)
      onSaved()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save attendance') }
  }

  const COLORS = { present: { bg:'#F0FDF4', border:'#22C55E', color:'#16A34A' }, absent: { bg:'#FEF2F2', border:'#EF4444', color:'#DC2626' }, late: { bg:'#FFF7ED', border:'#F59E0B', color:'#D97706' } }

  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" style={{maxWidth:600}} onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr">
          <h4><i className="fas fa-clipboard-check" style={{marginRight:8}}/>Mark Attendance</h4>
          <button onClick={onClose}>×</button>
        </div>
        <div className="kcc-modal-body">
          <div className="df-group"><label className="df-label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="df-input" /></div>

          {/* Summary counters */}
          <div style={{display:'flex',gap:10,padding:'10px 14px',background:'#F8FAFC',borderRadius:10}}>
            {[['present','#22C55E','Present'],['absent','#EF4444','Absent'],['late','#F59E0B','Late']].map(([s,c,l]) => (
              <div key={s} style={{flex:1,textAlign:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:c}}>{records.filter(r=>r.status===s).length}</div>
                <div style={{fontSize:11,color:'#64748B'}}>{l}</div>
              </div>
            ))}
          </div>

          {students.length === 0 && <p style={{color:'#94A3B8',fontSize:14,textAlign:'center'}}>No students found. Add students first from the admin panel.</p>}
          <div style={{maxHeight:320,overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>
            {records.map(r => (
              <div key={r.studentId} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#F8FAFC',borderRadius:10,border:`1.5px solid ${COLORS[r.status]?.border||'#E2E8F0'}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'#EEF2FF',color:'#6C63FF',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>{r.studentName?.charAt(0)}</div>
                  <span style={{fontWeight:600,fontSize:14}}>{r.studentName}</span>
                </div>
                <div style={{display:'flex',gap:6}}>
                  {['present','absent','late'].map(s => (
                    <button key={s} onClick={() => toggle(r.studentId, s)}
                      style={{padding:'6px 12px',borderRadius:8,border:`1.5px solid ${r.status===s?COLORS[s].border:'#E2E8F0'}`,background:r.status===s?COLORS[s].bg:'#fff',color:r.status===s?COLORS[s].color:'#64748B',fontWeight:600,fontSize:12,cursor:'pointer',transition:'all .15s'}}>
                      {s==='present'?'✅':s==='absent'?'❌':'⏰'} {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" style={{background:'#22C55E'}} onClick={save}><i className="fas fa-save" style={{marginRight:6}}/>Save Attendance</button>
        </div>
      </div>
    </div>
  )
}

// ── Create Test Modal ────────────────────────────────────────────────────────
function TestModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', subject:'', date:'', maxMarks:100, duration:'' })
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const save = async () => {
    if (!form.title || !form.subject || !form.date) return toast.error('Fill all required fields')
    try { await API('/teacher/tests', 'POST', form); toast.success('Test created!'); onSaved() }
    catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }
  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr"><h4><i className="fas fa-file-alt" style={{marginRight:8}}/>Create Test</h4><button onClick={onClose}>×</button></div>
        <div className="kcc-modal-body">
          <div className="df-group"><label className="df-label">Test Title *</label><input name="title" value={form.title} onChange={ch} className="df-input" placeholder="e.g. Unit Test 1 – Mechanics" /></div>
          <div className="df-row">
            <div className="df-group"><label className="df-label">Subject *</label><input name="subject" value={form.subject} onChange={ch} className="df-input" placeholder="Subject" /></div>
            <div className="df-group"><label className="df-label">Date *</label><input name="date" type="date" value={form.date} onChange={ch} className="df-input" /></div>
          </div>
          <div className="df-row">
            <div className="df-group"><label className="df-label">Max Marks</label><input name="maxMarks" type="number" value={form.maxMarks} onChange={ch} className="df-input" /></div>
            <div className="df-group"><label className="df-label">Duration</label><input name="duration" value={form.duration} onChange={ch} className="df-input" placeholder="e.g. 2 Hours" /></div>
          </div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={save}><i className="fas fa-check" style={{marginRight:6}}/>Create Test</button>
        </div>
      </div>
    </div>
  )
}

// ── Enter Test Results Modal ─────────────────────────────────────────────────
function EnterResultsModal({ test, students, onClose, onSaved }) {
  const [marks, setMarks] = useState(() => {
    const m = {}
    students.forEach(s => {
      const existing = test.results?.find(r => r.student === s._id || r.student?.toString() === s._id)
      m[s._id] = existing ? existing.marks : ''
    })
    return m
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const results = students.map(s => ({
      studentId: s._id,
      studentName: s.name,
      marks: Number(marks[s._id]) || 0
    })).filter(r => marks[r.studentId] !== '')

    if (results.length === 0) return toast.error('Enter marks for at least one student')
    setSaving(true)
    try {
      await API(`/teacher/tests/${test._id}/results`, 'POST', { results })
      toast.success('Results saved successfully!')
      onSaved()
    } catch (e) { toast.error('Failed to save results') }
    finally { setSaving(false) }
  }

  const pct = (m) => test.maxMarks ? Math.round((m / test.maxMarks) * 100) : 0
  const gradeColor = (p) => p >= 80 ? '#22C55E' : p >= 60 ? '#3B82F6' : p >= 35 ? '#F59E0B' : '#EF4444'

  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" style={{maxWidth:620}} onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr">
          <div>
            <h4 style={{margin:0}}><i className="fas fa-star" style={{marginRight:8}}/>Enter Results: {test.title}</h4>
            <div style={{fontSize:12,color:'rgba(255,255,255,.6)',marginTop:3}}>{test.subject} · Max Marks: {test.maxMarks}</div>
          </div>
          <button onClick={onClose}>×</button>
        </div>
        <div className="kcc-modal-body">
          {students.length === 0 && <p style={{color:'#94A3B8',textAlign:'center',fontSize:14}}>No students found.</p>}
          <div style={{maxHeight:360,overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>
            {students.map(s => {
              const m = marks[s._id]
              const p = m !== '' ? pct(Number(m)) : null
              return (
                <div key={s._id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'#F8FAFC',borderRadius:10,border:'1px solid #E2E8F0'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'#EEF2FF',color:'#6C63FF',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12,flexShrink:0}}>{s.name?.charAt(0)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:13}}>{s.name}</div>
                    <div style={{fontSize:11,color:'#94A3B8'}}>{s.course||s.email}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <input type="number" min="0" max={test.maxMarks} value={marks[s._id]}
                      onChange={e => setMarks(m => ({...m, [s._id]: e.target.value}))}
                      className="df-input" style={{width:80,padding:'7px 10px',textAlign:'center',fontWeight:700}}
                      placeholder="Marks" />
                    <span style={{fontSize:12,color:'#94A3B8',minWidth:30}}>/{test.maxMarks}</span>
                    {p !== null && (
                      <div style={{textAlign:'center',minWidth:60}}>
                        <div style={{fontSize:13,fontWeight:800,color:gradeColor(p)}}>{p}%</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : <><i className="fas fa-save" style={{marginRight:6}}/>Save Results</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Post Announcement Modal ──────────────────────────────────────────────────
function AnnModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', message:'', audience:'all' })
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const save = async () => {
    if (!form.title || !form.message) return toast.error('Fill all fields')
    try { await API('/teacher/announcements', 'POST', form); toast.success('Announcement posted!'); onSaved() }
    catch (e) { toast.error('Failed') }
  }
  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr"><h4><i className="fas fa-bullhorn" style={{marginRight:8}}/>Post Announcement</h4><button onClick={onClose}>×</button></div>
        <div className="kcc-modal-body">
          <div className="df-group"><label className="df-label">Title *</label><input name="title" value={form.title} onChange={ch} className="df-input" placeholder="Announcement title" /></div>
          <div className="df-group"><label className="df-label">Audience</label>
            <select name="audience" value={form.audience} onChange={ch} className="df-input">
              <option value="all">Everyone</option>
              <option value="students">Students Only</option>
            </select>
          </div>
          <div className="df-group"><label className="df-label">Message *</label><textarea name="message" value={form.message} onChange={ch} className="df-input" rows="4" placeholder="Write your announcement..." /></div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={save}><i className="fas fa-paper-plane" style={{marginRight:6}}/>Post</button>
        </div>
      </div>
    </div>
  )
}

// ── MAIN TEACHER DASHBOARD ───────────────────────────────────────────────────
export default function TeacherDashboard() {
  const user = JSON.parse(localStorage.getItem('kcc_user') || '{}')
  const [hw,       setHW]       = useState([])
  const [tests,    setTests]    = useState([])
  const [anns,     setAnns]     = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState([])
  const [tab,      setTab]      = useState('dashboard')
  const [modal,    setModal]    = useState(null)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    try {
      const [hwR, testsR, annsR, stuR, attR] = await Promise.all([
        API('/teacher/homework').catch(() => ({data:{data:[]}})),
        API('/teacher/tests').catch(() => ({data:{data:[]}})),
        API('/teacher/announcements').catch(() => ({data:{data:[]}})),
        API('/teacher/students').catch(() => ({data:{data:[]}})),
        API('/teacher/attendance').catch(() => ({data:{data:[]}})),
      ])
      setHW(hwR.data.data || [])
      setTests(testsR.data.data || [])
      setAnns(annsR.data.data || [])
      setStudents(stuR.data.data || [])
      setAttendance(attR.data.data || [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  const close = () => { setModal(null); setSelected(null); load() }

  const deleteHW = async (id) => {
    if (!window.confirm('Delete this homework?')) return
    await API(`/teacher/homework/${id}`, 'DELETE')
    toast.success('Homework deleted')
    load()
  }
  const deleteTest = async (id) => {
    if (!window.confirm('Delete this test?')) return
    await API(`/teacher/tests/${id}`, 'DELETE')
    toast.success('Test deleted')
    load()
  }
  const deleteAnn = async (id) => {
    await API(`/teacher/announcements/${id}`, 'DELETE')
    toast.success('Deleted')
    load()
  }

  const TABS = [
    { key:'dashboard',  icon:'fas fa-tachometer-alt', label:'Dashboard'   },
    { key:'homework',   icon:'fas fa-book-open',      label:'Homework'    },
    { key:'attendance', icon:'fas fa-clipboard-check',label:'Attendance'  },
    { key:'tests',      icon:'fas fa-file-alt',       label:'Tests'       },
    { key:'students',   icon:'fas fa-users',          label:'My Students' },
    { key:'notices',    icon:'fas fa-bullhorn',        label:'Notices'     },
  ]

  const totalSubs = hw.reduce((a, h) => a + (h.submissions?.length || 0), 0)
  const todayStr  = new Date().toDateString()

  return (
    <DashLayout title="Teacher Dashboard">
      {/* ── Tab Navigation ── */}
      <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap',background:'#fff',padding:'10px 14px',borderRadius:14,border:'1px solid #E2E8F0'}}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'1.5px solid',borderColor:tab===t.key?'#6C63FF':'transparent',background:tab===t.key?'#EEF2FF':'transparent',color:tab===t.key?'#6C63FF':'#64748B',fontWeight:600,fontSize:12.5,cursor:'pointer',transition:'all .15s'}}>
            <i className={t.icon} style={{fontSize:11}}/>{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════
          DASHBOARD TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'dashboard' && (
        <>
          <div className="stat-grid">
            <div className="stat-box"><div className="stat-icon si-blue"><i className="fas fa-book-open"/></div><div><div className="stat-box-val">{hw.length}</div><div className="stat-box-lbl">Homework Assigned</div></div></div>
            <div className="stat-box"><div className="stat-icon si-green"><i className="fas fa-users"/></div><div><div className="stat-box-val">{students.length}</div><div className="stat-box-lbl">Total Students</div></div></div>
            <div className="stat-box"><div className="stat-icon si-orange"><i className="fas fa-file-alt"/></div><div><div className="stat-box-val">{tests.length}</div><div className="stat-box-lbl">Tests Created</div></div></div>
            <div className="stat-box"><div className="stat-icon si-purple"><i className="fas fa-check-circle"/></div><div><div className="stat-box-val">{totalSubs}</div><div className="stat-box-lbl">HW Submissions</div></div></div>
          </div>

          {/* Quick Actions */}
          <div className="dash-card" style={{marginBottom:24}}>
            <div className="dash-card-hdr"><h3><i className="fas fa-bolt" style={{color:'#F59E0B',marginRight:8}}/>Quick Actions</h3></div>
            <div className="dash-card-body">
              <div className="qa-grid">
                <button className="qa-btn qa-primary" onClick={() => setModal('hw')}><i className="fas fa-plus"/>Assign Homework</button>
                <button className="qa-btn qa-success" onClick={() => setModal('att')}><i className="fas fa-clipboard-check"/>Mark Attendance</button>
                <button className="qa-btn qa-warning" onClick={() => setModal('test')}><i className="fas fa-file-alt"/>Create Test</button>
                <button className="qa-btn qa-info" onClick={() => setModal('ann')}><i className="fas fa-bullhorn"/>Post Announcement</button>
              </div>
            </div>
          </div>

          <div className="dash-row">
            {/* Recent HW */}
            <div className="dash-card">
              <div className="dash-card-hdr">
                <h3><i className="fas fa-book-open" style={{color:'#6C63FF',marginRight:8}}/>Recent Homework</h3>
                <button className="qa-btn qa-primary" style={{padding:'6px 12px',fontSize:11}} onClick={() => setTab('homework')}>View All</button>
              </div>
              <div className="dash-card-body">
                {hw.length === 0 ? <div className="empty-state"><i className="fas fa-book"/><p>No homework assigned yet</p></div>
                : hw.slice(0,4).map((h,i) => (
                  <div key={i} className={`hw-item ${new Date(h.dueDate)<new Date()?'overdue':'pending'}`}>
                    <div className="hw-title">{h.title}</div>
                    <div className="hw-meta">
                      <span><i className="fas fa-book"/>{h.subject}</span>
                      <span><i className="fas fa-calendar"/>Due: {new Date(h.dueDate).toLocaleDateString('en-IN')}</span>
                      <span><i className="fas fa-users"/>{h.submissions?.length||0} submitted</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students */}
            <div className="dash-card">
              <div className="dash-card-hdr">
                <h3><i className="fas fa-users" style={{color:'#22C55E',marginRight:8}}/>My Students</h3>
                <button className="qa-btn qa-success" style={{padding:'6px 12px',fontSize:11}} onClick={() => setTab('students')}>View All</button>
              </div>
              <div style={{padding:0}}>
                {students.length === 0 ? <div className="empty-state" style={{padding:'30px'}}><i className="fas fa-users"/><p>No students yet</p></div>
                : <table className="dash-table">
                    <thead><tr><th>Name</th><th>Course</th><th>Fee</th></tr></thead>
                    <tbody>
                      {students.slice(0,6).map((s,i) => (
                        <tr key={i}>
                          <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{width:28,height:28,borderRadius:'50%',background:'#EEF2FF',color:'#6C63FF',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:11}}>{s.name?.charAt(0)}</div>
                            <div><div style={{fontWeight:600,fontSize:12}}>{s.name}</div></div>
                          </div></td>
                          <td style={{fontSize:12}}>{s.course||'—'}</td>
                          <td><span className={`pill pill-${s.feeStatus==='paid'?'green':s.feeStatus==='overdue'?'red':'orange'}`}>{s.feeStatus||'pending'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          HOMEWORK TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'homework' && (
        <div className="dash-card">
          <div className="dash-card-hdr">
            <h3><i className="fas fa-book-open" style={{color:'#6C63FF',marginRight:8}}/>Homework ({hw.length})</h3>
            <button className="qa-btn qa-primary" onClick={() => setModal('hw')}><i className="fas fa-plus"/>Assign New</button>
          </div>
          <div className="dash-card-body">
            {hw.length === 0 ? <div className="empty-state"><i className="fas fa-book"/><p>No homework assigned yet. Assign your first task!</p></div>
            : hw.map((h,i) => (
              <div key={i} className={`hw-item ${new Date(h.dueDate)<new Date()?'overdue':'pending'}`}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                      <div className="hw-title">{h.title}</div>
                      <span className={`pill pill-${h.priority==='high'?'red':h.priority==='medium'?'orange':'green'}`}>{h.priority}</span>
                      {new Date(h.dueDate)<new Date() && <span className="pill pill-red">Overdue</span>}
                    </div>
                    <div className="hw-meta">
                      <span><i className="fas fa-book"/>{h.subject}</span>
                      <span><i className="fas fa-calendar"/>Due: {new Date(h.dueDate).toLocaleDateString('en-IN')}</span>
                      <span><i className="fas fa-users"/>{h.submissions?.length||0}/{students.length} submitted</span>
                    </div>
                    {h.description && <p style={{fontSize:13,color:'#64748B',marginTop:6,lineHeight:1.6}}>{h.description}</p>}

                    {/* Submissions list */}
                    {h.submissions?.length > 0 && (
                      <div style={{marginTop:10,padding:'10px 12px',background:'#F8FAFC',borderRadius:10}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#64748B',marginBottom:6}}>Submissions:</div>
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {h.submissions.map((sub,j) => (
                            <div key={j} style={{display:'flex',alignItems:'center',gap:5,background:'#fff',border:'1px solid #E2E8F0',borderRadius:8,padding:'4px 10px',fontSize:12}}>
                              <span style={{fontWeight:600}}>{sub.studentName}</span>
                              {sub.grade ? <span className="pill pill-green" style={{fontSize:10}}>{sub.grade}</span> : <span style={{color:'#94A3B8',fontSize:11}}>Not graded</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteHW(h._id)} style={{background:'#FEF2F2',border:'none',color:'#EF4444',cursor:'pointer',fontSize:13,padding:'7px 10px',borderRadius:8,flexShrink:0}}><i className="fas fa-trash"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          ATTENDANCE TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'attendance' && (
        <>
          <div className="stat-grid" style={{marginBottom:20}}>
            <div className="stat-box"><div className="stat-icon si-blue"><i className="fas fa-calendar-check"/></div><div><div className="stat-box-val">{attendance.length}</div><div className="stat-box-lbl">Days Recorded</div></div></div>
            <div className="stat-box"><div className="stat-icon si-green"><i className="fas fa-users"/></div><div><div className="stat-box-val">{students.length}</div><div className="stat-box-lbl">Total Students</div></div></div>
            <div className="stat-box"><div className="stat-icon si-orange"><i className="fas fa-chart-pie"/></div>
              <div><div className="stat-box-val">
                {attendance.length > 0
                  ? Math.round(attendance.reduce((a,att) => {
                      const p = att.records?.filter(r=>r.status==='present').length||0
                      const t = att.records?.length||1
                      return a + (p/t*100)
                    }, 0) / attendance.length) + '%'
                  : '—'
                }
              </div><div className="stat-box-lbl">Avg. Attendance</div></div>
            </div>
            <div className="stat-box">
              <div style={{width:'100%'}}>
                <button className="qa-btn qa-success" style={{width:'100%',justifyContent:'center',padding:'14px'}} onClick={() => setModal('att')}>
                  <i className="fas fa-clipboard-check"/>Mark Today's Attendance
                </button>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-hdr"><h3><i className="fas fa-clipboard-check" style={{color:'#22C55E',marginRight:8}}/>Attendance History</h3></div>
            <div style={{overflowX:'auto'}}>
              <table className="dash-table">
                <thead><tr><th>#</th><th>Date</th><th>Day</th><th>Present</th><th>Absent</th><th>Late</th><th>Total</th><th>Rate</th></tr></thead>
                <tbody>
                  {attendance.map((a,i) => {
                    const present = a.records?.filter(r=>r.status==='present').length||0
                    const absent  = a.records?.filter(r=>r.status==='absent').length||0
                    const late    = a.records?.filter(r=>r.status==='late').length||0
                    const total   = a.records?.length||0
                    const rate    = total ? Math.round((present/total)*100) : 0
                    return (
                      <tr key={a._id}>
                        <td style={{color:'#94A3B8'}}>{i+1}</td>
                        <td style={{fontWeight:700}}>{new Date(a.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                        <td style={{color:'#64748B',fontSize:12}}>{new Date(a.date).toLocaleDateString('en-IN',{weekday:'long'})}</td>
                        <td><span className="pill pill-green">{present}</span></td>
                        <td><span className="pill pill-red">{absent}</span></td>
                        <td><span className="pill pill-orange">{late}</span></td>
                        <td style={{fontWeight:700}}>{total}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <div style={{flex:1,height:6,background:'#E2E8F0',borderRadius:3,minWidth:60}}>
                              <div style={{width:`${rate}%`,height:'100%',background:rate>=75?'#22C55E':rate>=50?'#F59E0B':'#EF4444',borderRadius:3}} />
                            </div>
                            <span style={{fontSize:12,fontWeight:700,color:rate>=75?'#22C55E':rate>=50?'#F59E0B':'#EF4444'}}>{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {attendance.length === 0 && <tr><td colSpan="8"><div className="empty-state" style={{padding:'30px'}}><i className="fas fa-calendar"/><p>No attendance records yet. Mark today's attendance!</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          TESTS TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'tests' && (
        <div className="dash-card">
          <div className="dash-card-hdr">
            <h3><i className="fas fa-file-alt" style={{color:'#3B82F6',marginRight:8}}/>Tests & Results ({tests.length})</h3>
            <button className="qa-btn qa-info" onClick={() => setModal('test')}><i className="fas fa-plus"/>Create Test</button>
          </div>
          <div className="dash-card-body">
            {tests.length === 0 ? <div className="empty-state"><i className="fas fa-file-alt"/><p>No tests created yet</p></div>
            : tests.map((t,i) => (
              <div key={i} className="hw-item pending" style={{marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                      <div className="hw-title">{t.title}</div>
                      <span className="pill pill-blue">Max: {t.maxMarks}</span>
                      {t.duration && <span className="pill pill-purple">{t.duration}</span>}
                    </div>
                    <div className="hw-meta">
                      <span><i className="fas fa-book"/>{t.subject}</span>
                      <span><i className="fas fa-calendar"/>{new Date(t.date).toLocaleDateString('en-IN')}</span>
                      <span><i className="fas fa-users"/>{t.results?.length||0} results entered</span>
                    </div>

                    {/* Results summary */}
                    {t.results?.length > 0 && (
                      <div style={{marginTop:10,display:'flex',flexWrap:'wrap',gap:6}}>
                        {t.results.map((r,j) => (
                          <div key={j} style={{background:'#F8FAFC',border:'1px solid #E2E8F0',borderRadius:8,padding:'5px 10px',fontSize:12,display:'flex',alignItems:'center',gap:6}}>
                            <span style={{fontWeight:600}}>{r.studentName}</span>
                            <span style={{fontWeight:800,color:'#6C63FF'}}>{r.marks}/{t.maxMarks}</span>
                            <span className={`pill pill-${r.grade==='A+'||r.grade==='A'?'green':r.grade==='F'?'red':'orange'}`} style={{fontSize:10}}>{r.grade}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={() => { setSelected(t); setModal('results') }} className="qa-btn qa-success" style={{padding:'7px 12px',fontSize:12}}>
                      <i className="fas fa-star"/>Results
                    </button>
                    <button onClick={() => deleteTest(t._id)} style={{background:'#FEF2F2',border:'none',color:'#EF4444',cursor:'pointer',fontSize:13,padding:'7px 10px',borderRadius:8}}>
                      <i className="fas fa-trash"/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          STUDENTS TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'students' && (
        <div className="dash-card">
          <div className="dash-card-hdr"><h3><i className="fas fa-users" style={{color:'#22C55E',marginRight:8}}/>All Students ({students.length})</h3></div>
          <div style={{overflowX:'auto'}}>
            <table className="dash-table">
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Course</th><th>Fee Status</th><th>Joined</th></tr></thead>
              <tbody>
                {students.map((s,i) => (
                  <tr key={s._id}>
                    <td style={{color:'#94A3B8'}}>{i+1}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'#EEF2FF',color:'#6C63FF',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:12}}>{s.name?.charAt(0)}</div>
                      <div><div style={{fontWeight:600,fontSize:13}}>{s.name}</div></div>
                    </div></td>
                    <td style={{fontSize:13}}>{s.email}</td>
                    <td style={{fontSize:13}}>{s.phone||'—'}</td>
                    <td style={{fontSize:12}}>{s.course||'—'}</td>
                    <td><span className={`pill pill-${s.feeStatus==='paid'?'green':s.feeStatus==='overdue'?'red':'orange'}`}>{s.feeStatus||'pending'}</span></td>
                    <td style={{fontSize:12,color:'#94A3B8'}}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan="7"><div className="empty-state" style={{padding:'30px'}}><i className="fas fa-users"/><p>No students yet</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          NOTICES TAB
      ════════════════════════════════════════════════════════════ */}
      {tab === 'notices' && (
        <div className="dash-card">
          <div className="dash-card-hdr">
            <h3><i className="fas fa-bullhorn" style={{color:'#F59E0B',marginRight:8}}/>My Announcements</h3>
            <button className="qa-btn qa-warning" onClick={() => setModal('ann')}><i className="fas fa-plus"/>Post New</button>
          </div>
          <div className="dash-card-body">
            {anns.length === 0 ? <div className="empty-state"><i className="fas fa-bullhorn"/><p>No announcements yet</p></div>
            : anns.map((a,i) => (
              <div key={i} className="ann-item" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
                    <div className="ann-title">{a.title}</div>
                    <span className={`pill pill-${a.audience==='all'?'purple':'blue'}`}>{a.audience}</span>
                  </div>
                  <div className="ann-msg">{a.message}</div>
                  <div className="ann-date"><i className="fas fa-clock" style={{marginRight:4}}/>{new Date(a.createdAt).toDateString()}</div>
                </div>
                <button onClick={() => deleteAnn(a._id)} style={{background:'none',border:'none',color:'#EF4444',cursor:'pointer',fontSize:14,flexShrink:0}}><i className="fas fa-trash"/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modal === 'hw'      && <AssignHWModal onClose={() => setModal(null)} onSaved={close} />}
      {modal === 'att'     && <AttendanceModal onClose={() => setModal(null)} onSaved={close} students={students} />}
      {modal === 'test'    && <TestModal onClose={() => setModal(null)} onSaved={close} />}
      {modal === 'results' && selected && <EnterResultsModal test={selected} students={students} onClose={() => { setModal(null); setSelected(null) }} onSaved={close} />}
      {modal === 'ann'     && <AnnModal onClose={() => setModal(null)} onSaved={close} />}
    </DashLayout>
  )
}
