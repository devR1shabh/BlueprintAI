const PLACEHOLDER = `Describe your business process here…

Example:
A customer submits a support ticket via the web portal. The system auto-assigns it to the first available agent based on skill tags. The agent reviews the ticket, requests clarification if needed, then resolves or escalates to Tier 2. Tier 2 runs diagnostics, applies a fix, and notifies the customer. The customer confirms resolution, closing the ticket. A satisfaction survey is sent automatically 24 hours later.`

export default function InputPanel({ rawInput, onInputChange, onAnalyze, status }) {
  const isProcessing = status === 'processing'
  const canAnalyze = rawInput.trim().length > 20 && !isProcessing
  const charCount = rawInput.length
  const wordCount = rawInput.trim() ? rawInput.trim().split(/\s+/).length : 0

  return (
    <section id="input" className="scroll-mt-20">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display font-700 text-lg text-white">Business Process Input</h2>
          <p className="text-sm text-surface-500">
            Describe your process in plain language — structured or unstructured.
          </p>
        </div>
      </div>

      {/* Textarea card */}
      <div className="relative rounded-2xl border border-surface-700/60 bg-surface-900/80 overflow-hidden focus-within:border-brand-600/60 transition-colors duration-200">

        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-800/60 bg-surface-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
          </div>
          <span className="ml-2 text-xs text-surface-600 font-mono">process-input.txt</span>
        </div>

        {/* Textarea */}
        <textarea
          value={rawInput}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={PLACEHOLDER}
          disabled={isProcessing}
          rows={14}
          className="w-full bg-transparent px-5 py-4 text-sm text-surface-200 placeholder:text-surface-700 resize-none outline-none leading-relaxed font-sans disabled:opacity-50 disabled:cursor-not-allowed"
          spellCheck={false}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-surface-800/60 bg-surface-900/60">
          <div className="flex items-center gap-4 text-xs text-surface-600 font-mono">
            <span>{charCount.toLocaleString()} chars</span>
            <span className="text-surface-800">·</span>
            <span>{wordCount.toLocaleString()} words</span>
          </div>

          {rawInput.length > 0 && rawInput.length < 20 && (
            <span className="text-xs text-amber-500/80">Add more detail to analyze</span>
          )}
        </div>
      </div>

      {/* Analyze button */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className={`
            group relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm
            transition-all duration-200
            ${canAnalyze
              ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/40 hover:shadow-brand-800/50 hover:-translate-y-0.5'
              : 'bg-surface-800 text-surface-600 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              {/* Spinner */}
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" opacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Analyzing…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Analyze Blueprint
              {canAnalyze && (
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              )}
            </>
          )}
        </button>

        {status === 'ready' && (
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Blueprint generated
          </span>
        )}

        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Analysis failed — try again
          </span>
        )}
      </div>
    </section>
  )
}