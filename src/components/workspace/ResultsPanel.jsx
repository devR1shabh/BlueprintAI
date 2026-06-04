import ExecutiveOverview from '../modules/ExecutiveOverview.jsx'
import SummaryModule     from '../modules/SummaryModule.jsx'
import WorkflowModule    from '../modules/WorkflowModule.jsx'
import RolesModule       from '../modules/RolesModule.jsx'
import RisksModule       from '../modules/RisksModule.jsx'
import SOPModule         from '../modules/SOPModule.jsx'
import DiagramModule     from '../modules/DiagramModule.jsx'

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyStateHero() {
  const modules = [
    'Process Summary', 'Workflow Steps', 'Roles & Actors',
    'Risk Analysis', 'SOP Document', 'Workflow Diagram',
  ]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-950 border border-brand-800/50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-600 border-2 border-surface-900" />
      </div>
      <h3 className="font-display font-700 text-base text-surface-300 mb-1.5">Ready to analyze</h3>
      <p className="text-sm text-surface-600 max-w-xs leading-relaxed">
        Enter your business process and click{' '}
        <strong className="text-surface-500 font-medium">Analyze Blueprint</strong>{' '}
        to generate all outputs.
      </p>
      <div className="mt-6 flex items-center gap-1.5 flex-wrap justify-center">
        {modules.map(m => (
          <span key={m} className="pill bg-surface-900 text-surface-600 border border-surface-800/60 text-[10px]">
            {m}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Processing skeleton ──────────────────────────────────────────────────────

function ProcessingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border border-surface-800/40 bg-surface-900/30 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-surface-800/60 animate-pulse" />
            <div className="h-3 w-32 rounded-full bg-surface-800/60 animate-pulse" />
            <div className="ml-auto h-3 w-16 rounded-full bg-surface-800/40 animate-pulse" />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="h-2.5 rounded-full bg-surface-800/50 animate-pulse w-full"  style={{ animationDelay: `${i * 100}ms` }} />
            <div className="h-2.5 rounded-full bg-surface-800/40 animate-pulse w-4/5"  style={{ animationDelay: `${i * 150}ms` }} />
            <div className="h-2.5 rounded-full bg-surface-800/30 animate-pulse w-3/5"  style={{ animationDelay: `${i * 200}ms` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ResultsPanel ─────────────────────────────────────────────────────────────

export default function ResultsPanel({ outputs, status }) {
  if (status === 'idle')       return <EmptyStateHero />
  if (status === 'processing') return <ProcessingSkeleton />

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 className="font-display font-700 text-base text-surface-300 mb-1.5">Analysis failed</h3>
        <p className="text-sm text-surface-600 max-w-xs">Check the error message above and try again with a more detailed process description.</p>
      </div>
    )
  }

  // status === 'ready'
  const { summary, steps, roles, risks, sop, mermaidSyntax } = outputs

  return (
    <div className="flex flex-col gap-5">
      <ExecutiveOverview outputs={outputs}                            />
      <SummaryModule     summary={summary}             index={0}     />
      <WorkflowModule    steps={steps}                 index={1}     />
      <RolesModule       roles={roles}                 index={2}     />
      <RisksModule       risks={risks}                 index={3}     />
      <SOPModule         sop={sop} title={summary?.title} index={4} />
      <DiagramModule     mermaidSyntax={mermaidSyntax} index={5}     />
    </div>
  )
}