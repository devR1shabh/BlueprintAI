const NAV_ITEMS = [
  {
    id: 'input',
    label: 'Input',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    alwaysEnabled: true,
  },
  {
    id: 'summary',
    label: 'Summary',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'workflow',
    label: 'Workflow',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-5"/>
      </svg>
    ),
  },
  {
    id: 'sop',
    label: 'SOP',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'diagram',
    label: 'Diagram',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    ),
  },
  {
    id: 'export-center',
    label: 'Export',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
]

export default function Sidebar({ status, activeSection }) {
  const isReady = status === 'ready'

  const handleNavClick = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-52 border-r border-surface-800/60 bg-surface-950/95 backdrop-blur-sm flex flex-col z-40">

      {/* Section label */}
      <div className="px-4 pt-5 pb-3">
        <span className="text-[10px] font-medium tracking-widest uppercase text-surface-600">
          Sections
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const enabled = item.alwaysEnabled || isReady
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => enabled && handleNavClick(item.id)}
              disabled={!enabled}
              className={`
                group flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-left
                transition-all duration-150
                ${isActive && enabled
                  ? 'bg-brand-950/80 text-brand-300 border border-brand-800/50'
                  : enabled
                    ? 'text-surface-400 hover:bg-surface-800/60 hover:text-surface-200'
                    : 'text-surface-700 cursor-not-allowed opacity-50'
                }
              `}
            >
              <span className={`shrink-0 transition-colors ${isActive && enabled ? 'text-brand-400' : ''}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>

              {/* Lock icon for disabled items */}
              {!enabled && (
                <svg className="ml-auto w-3 h-3 text-surface-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              )}
            </button>
          )
        })}
      </nav>

      {/* Status footer */}
      <div className="p-4 border-t border-surface-800/50">
        <div className={`flex items-center gap-2 text-xs ${isReady ? 'text-green-400' : 'text-surface-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'processing' ? 'bg-brand-400 animate-pulse' :
            isReady ? 'bg-green-500' : 'bg-surface-700'
          }`} />
          {status === 'idle' && 'Awaiting input'}
          {status === 'processing' && 'Analyzing…'}
          {status === 'ready' && 'Blueprint ready'}
          {status === 'error' && 'Error — retry'}
        </div>
      </div>
    </aside>
  )
}
