import { ModuleCard, CountBadge, StepTypeBadge } from './ModuleCard.jsx'

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const typeColors = {
  trigger:  { ring: 'border-purple-600/60', bg: 'bg-purple-950/40',  num: 'text-purple-400' },
  action:   { ring: 'border-brand-700/50',  bg: 'bg-brand-950/30',   num: 'text-brand-400'  },
  decision: { ring: 'border-yellow-600/50', bg: 'bg-yellow-950/30',  num: 'text-yellow-400' },
  end:      { ring: 'border-green-700/50',  bg: 'bg-green-950/30',   num: 'text-green-400'  },
}

function StepItem({ step, isLast }) {
  const colors = typeColors[step.type] || typeColors.action

  return (
    <div className="flex gap-3">
      {/* Left: number + connector line */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-8 h-8 rounded-lg border ${colors.ring} ${colors.bg} flex items-center justify-center shrink-0`}>
          <span className={`text-xs font-mono font-700 ${colors.num}`}>{step.stepNumber}</span>
        </div>
        {!isLast && <div className="w-px flex-1 mt-1 bg-gradient-to-b from-surface-700/60 to-transparent min-h-[20px]" />}
      </div>

      {/* Right: content */}
      <div className={`flex-1 pb-${isLast ? '0' : '4'}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-white leading-snug">{step.title}</p>
          <StepTypeBadge type={step.type} />
        </div>
        <p className="text-xs text-surface-400 leading-relaxed mb-2">{step.description}</p>
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-600">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-[11px] text-surface-500">{step.actor}</span>
        </div>
        {!isLast && <div className="mt-3" />}
      </div>
    </div>
  )
}

export default function WorkflowModule({ steps, index }) {
  if (!steps || steps.length === 0) return null

  return (
    <ModuleCard
      id="workflow"
      icon={<Icon />}
      title="Workflow Steps"
      index={index}
      badge={<CountBadge count={steps.length} label="steps" />}
    >
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <StepItem key={step.id} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </ModuleCard>
  )
}