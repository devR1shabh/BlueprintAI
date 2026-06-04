export default function TopBar({ onBackToLanding, onOpenPromptLab, onOpenWorkspace, view = 'landing' }) {
  const isWorkspaceView = view === 'workspace' || view === 'promptLab'
  const breadcrumbLabel = view === 'promptLab' ? 'Prompt Lab' : 'Workspace'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 border-b border-surface-800/60 backdrop-blur-md bg-surface-950/80">

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={isWorkspaceView ? onBackToLanding : undefined}
          className={`flex items-center gap-2.5 ${isWorkspaceView ? 'hover:opacity-80 transition-opacity cursor-pointer' : 'cursor-default'}`}
        >
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8 L5 4 L8 10 L11 6 L14 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display font-700 text-sm tracking-tight text-white">
            Blueprint<span className="text-brand-400">AI</span>
          </span>
        </button>
      </div>

      {/* Workspace breadcrumb */}
      {isWorkspaceView && (
        <div className="ml-3 flex items-center gap-2 text-surface-500">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 3l5 5-5 5"/>
          </svg>
          <span className="text-xs font-medium text-surface-400">{breadcrumbLabel}</span>
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {view !== 'promptLab' && onOpenPromptLab && (
          <button
            onClick={onOpenPromptLab}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-700/60 text-xs text-surface-400 hover:text-white hover:border-surface-500 hover:bg-surface-800/60 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
            Prompt Lab
          </button>
        )}
        {view === 'promptLab' && onOpenWorkspace && (
          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-700/60 text-xs text-surface-400 hover:text-white hover:border-surface-500 hover:bg-surface-800/60 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Workspace
          </button>
        )}
        {isWorkspaceView && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13L5 8l5-5"/>
            </svg>
            Back
          </button>
        )}
        <span className="pill bg-brand-950 text-brand-300 border border-brand-800/60 text-xs">
          v0.1 · Alpha
        </span>
      </div>
    </header>
  )
}
