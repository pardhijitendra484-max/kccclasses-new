import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import DashLayout from '../../components/dashboard/DashLayout.jsx'

const API = (path, method = 'GET', body = null) => {
  const token = localStorage.getItem('kcc_token')
  return axios({ url: `/api${path}`, method, data: body, headers: { Authorization: `Bearer ${token}` } })
}

function SubmitHWModal({ hw, onClose, onSaved }) {
  const [note, setNote] = useState('')
  const submit = async () => {
    try {
      await API(`/student/homework/${hw._id}/submit`, 'POST', { note })
      toast.success('Homework submitted! 🎉')
      onSaved()
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }
  return (
    <div className="kcc-modal-bg" onClick={onClose}>
      <div className="kcc-modal" onClick={e => e.stopPropagation()}>
        <div className="kcc-modal-hdr"><h4><i className="fas fa-upload me2" /> Submit Homework</h4><button onClick={onClose}>×</button></div>
        <div className="kcc-modal-body">
          <div style={{ background:'#F8FAFC', borderRadius:10, padding:'12px 14px', fontWeight:700, fontSize:14, marginBottom:4 }}>{hw.title}</div>
          <div style={{ fontSize:13, color:'#64748B', marginBottom:12 }}>{hw.description}</div>
          <div className="df-group"><label className="df-label">Your Note / Answer</label><textarea value={note} onChange={e => setNote(e.target.value)} className="df-input" rows="4" placeholder="Write your answer or a note for the teacher..." /></div>
        </div>
        <div className="kcc-modal-footer">
          <button className="btn-dash-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dash-primary" onClick={submit}><i className="fas fa-paper-plane" /> Submit</button>
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const user     = JSON.parse(localStorage.getItem('kcc_user') || '{}')
  const [hw,     setHW]     = useState([])
  const [fees,   setFees]   = useState([])
  const [anns,   setAnns]   = useState([])
  const [results,setResults]= useState([])
  const [att,    setAtt]    = useState([])
  const [active, setActive] = useState('homework')
  const [submitHW, setSubmitHW] = useState(null)

  const load = async () => {
    try {
      const [hwR, feeR, annR, resR, attR] = await Promise.all([
        API('/student/homework').catch(() => ({ data: { data: [] } })),
        API('/student/fees').catch(() => ({ data: { data: [] } })),
        API('/student/announcements').catch(() => ({ data: { data: [] } })),
        API('/student/results').catch(() => ({ data: { data: [] } })),
        API('/student/attendance').catch(() => ({ data: { data: [] } })),
      ])
      setHW(hwR.data.data || [])
      setFees(feeR.data.data || [])
      setAnns(annR.data.data || [])
      setResults(resR.data.data || [])
      setAtt(attR.data.data || [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  const enrichedHW = hw.map(h => ({
    ...h,
    mySubmission: h.submissions?.find(s => s.student === user.id || s.studentId === user.id),
    overdue: new Date(h.dueDate) < new Date()
  }))

  const pending   = enrichedHW.filter(h => !h.mySubmission).length
  const submitted = enrichedHW.filter(h => !!h.mySubmission).length
  const totalFeeOwed   = fees.filter(f => f.status !== 'paid').reduce((a, f) => a + ((f.amount||0) - (f.paidAmount||0)), 0)
  const attPercent = att.length ? Math.round((att.filter(r => r.status === 'present').length / att.length) * 100) : 0

  return (
    <DashLayout title="Student Dashboard">
      {/* Course Banner */}
      {user.course && (
        <div style={{ background:'linear-gradient(135deg,#0F0E1A,#6C63FF)', borderRadius:16, padding:'20px 24px', color:'#fff', marginBottom:24, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:50, height:50, borderRadius:14, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}><i className="fas fa-graduation-cap" /></div>
          <div>
            <div style={{ fontSize:11, opacity:.7, textTransform:'uppercase', letterSpacing:1 }}>Enrolled Course</div>
            <div style={{ fontSize:20, fontWeight:800 }}>{user.course}</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-box"><div className="stat-icon si-orange"><i className="fas fa-clock" /></div><div><div className="stat-box-val">{pending}</div><div className="stat-box-lbl">Pending HW</div></div></div>
        <div className="stat-box"><div className="stat-icon si-green"><i className="fas fa-check-circle" /></div><div><div className="stat-box-val">{submitted}</div><div className="stat-box-lbl">Submitted</div></div></div>
        <div className="stat-box"><div className="stat-icon si-blue"><i className="fas fa-clipboard-check" /></div><div><div className="stat-box-val">{attPercent}%</div><div className="stat-box-lbl">Attendance</div></div></div>
        <div className="stat-box"><div className="stat-icon si-red"><i className="fas fa-rupee-sign" /></div><div><div className="stat-box-val">₹{totalFeeOwed.toLocaleString('en-IN')}</div><div className="stat-box-lbl">Fee Due</div></div></div>
      </div>

      {/* Tab Nav */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {[['homework','fas fa-book-open','Homework'],['fees','fas fa-rupee-sign','My Fees'],['results','fas fa-chart-bar','Results'],['attendance','fas fa-clipboard-check','Attendance'],['announcements','fas fa-bullhorn','Notices']].map(([key,icon,label]) => (
          <button key={key} onClick={() => setActive(key)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, border:'1.5px solid', borderColor: active===key?'#6C63FF':'#E2E8F0', background: active===key?'#6C63FF':'#fff', color: active===key?'#fff':'#64748B', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all .2s' }}>
            <i className={icon} style={{ fontSize:12 }} />{label}
          </button>
        ))}
      </div>

      {/* Homework Tab */}
      {active === 'homework' && (
        <div className="dash-card">
          <div className="dash-card-hdr"><h3><i className="fas fa-book-open" style={{ color:'#6C63FF', marginRight:8 }} />My Homework</h3></div>
          <div className="dash-card-body">
            {enrichedHW.length === 0 ? <div className="empty-state"><i className="fas fa-book" /><p>No homework assigned yet</p></div>
            : enrichedHW.map((h, i) => (
              <div key={i} className={`hw-item ${h.mySubmission ? 'submitted' : h.overdue ? 'overdue' : 'pending'}`}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                      <div className="hw-title">{h.title}</div>
                      {h.mySubmission ? <span className="pill pill-green"><i className="fas fa-check" /> Submitted</span>
                      : h.overdue ? <span className="pill pill-red"><i className="fas fa-times-circle" /> Overdue</span>
                      : <span className="pill pill-orange"><i className="fas fa-clock" /> Pending</span>}
                      {h.mySubmission?.grade && <span className="pill pill-blue">Grade: {h.mySubmission.grade}</span>}
                    </div>
                    <div className="hw-meta">
                      <span><i className="fas fa-book" />{h.subject}</span>
                      <span><i className="fas fa-calendar" />Due: {new Date(h.dueDate).toLocaleDateString('en-IN')}</span>
                      <span><i className="fas fa-user" />By: {h.assignedByName || 'Teacher'}</span>
                    </div>
                    {h.description && <p style={{ fontSize:13, color:'#64748B', marginTop:6, lineHeight:1.6 }}>{h.description}</p>}
                  </div>
                  {!h.mySubmission && (
                    <button className="qa-btn qa-primary" style={{ padding:'8px 16px', fontSize:12, flexShrink:0 }} onClick={() => setSubmitHW(h)}>
                      <i className="fas fa-upload" /> Submit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fees Tab */}
      {active === 'fees' && (
        <div className="dash-card">
          <div className="dash-card-hdr"><h3><i className="fas fa-rupee-sign" style={{ color:'#22C55E', marginRight:8 }} />My Fees</h3></div>
          <div style={{ overflowX:'auto' }}>
            <table className="dash-table">
              <thead><tr><th>#</th><th>Month</th><th>Amount</th><th>Paid</th><th>Due Date</th><th>Method</th><th>Receipt</th><th>Status</th></tr></thead>
              <tbody>
                {fees.map((f, i) => (
                  <tr key={i}>
                    <td style={{ color:'#94A3B8' }}>{i+1}</td>
                    <td style={{ fontWeight:600 }}>{f.month}</td>
                    <td style={{ fontWeight:700 }}>₹{f.amount?.toLocaleString('en-IN')}</td>
                    <td style={{ color:'#22C55E', fontWeight:600 }}>₹{(f.paidAmount||0).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize:12, color:'#94A3B8' }}>{f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ fontSize:12 }}>{f.method || '—'}</td>
                    <td style={{ fontSize:11, color:'#94A3B8' }}>{f.receiptNo || '—'}</td>
                    <td><span className={`pill pill-${f.status==='paid'?'green':f.status==='overdue'?'red':'orange'}`}>{f.status}</span></td>
                  </tr>
                ))}
                {fees.length === 0 && <tr><td colSpan="8"><div className="empty-state" style={{ padding:'30px' }}><i className="fas fa-rupee-sign" /><p>No fee records yet</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Tab */}
      {active === 'results' && (
        <div className="dash-card">
          <div className="dash-card-hdr"><h3><i className="fas fa-chart-bar" style={{ color:'#3B82F6', marginRight:8 }} />My Test Results</h3></div>
          <div className="dash-card-body">
            {results.length === 0 ? <div className="empty-state"><i className="fas fa-chart-bar" /><p>No test results yet</p></div>
            : results.map((t, i) => (
              <div key={i} className="hw-item pending" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div className="hw-title">{t.title}</div>
                  <div className="hw-meta">
                    <span><i className="fas fa-book" />{t.subject}</span>
                    <span><i className="fas fa-calendar" />{new Date(t.date).toLocaleDateString('en-IN')}</span>
                    <span><i className="fas fa-star" />Max: {t.maxMarks}</span>
                  </div>
                </div>
                {t.myResult ? (
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:26, fontWeight:900 }}>{t.myResult.marks}<span style={{ fontSize:14, color:'#94A3B8' }}>/{t.maxMarks}</span></div>
                    <span className={`pill pill-${['A+','A'].includes(t.myResult.grade)?'green':['B+','B'].includes(t.myResult.grade)?'blue':t.myResult.grade==='F'?'red':'orange'}`}>
                      {t.myResult.grade}
                    </span>
                  </div>
                ) : <span className="pill pill-orange">Not entered</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {active === 'attendance' && (
        <div>
          <div className="stat-grid" style={{ marginBottom:20 }}>
            <div className="stat-box"><div className="stat-icon si-green"><i className="fas fa-check" /></div><div><div className="stat-box-val">{att.filter(r=>r.status==='present').length}</div><div className="stat-box-lbl">Present</div></div></div>
            <div className="stat-box"><div className="stat-icon si-red"><i className="fas fa-times" /></div><div><div className="stat-box-val">{att.filter(r=>r.status==='absent').length}</div><div className="stat-box-lbl">Absent</div></div></div>
            <div className="stat-box"><div className="stat-icon si-blue"><i className="fas fa-percent" /></div><div><div className="stat-box-val">{attPercent}%</div><div className="stat-box-lbl">Overall</div></div></div>
            <div className="stat-box"><div className="stat-icon si-purple"><i className="fas fa-calendar" /></div><div><div className="stat-box-val">{att.length}</div><div className="stat-box-lbl">Total Classes</div></div></div>
          </div>
          <div className="dash-card">
            <div className="dash-card-hdr"><h3>Attendance Records</h3></div>
            <div style={{ overflowX:'auto' }}>
              <table className="dash-table">
                <thead><tr><th>#</th><th>Date</th><th>Day</th><th>Status</th></tr></thead>
                <tbody>
                  {att.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color:'#94A3B8' }}>{i+1}</td>
                      <td style={{ fontWeight:600 }}>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                      <td style={{ color:'#64748B' }}>{new Date(r.date).toLocaleDateString('en-IN',{weekday:'long'})}</td>
                      <td><span className={`pill pill-${r.status==='present'?'green':r.status==='late'?'orange':'red'}`}>
                        <i className={`fas fa-${r.status==='present'?'check':r.status==='late'?'clock':'times'}`} /> {r.status}
                      </span></td>
                    </tr>
                  ))}
                  {att.length === 0 && <tr><td colSpan="4"><div className="empty-state" style={{ padding:'30px' }}><i className="fas fa-calendar" /><p>No attendance records yet</p></div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {active === 'announcements' && (
        <div className="dash-card">
          <div className="dash-card-hdr"><h3><i className="fas fa-bullhorn" style={{ color:'#F59E0B', marginRight:8 }} />Notices from Teachers</h3></div>
          <div className="dash-card-body">
            {anns.length === 0 ? <div className="empty-state"><i className="fas fa-bullhorn" /><p>No announcements yet</p></div>
            : anns.map((a, i) => (
              <div key={i} className="ann-item">
                <div className="ann-title">{a.title}</div>
                <div className="ann-msg">{a.message}</div>
                <div className="ann-date"><i className="fas fa-user" style={{ marginRight:4 }} />{a.postedByName || 'Teacher'} · <i className="fas fa-clock" style={{ marginRight:4 }} />{new Date(a.createdAt).toDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {submitHW && <SubmitHWModal hw={submitHW} onClose={() => setSubmitHW(null)} onSaved={() => { setSubmitHW(null); load() }} />}
    </DashLayout>
  )
}
