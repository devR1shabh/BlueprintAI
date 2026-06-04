/**
 * ModuleCard.jsx
 * Shared wrapper used by every output module.
 * Provides consistent section anchor, header, card chrome, and fade-in.
 */

export function ModuleCard({ id, icon, title, badge, action, children, index = 0 }) {
  return (
    <section id={id} className="scroll-mt-20 animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="rounded-2xl border border-surface-700/50 bg-surface-900/70 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-950 border border-brand-800/50 flex items-center justify-center text-brand-400 shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="font-display font-700 text-sm text-white leading-tight">{title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </div>

        {/* Card body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </section>
  )
}

export function CountBadge({ count, label }) {
  return (
    <span className="pill bg-brand-950/80 text-brand-300 border border-brand-800/50 text-[10px]">
      {count} {label}
    </span>
  )
}

export function SeverityBadge({ severity }) {
  const styles = {
    critical: 'bg-red-950/60 text-red-300 border-red-800/50',
    high:     'bg-orange-950/60 text-orange-300 border-orange-800/50',
    medium:   'bg-yellow-950/60 text-yellow-300 border-yellow-800/50',
    low:      'bg-green-950/60 text-green-300 border-green-800/50',
  }
  return (
    <span className={`pill border text-[10px] font-semibold tracking-wide ${styles[severity] || styles.low}`}>
      {severity.toUpperCase()}
    </span>
  )
}

export function TypeBadge({ type }) {
  const styles = {
    human:    'bg-brand-950/60 text-brand-300 border-brand-800/50',
    system:   'bg-green-950/60 text-green-300 border-green-800/50',
    external: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
  }
  const labels = { human: 'Human', system: 'System', external: 'External' }
  return (
    <span className={`pill border text-[10px] ${styles[type] || styles.human}`}>
      {labels[type] || type}
    </span>
  )
}

export function StepTypeBadge({ type }) {
  const styles = {
    trigger:  'bg-purple-950/60 text-purple-300 border-purple-800/50',
    action:   'bg-surface-800/60 text-surface-400 border-surface-700/50',
    decision: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50',
    end:      'bg-brand-950/60 text-brand-300 border-brand-800/50',
  }
  const labels = { trigger: 'Trigger', action: 'Action', decision: 'Decision', end: 'End' }
  return (
    <span className={`pill border text-[10px] ${styles[type] || styles.action}`}>
      {labels[type] || type}
    </span>
  )
}