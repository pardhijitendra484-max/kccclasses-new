import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import './DashLayout.css'

const NAV = {
  admin: [
    { to: '/admin/dashboard',     icon: 'fas fa-tachometer-alt',      label: 'Overview'    },
    { to: '/admin/students',      icon: 'fas fa-user-graduate',        label: 'Students'    },
    { to: '/admin/teachers',      icon: 'fas fa-chalkboard-teacher',   label: 'Teachers'    },
    { to: '/admin/fees',          icon: 'fas fa-rupee-sign',           label: 'Fees'        },
    { to: '/admin/announcements', icon: 'fas fa-bullhorn',             label: 'Notices'     },
  ],
  teacher: [
    { to: '/teacher/dashboard',   icon: 'fas fa-tachometer-alt',       label: 'Dashboard'   },
    { to: '/teacher/homework',    icon: 'fas fa-book-open',            label: 'Homework'    },
    { to: '/teacher/attendance',  icon: 'fas fa-clipboard-check',      label: 'Attendance'  },
    { to: '/teacher/tests',       icon: 'fas fa-file-alt',             label: 'Tests'       },
    { to: '/teacher/students',    icon: 'fas fa-users',                label: 'My Students' },
  ],
  student: [
    { to: '/student/dashboard',   icon: 'fas fa-home',                 label: 'Dashboard'   },
    { to: '/student/homework',    icon: 'fas fa-book-open',            label: 'Homework'    },
    { to: '/student/attendance',  icon: 'fas fa-clipboard-check',      label: 'Attendance'  },
    { to: '/student/results',     icon: 'fas fa-chart-bar',            label: 'Results'     },
    { to: '/student/fees',        icon: 'fas fa-rupee-sign',           label: 'My Fees'     },
  ],
}

export default function DashLayout({ children, title }) {
  const [sideOpen, setSideOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  const raw  = JSON.parse(localStorage.getItem('kcc_user') || '{}')
  const user = raw

  useEffect(() => { setSideOpen(false) }, [location])

  const logout = () => {
    localStorage.removeItem('kcc_token')
    localStorage.removeItem('kcc_user')
    navigate('/login')
  }

  const links    = NAV[user?.role] || []
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : 'U'

  return (
    <div className="dash-wrap">
      {sideOpen && <div className="dash-overlay" onClick={() => setSideOpen(false)} />}

      {/* Sidebar */}
      <aside className={`dash-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="ds-brand">
          <Link to="/" className="ds-logo">
            <div className="ds-logo-icon"><i className="fas fa-graduation-cap" /></div>
            <span>KCC <em>Classes</em></span>
          </Link>
        </div>

        <div className="ds-user">
          <div className="ds-avatar">{initials}</div>
          <div className="ds-user-info">
            <span className="ds-name">{user?.name || 'User'}</span>
            <span className={`ds-role-tag role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>

        <nav className="ds-nav">
          <p className="ds-nav-label">Navigation</p>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `ds-link ${isActive ? 'active' : ''}`}>
              <i className={l.icon} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ds-sidebar-footer">
          <Link to="/" className="ds-link"><i className="fas fa-globe" /><span>Back to Website</span></Link>
          <button className="ds-link ds-logout" onClick={logout}>
            <i className="fas fa-sign-out-alt" /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dt-left">
            <button className="dt-menu-btn" onClick={() => setSideOpen(v => !v)}>
              <i className="fas fa-bars" />
            </button>
            <h1 className="dt-title">{title}</h1>
          </div>
          <div className="dt-right">
            <div className="dt-user-pill">
              <div className="dt-avatar">{initials}</div>
              <div className="dt-info">
                <span className="dt-name">{user?.name}</span>
                <span className={`dt-role role-${user?.role}`}>{user?.role}</span>
              </div>
            </div>
            <button className="dt-logout-btn" onClick={logout} title="Logout">
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>
        </header>

        <main className="dash-content">
          {children}
        </main>
      </div>
    </div>
  )
}
