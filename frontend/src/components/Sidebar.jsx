import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',        icon: '⊞', label: 'Analyse'  },
  { to: '/history', icon: '◷', label: 'History'  },
  { to: '/profile', icon: '◎', label: 'Profile'  },
  { to: '/settings',icon: '⚙', label: 'Settings' },
]

export default function Sidebar({ email, onLogout }) {
  const initial = email ? email[0].toUpperCase() : 'U'

  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-md shadow-accent/30 shrink-0">
          <span className="font-display font-bold text-white text-xs">R</span>
        </div>
        <span className="font-display font-bold text-white tracking-tight">ResumeAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Pro tip */}
      <div className="mx-3 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-amber-400 text-xs">★</span>
          <span className="text-amber-400 text-xs font-semibold font-display">Pro Tip</span>
        </div>
        <p className="text-xs text-amber-300/70 leading-relaxed">
          Include keywords from the job description to increase your ATS score.
        </p>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
            <span className="text-accent text-xs font-bold font-display">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{email}</p>
            <button
              onClick={onLogout}
              className="text-xs text-muted hover:text-rose-400 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
