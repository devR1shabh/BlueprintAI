// ─── Placeholder card shown while status is idle ──────────────────────────────

function EmptyModule({ id, icon, title, description, index }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div
        className="rounded-2xl border border-surface-800/40 bg-surface-900/30 p-6 animate-fade-up"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl border border-surface-800 bg-surface-900 flex items-center justify-center text-surface-600 shrink-0">
            {icon}
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-display font-600 text-sm text-surface-500">{title}</h3>
                <p className="text-xs text-surface-700">{description}</p>
              </div>
              {/* Locked badge */}
              <span className="pill bg-surface-900 text-surface-700 border border-surface-800 text-[10px]">
                Pending
              </span>
            </div>

            {/* Skeleton lines */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="h-2.5 rounded-full bg-surface-800/60 w-3/4" />
              <div className="h-2.5 rounded-full bg-surface-800/40 w-1/2" />
              <div className="h-2.5 rounded-full bg-surface-800/30 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Module definitions ────────────────────────────────────────────────────────

const MODULES = [
  {
    id: 'summary',
    title: 'Process Summary',
    description: 'High-level overview of the business process.',
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
    title: 'Workflow Steps',
    description: 'Sequential steps with actors and actions extracted.',
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
    title: 'Roles & Actors',
    description: 'Human, system, and external parties identified.',
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
    title: 'Risk Analysis',
    description: 'Bottlenecks, compliance risks, and severity ratings.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'sop',
    title: 'SOP Document',
    description: 'Complete Standard Operating Procedure, ready to export.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'diagram',
    title: 'Workflow Diagram',
    description: 'Auto-generated Mermaid flowchart.',
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
]

// ─── Empty state hero (shown before first analysis) ───────────────────────────

function EmptyStateHero() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      {/* Decorative mark */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-950 border border-brand-800/50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        {/* Corner dots */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-600 border-2 border-surface-900" />
      </div>

      <h3 className="font-display font-700 text-base text-surface-300 mb-1.5">
        Ready to analyze
      </h3>
      <p className="text-sm text-surface-600 max-w-xs leading-relaxed">
        Enter your business process on the left and click <strong className="text-surface-500 font-medium">Analyze Blueprint</strong> to generate all six outputs.
      </p>

      {/* Output count strip */}
      <div className="mt-6 flex items-center gap-1.5 flex-wrap justify-center">
        {MODULES.map((m) => (
          <span key={m.id} className="pill bg-surface-900 text-surface-600 border border-surface-800/60 text-[10px]">
            {m.title}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── ResultsPanel ─────────────────────────────────────────────────────────────

export default function ResultsPanel({ outputs, status }) {
  const isIdle = status === 'idle'

  return (
    <div className="flex flex-col gap-6">

      {/* Empty state */}
      {isIdle && <EmptyStateHero />}

      {/* Divider between empty state and module stubs */}
      {isIdle && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-800/60" />
          <span className="text-[10px] text-surface-700 tracking-widest uppercase font-medium">
            Output modules
          </span>
          <div className="flex-1 h-px bg-surface-800/60" />
        </div>
      )}

      {/* Module placeholders — always shown so the layout is clear */}
      {MODULES.map((mod, i) => (
        <EmptyModule
          key={mod.id}
          id={mod.id}
          icon={mod.icon}
          title={mod.title}
          description={mod.description}
          index={i}
        />
      ))}
    </div>
  )
}