import { ModuleCard } from './ModuleCard.jsx'

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-5"/>
  </svg>
)

const statusStyles = {
  Excellent: 'bg-green-950/60 text-green-300 border-green-800/50',
  Good: 'bg-brand-950/60 text-brand-300 border-brand-800/50',
  'Needs Improvement': 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50',
  'High Risk': 'bg-red-950/60 text-red-300 border-red-800/50',
}

const scoreBarStyles = {
  Excellent: 'bg-green-500',
  Good: 'bg-brand-500',
  'Needs Improvement': 'bg-yellow-500',
  'High Risk': 'bg-red-500',
}

function StatusBadge({ status }) {
  return (
    <span className={`pill border text-[10px] font-semibold ${statusStyles[status] || statusStyles['High Risk']}`}>
      {status}
    </span>
  )
}

function ListPanel({ title, items, emptyText, tone }) {
  const toneStyles = {
    finding: {
      icon: 'text-amber-400',
      border: 'border-amber-900/30',
      bg: 'bg-amber-950/10',
    },
    recommendation: {
      icon: 'text-green-400',
      border: 'border-green-900/30',
      bg: 'bg-green-950/10',
    },
  }
  const styles = toneStyles[tone]

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-1.5 h-1.5 rounded-full ${styles.icon.replace('text-', 'bg-')}`} />
        <h4 className="text-xs font-medium uppercase tracking-widest text-surface-500">{title}</h4>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {items.map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-surface-300 leading-relaxed">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${styles.icon.replace('text-', 'bg-')}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-surface-500 leading-relaxed">{emptyText}</p>
      )}
    </div>
  )
}

export default function ComplianceModule({ compliance, index }) {
  if (!compliance) return null

  const score = Math.max(0, Math.min(100, compliance.score || 0))
  const findings = compliance.findings || []
  const recommendations = compliance.recommendations || []

  return (
    <ModuleCard
      id="compliance"
      icon={<Icon />}
      title="Compliance Analysis"
      index={index}
      badge={<StatusBadge status={compliance.status} />}
    >
      <div className="mb-5 pb-5 border-b border-surface-800/50">
        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 items-center">
          <div className="rounded-xl border border-surface-700/40 bg-surface-950/60 p-4">
            <span className="block text-[10px] uppercase tracking-widest text-surface-600 mb-2">Compliance Score</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-800 text-3xl text-white">{score}</span>
              <span className="text-sm text-surface-600">/100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-surface-600">Control coverage</span>
              <span className="text-xs text-surface-500">{compliance.status}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${scoreBarStyles[compliance.status] || scoreBarStyles['High Risk']}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <ListPanel
          title="Findings"
          items={findings}
          emptyText="No compliance gaps detected by the v1 rule set."
          tone="finding"
        />
        <ListPanel
          title="Recommendations"
          items={recommendations}
          emptyText="Current workflow contains the expected v1 governance controls."
          tone="recommendation"
        />
      </div>
    </ModuleCard>
  )
}
