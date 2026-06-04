import { useState, useEffect, useRef } from 'react'
import Sidebar from '../layout/Sidebar.jsx'
import InputPanel from './InputPanel.jsx'
import ResultsPanel from './ResultsPanel.jsx'

export default function Workspace({ initialInput = '' }) {
  const [rawInput, setRawInput] = useState(initialInput)
  const [status, setStatus] = useState('idle') // 'idle' | 'processing' | 'ready' | 'error'
  const [outputs, setOutputs] = useState(null)
  const [activeSection, setActiveSection] = useState('input')

  // Track active section based on scroll position
  const mainRef = useRef(null)

  useEffect(() => {
    const sections = ['input', 'summary', 'workflow', 'roles', 'risks', 'sop', 'diagram']

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [status]) // re-observe when status changes (new sections mount)

  const handleAnalyze = () => {
    if (!rawInput.trim() || status === 'processing') return

    // Engine logic will be wired in Step 4.
    // For now: simulate a processing state → ready transition.
    setStatus('processing')

    setTimeout(() => {
      setStatus('ready')
      setOutputs({ _placeholder: true })
    }, 1800)
  }

  return (
    <div className="flex min-h-screen bg-surface-950">

      {/* Fixed sidebar */}
      <Sidebar status={status} activeSection={activeSection} />

      {/* Main content — offset by sidebar width */}
      <div ref={mainRef} className="flex-1 ml-52 pt-14 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Two-column grid: input (left) + results (right) */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-8 items-start">

            {/* Left column — Input */}
            <div className="xl:sticky xl:top-20 flex flex-col gap-0">
              <InputPanel
                rawInput={rawInput}
                onInputChange={setRawInput}
                onAnalyze={handleAnalyze}
                status={status}
              />
            </div>

            {/* Right column — Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-0.5">
                  <h2 className="font-display font-700 text-lg text-white">Blueprint Results</h2>
                  <p className="text-sm text-surface-500">
                    {status === 'idle' && 'Six structured outputs will appear here.'}
                    {status === 'processing' && 'Analyzing your process…'}
                    {status === 'ready' && 'Analysis complete — all modules ready.'}
                    {status === 'error' && 'Something went wrong. Please try again.'}
                  </p>
                </div>

                {/* Status indicator */}
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
              </div>

              <ResultsPanel outputs={outputs} status={status} />
            </div>
          </div>
        </div>

        {/* Footer */}
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