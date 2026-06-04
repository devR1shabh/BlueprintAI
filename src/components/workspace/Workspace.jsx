import { useEffect, useRef } from 'react'
import Sidebar from '../layout/Sidebar.jsx'
import InputPanel from './InputPanel.jsx'
import ResultsPanel from './ResultsPanel.jsx'
import { useProcessEngine } from '../../hooks/useProcessEngine.js'

export default function Workspace({ rawInput, onInputChange }) {
  const { run, reset, outputs, status, error } = useProcessEngine()
  const mainRef = useRef(null)

  // Scroll-spy: track active section via IntersectionObserver
  useEffect(() => {
    const sections = ['input', 'summary', 'workflow', 'roles', 'risks', 'sop', 'diagram']
    // activeSection state lives in Sidebar via the observer — see Sidebar.jsx
    const observer = new IntersectionObserver(
      () => {}, // Sidebar manages its own highlight; this observer is a no-op placeholder
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [status])

  const handleAnalyze = () => {
    if (!rawInput.trim() || status === 'processing') return
    run(rawInput)
  }

  const handleReset = () => {
    reset()
    onInputChange('')
  }

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar status={status} outputs={outputs} />

      <div ref={mainRef} className="flex-1 ml-52 pt-14 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-8 items-start">

            {/* Input column — sticky on desktop */}
            <div className="xl:sticky xl:top-20">
              <InputPanel
                rawInput={rawInput}
                onInputChange={onInputChange}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
                status={status}
              />
            </div>

            {/* Results column */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-0.5">
                  <h2 className="font-display font-700 text-lg text-white">Blueprint Results</h2>
                  <p className="text-sm text-surface-500">
                    {status === 'idle'       && 'Six structured outputs will appear here.'}
                    {status === 'processing' && 'Analyzing your process…'}
                    {status === 'ready'      && `Analysis complete — ${outputs.steps.length} steps, ${outputs.roles.length} roles, ${outputs.risks.length} risks identified.`}
                    {status === 'error'      && 'Something went wrong. Please try again.'}
                  </p>
                </div>

                {status === 'processing' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-950/60 border border-brand-800/50">
                    <svg className="w-3.5 h-3.5 text-brand-400 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round" opacity="0.3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <span className="text-xs text-brand-300 font-medium">Processing</span>
                  </div>
                )}
                {status === 'ready' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-950/40 border border-green-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400 font-medium">Ready</span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-xs text-red-400 font-medium">Error</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-sm text-red-300">
                  {error}
                </div>
              )}

              <ResultsPanel outputs={outputs} status={status} />
            </div>
          </div>
        </div>

        <footer className="border-t border-surface-800/50 mt-16 px-8 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-surface-700">
            <span>BlueprintAI v0.1 — Alpha</span>
            <span>React · Vite · Tailwind · Mermaid.js</span>
          </div>
        </footer>
      </div>
    </div>
  )
}