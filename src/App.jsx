import { useState } from 'react'
import TopBar from './components/layout/TopBar.jsx'
import Workspace from './components/workspace/Workspace.jsx'
import PromptLab from './components/prompt-lab/PromptLab.jsx'

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    label: 'Process Summary',
    description: 'Distills complex input into a concise, structured overview.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    label: 'Workflow Steps',
    description: 'Extracts and sequences every step with actors and actions.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: 'Roles Extraction',
    description: 'Identifies human, system, and external roles in the process.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    label: 'Risk Analysis',
    description: 'Flags bottlenecks and compliance risks with severity ratings.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    label: 'SOP Generation',
    description: 'Produces a complete, export-ready Standard Operating Procedure.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    ),
    label: 'Workflow Diagram',
    description: 'Auto-generates a Mermaid flowchart you can embed anywhere.',
  },
]

// ─── Landing sub-components ───────────────────────────────────────────────────

function HeroSection({ onGetStarted }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full pointer-events-none animate-pulse-slow"
        style={{ background: 'radial-gradient(circle, rgba(97,117,244,0.12) 0%, transparent 65%)' }}
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="animate-fade-in pill bg-brand-950/80 text-brand-300 border border-brand-700/40 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Business Process Intelligence
        </div>
        <h1 className="animate-fade-up delay-100 font-display font-800 text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-white">
          Turn process chaos<br />
          <span className="text-brand-400">into clarity.</span>
        </h1>
        <p className="animate-fade-up delay-200 text-surface-300 text-lg sm:text-xl leading-relaxed max-w-xl">
          Describe any business process in plain text. BlueprintAI extracts workflows,
          identifies roles, surfaces risks, and generates a complete SOP — instantly.
        </p>
        <div className="animate-fade-up delay-300 flex items-center gap-3 mt-2">
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-brand-900/40 hover:shadow-brand-800/50 hover:-translate-y-0.5"
          >
            Start building
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
          <button
            onClick={onGetStarted}
            className="px-6 py-3 rounded-xl border border-surface-700 hover:border-surface-500 text-surface-300 hover:text-white font-medium text-sm transition-all duration-200"
          >
            See example
          </button>
        </div>
        <div className="animate-fade-up delay-400 flex items-center gap-8 mt-6 text-sm text-surface-500">
          {['6 output modules', 'No backend required', 'Mermaid diagrams'].map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-brand-600" />
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-fade-in delay-600">
        <span className="text-xs text-surface-600 tracking-widest uppercase">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-surface-600 to-transparent" />
      </div>
    </section>
  )
}

function FeaturesSection({ onGetStarted }) {
  return (
    <section className="relative px-6 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 flex flex-col gap-2">
          <span className="text-xs font-medium tracking-widest uppercase text-brand-500">What it produces</span>
          <h2 className="font-display font-700 text-3xl text-white">Six outputs from one input.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className="group border-gradient rounded-2xl p-5 bg-surface-900/60 backdrop-blur-sm hover:bg-surface-900 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 w-9 h-9 rounded-xl bg-brand-950 border border-brand-800/50 flex items-center justify-center text-brand-400 shrink-0 group-hover:bg-brand-900/80 transition-colors">
                  {f.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-display font-600 text-sm text-white">{f.label}</span>
                  <span className="text-sm text-surface-400 leading-relaxed">{f.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA at bottom of features */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-brand-900/40 hover:-translate-y-0.5"
          >
            Open workspace
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

function FooterStrip() {
  return (
    <footer className="border-t border-surface-800/50 px-6 py-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-surface-600">
        <span>BlueprintAI v0.1 — Alpha</span>
        <span>Built with React · Vite · Tailwind · Mermaid.js</span>
      </div>
    </footer>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'workspace' | 'promptLab'
  const [rawInput, setRawInput] = useState('')  // lifted so input survives view transitions

  if (view === 'workspace') {
    return (
      <>
        <TopBar
          view="workspace"
          onBackToLanding={() => setView('landing')}
          onOpenPromptLab={() => setView('promptLab')}
        />
        <Workspace rawInput={rawInput} onInputChange={setRawInput} />
      </>
    )
  }

  if (view === 'promptLab') {
    return (
      <>
        <TopBar
          view="promptLab"
          onBackToLanding={() => setView('landing')}
          onOpenWorkspace={() => setView('workspace')}
        />
        <PromptLab />
      </>
    )
  }

  return (
    <div className="grain min-h-screen bg-surface-950">
      <TopBar
        view="landing"
        onOpenPromptLab={() => setView('promptLab')}
      />
      <main>
        <HeroSection onGetStarted={() => setView('workspace')} />
        <FeaturesSection onGetStarted={() => setView('workspace')} />
      </main>
      <FooterStrip />
    </div>
  )
}
