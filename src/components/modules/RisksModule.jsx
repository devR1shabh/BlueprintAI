import { ModuleCard, CountBadge, SeverityBadge } from './ModuleCard.jsx'

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const categoryStyles = {
  operational: { bg: 'bg-blue-950/40',   text: 'text-blue-300',   border: 'border-blue-800/40'   },
  compliance:  { bg: 'bg-orange-950/40', text: 'text-orange-300', border: 'border-orange-800/40' },
  security:    { bg: 'bg-red-950/40',    text: 'text-red-300',    border: 'border-red-800/40'    },
  process:     { bg: 'bg-yellow-950/40', text: 'text-yellow-300', border: 'border-yellow-800/40' },
  human:       { bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-800/40' },
}

const severityBorderLeft = {
  critical: 'border-l-red-500',
  high:     'border-l-orange-500',
  medium:   'border-l-yellow-500',
  low:      'border-l-green-500',
}

function RiskItem({ risk, index }) {
  const catStyle = categoryStyles[risk.category] || categoryStyles.process
  const leftBorder = severityBorderLeft[risk.severity] || severityBorderLeft.low

  return (
    <div
      className={`rounded-xl border border-surface-700/40 border-l-2 ${leftBorder} bg-surface-800/30 p-4 animate-fade-up`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-white leading-snug">{risk.title}</p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`pill border text-[10px] ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
            {risk.category.charAt(0).toUpperCase() + risk.category.slice(1)}
          </span>
          <SeverityBadge severity={risk.severity} />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-surface-400 leading-relaxed mb-3">{risk.description}</p>

      {/* Mitigation */}
      <div className="rounded-lg bg-surface-900/60 border border-surface-700/30 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span className="text-[10px] text-green-400 font-medium uppercase tracking-wide">Mitigation</span>
        </div>
        <p className="text-xs text-surface-400 leading-relaxed">{risk.mitigation}</p>
      </div>
    </div>
  )
}

export default function RisksModule({ risks, index }) {
  if (!risks || risks.length === 0) return null

  // Severity summary counts
  const counts = risks.reduce((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1
    return acc
  }, {})

  const highCount = (counts.critical || 0) + (counts.high || 0)

  return (
    <ModuleCard
      id="risks"
      icon={<Icon />}
      title="Risk Analysis"
      index={index}
      badge={
        <div className="flex items-center gap-1.5">
          {highCount > 0 && (
            <span className="pill bg-red-950/50 text-red-300 border border-red-800/50 text-[10px]">
              {highCount} high+
            </span>
          )}
          <CountBadge count={risks.length} label="risks" />
        </div>
      }
    >
      {/* Severity distribution bar */}
      <div className="mb-4 pb-4 border-b border-surface-800/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-surface-600 uppercase tracking-widest">Severity distribution</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          {counts.critical > 0 && <div className="bg-red-500 rounded-full" style={{ flex: counts.critical }} />}
          {counts.high     > 0 && <div className="bg-orange-500 rounded-full" style={{ flex: counts.high }} />}
          {counts.medium   > 0 && <div className="bg-yellow-500 rounded-full" style={{ flex: counts.medium }} />}
          {counts.low      > 0 && <div className="bg-green-500 rounded-full" style={{ flex: counts.low }} />}
        </div>
        <div className="flex items-center gap-3 mt-2">
          {['critical','high','medium','low'].map(s => counts[s] ? (
            <span key={s} className="text-[10px] text-surface-500">
              <span className="font-semibold text-surface-300">{counts[s]}</span> {s}
            </span>
          ) : null)}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {risks.map((risk, i) => (
          <RiskItem key={risk.id} risk={risk} index={i} />
        ))}
      </div>
    </ModuleCard>
  )
}