export default function TopBar({ onBackToLanding, view = 'landing' }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 border-b border-surface-800/60 backdrop-blur-md bg-surface-950/80">

      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={view === 'workspace' ? onBackToLanding : undefined}
          className={`flex items-center gap-2.5 ${view === 'workspace' ? 'hover:opacity-80 transition-opacity cursor-pointer' : 'cursor-default'}`}
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
      {view === 'workspace' && (
        <div className="ml-3 flex items-center gap-2 text-surface-500">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 3l5 5-5 5"/>
          </svg>
          <span className="text-xs font-medium text-surface-400">Workspace</span>
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {view === 'workspace' && (
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