import { ModuleCard } from './ModuleCard.jsx'

const ComplexityBar = ({ level }) => {
  const widths  = { Low: 'w-1/3', Medium: 'w-2/3', High: 'w-full' }
  const colors  = { Low: 'bg-green-500', Medium: 'bg-yellow-500', High: 'bg-red-500' }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-surface-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${widths[level] || 'w-1/3'} ${colors[level] || 'bg-green-500'}`} />
      </div>
      <span className={`text-xs font-medium ${colors[level]?.replace('bg-', 'text-') || 'text-green-400'}`}>
        {level}
      </span>
    </div>
  )
}

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

export default function SummaryModule({ summary, index }) {
  if (!summary) return null

  return (
    <ModuleCard
      id="summary"
      icon={<Icon />}
      title="Process Summary"
      index={index}
      badge={
        <span className="pill bg-green-950/40 text-green-400 border border-green-800/40 text-[10px]">
          Complete
        </span>
      }
    >
      {/* Title */}
      <h4 className="font-display font-700 text-base text-white mb-3">{summary.title}</h4>

      {/* Overview prose */}
      <p className="text-sm text-surface-300 leading-relaxed mb-5">{summary.overview}</p>

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-surface-800/40 border border-surface-700/40 p-3">
          <p className="text-[10px] text-surface-600 uppercase tracking-widest mb-1">Objective</p>
          <p className="text-xs text-surface-300 leading-relaxed">{summary.objective}</p>
        </div>
        <div className="rounded-xl bg-surface-800/40 border border-surface-700/40 p-3">
          <p className="text-[10px] text-surface-600 uppercase tracking-widest mb-1">Scope</p>
          <p className="text-xs text-surface-300 leading-relaxed">{summary.scope}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-3 border-t border-surface-800/50">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-surface-600 uppercase tracking-widest">Steps</span>
          <span className="text-lg font-display font-700 text-white">{summary.stepCount}</span>
        </div>
        <div className="w-px h-8 bg-surface-800" />
        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-[10px] text-surface-600 uppercase tracking-widest">Complexity</span>
          <ComplexityBar level={summary.estimatedComplexity} />
        </div>
      </div>
    </ModuleCard>
  )
}