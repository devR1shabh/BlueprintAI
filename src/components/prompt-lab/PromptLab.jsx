import { useMemo, useState } from 'react'
import { ModuleCard } from '../modules/ModuleCard.jsx'
import { usePromptLabStorage } from '../../hooks/usePromptLabStorage.js'

const STARTER_PROMPT = `Act as an enterprise workflow analyst.

Analyze this process for clarity, missing roles, compliance risks, and automation opportunities.

Process:
Vendor submits documents. Finance verifies bank details. Compliance verifies legal documents. Procurement approves the vendor. Vendor is activated.

Return:
1. Process summary
2. Workflow steps
3. Roles
4. Risks
5. Improvement suggestions`

const ratingLabels = ['Poor', 'Weak', 'Useful', 'Strong', 'Excellent']

function EditorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  )
}

function OutputIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5"/>
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
      <path d="M12 7v5l3 2"/>
    </svg>
  )
}

function getPromptSignals(prompt) {
  const lower = prompt.toLowerCase()

  return {
    hasRole: /act as|you are|role:/.test(lower),
    hasContext: /context|process|background|scenario/.test(lower),
    hasFormat: /return|format|output|structure|json|table/.test(lower),
    hasConstraints: /must|do not|only|avoid|constraint|requirement/.test(lower),
  }
}

function generatePromptOutput(prompt) {
  const signals = getPromptSignals(prompt)
  const strengths = []
  const improvements = []

  if (signals.hasRole) strengths.push('Clear role framing is present.')
  else improvements.push('Add an explicit role such as "Act as an enterprise workflow analyst."')

  if (signals.hasContext) strengths.push('Business context is included.')
  else improvements.push('Add process context so the model has enough domain detail.')

  if (signals.hasFormat) strengths.push('Expected output structure is defined.')
  else improvements.push('Specify the output sections or format before running the prompt.')

  if (signals.hasConstraints) strengths.push('Constraints are stated.')
  else improvements.push('Add constraints for scope, tone, assumptions, or exclusions.')

  const qualityScore = Object.values(signals).filter(Boolean).length
  const qualityLabel = ['Needs structure', 'Early draft', 'Usable', 'Strong', 'Production ready'][qualityScore]

  return `Prompt Lab Output

Quality: ${qualityLabel}

Detected intent:
${prompt.trim().slice(0, 220)}${prompt.trim().length > 220 ? '...' : ''}

Strengths:
${strengths.length ? strengths.map(item => `- ${item}`).join('\n') : '- The prompt has a clear starting point for experimentation.'}

Improvement opportunities:
${improvements.length ? improvements.map(item => `- ${item}`).join('\n') : '- The prompt already covers role, context, structure, and constraints.'}

Suggested next version:
Act as an enterprise workflow analyst. Use the provided process context to produce a concise, structured response with sections for summary, workflow steps, roles, risks, and improvement suggestions. State assumptions briefly and avoid adding unsupported systems or integrations.`
}

function formatTimestamp(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function RatingPicker({ rating, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map(value => {
        const active = rating === value
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`w-9 h-9 rounded-lg border text-xs font-semibold transition-all duration-150 ${
              active
                ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-900/30'
                : 'bg-surface-800/60 text-surface-500 border-surface-700/60 hover:border-surface-500 hover:text-surface-200'
            }`}
            title={ratingLabels[value - 1]}
          >
            {value}
          </button>
        )
      })}
      <span className="text-xs text-surface-600">
        {rating ? ratingLabels[rating - 1] : 'Not rated'}
      </span>
    </div>
  )
}

export default function PromptLab() {
  const { experiments, saveExperiment, deleteExperiment } = usePromptLabStorage()
  const [prompt, setPrompt] = useState(STARTER_PROMPT)
  const [output, setOutput] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')

  const promptStats = useMemo(() => {
    const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0
    return { chars: prompt.length, words }
  }, [prompt])

  const canRun = prompt.trim().length > 10 && !isRunning
  const canSave = prompt.trim().length > 0 && output.trim().length > 0

  const handleRun = async () => {
    if (!canRun) return
    setIsRunning(true)
    setSaveStatus('')
    await new Promise(resolve => setTimeout(resolve, 450))
    setOutput(generatePromptOutput(prompt))
    setIsRunning(false)
  }

  const handleSave = () => {
    if (!canSave) return
    const experiment = saveExperiment({
      prompt,
      output,
      notes,
      rating,
    })
    setSelectedId(experiment.id)
    setSaveStatus('Experiment saved')
  }

  const handleReload = (experiment) => {
    setPrompt(experiment.prompt)
    setOutput(experiment.output)
    setNotes(experiment.notes)
    setRating(experiment.rating)
    setSelectedId(experiment.id)
    setSaveStatus('Experiment loaded')
  }

  const handleDelete = (id) => {
    deleteExperiment(id)
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="grain min-h-screen bg-surface-950 pt-14">
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col gap-2">
          <span className="text-xs font-medium tracking-widest uppercase text-brand-500">Prompt Engineering Lab</span>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-700 text-3xl text-white">Prompt Lab</h1>
              <p className="mt-1 text-sm text-surface-500">
                Test prompt versions, capture observations, and keep a local experiment history.
              </p>
            </div>
            <span className="pill bg-brand-950/80 text-brand-300 border border-brand-800/50 text-[10px]">
              {experiments.length} saved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-6 items-start">
          <div className="flex flex-col gap-5">
            <ModuleCard
              id="prompt-editor"
              icon={<EditorIcon />}
              title="Prompt Editor"
              badge={<span className="pill bg-surface-800/70 text-surface-400 border border-surface-700/60 text-[10px]">Editable</span>}
              index={0}
            >
              <div className="rounded-xl border border-surface-700/40 bg-surface-950/60 overflow-hidden focus-within:border-brand-600/60 transition-colors">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-800/60 bg-surface-900/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
                    <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
                  </div>
                  <span className="ml-2 text-xs text-surface-600 font-mono">prompt.txt</span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={13}
                  className="w-full bg-transparent px-5 py-4 text-sm text-surface-200 placeholder:text-surface-700 resize-none outline-none leading-relaxed font-sans"
                  placeholder="Write an enterprise workflow prompt..."
                  spellCheck={false}
                />
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-surface-800/60 bg-surface-900/60">
                  <div className="flex items-center gap-4 text-xs text-surface-600 font-mono">
                    <span>{promptStats.chars.toLocaleString()} chars</span>
                    <span className="text-surface-800">-</span>
                    <span>{promptStats.words.toLocaleString()} words</span>
                  </div>
                  {prompt.length > 0 && prompt.length < 10 && (
                    <span className="text-xs text-amber-500/80">Add more prompt detail</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleRun}
                  disabled={!canRun}
                  className={`group flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    canRun
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/40 hover:shadow-brand-800/50 hover:-translate-y-0.5'
                      : 'bg-surface-800 text-surface-600 cursor-not-allowed'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" opacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Running
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Run Prompt
                    </>
                  )}
                </button>
                <button
                  onClick={() => setPrompt(STARTER_PROMPT)}
                  className="px-4 py-3 rounded-xl border border-surface-700 hover:border-surface-500 text-surface-300 hover:text-white font-medium text-sm transition-all duration-200"
                >
                  Reset Starter
                </button>
              </div>
            </ModuleCard>

            <ModuleCard
              id="prompt-output"
              icon={<OutputIcon />}
              title="Output Viewer"
              badge={<span className="pill bg-green-950/40 text-green-400 border border-green-800/40 text-[10px]">Local run</span>}
              index={1}
            >
              <div className="rounded-xl border border-surface-700/40 bg-surface-950/60 overflow-hidden min-h-64">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-800/60 bg-surface-900/60">
                  <span className="text-xs text-surface-600 font-mono">output.md</span>
                  {output && (
                    <span className="ml-auto text-xs text-surface-600 font-mono">
                      {output.length.toLocaleString()} chars
                    </span>
                  )}
                </div>
                {output ? (
                  <pre className="p-5 text-sm text-surface-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {output}
                  </pre>
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center gap-3 text-center text-surface-600">
                    <div className="w-12 h-12 rounded-xl bg-brand-950/50 border border-brand-800/40 flex items-center justify-center text-brand-400">
                      <OutputIcon />
                    </div>
                    <p className="text-sm">Run a prompt to generate an output preview.</p>
                  </div>
                )}
              </div>
            </ModuleCard>
          </div>

          <div className="xl:sticky xl:top-20 flex flex-col gap-5">
            <ModuleCard
              id="prompt-notes"
              icon={<EditorIcon />}
              title="Experiment Notes"
              badge={<span className="pill bg-purple-950/50 text-purple-300 border border-purple-800/50 text-[10px]">Rating</span>}
              index={2}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-2">Observations</label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-surface-700/50 bg-surface-950/60 px-4 py-3 text-sm text-surface-200 placeholder:text-surface-700 resize-none outline-none leading-relaxed focus:border-brand-600/60 transition-colors"
                    placeholder="Adding role instructions improved output quality."
                  />
                </div>

                <div>
                  <span className="block text-xs font-medium text-surface-500 mb-2">Quality rating</span>
                  <RatingPicker rating={rating} onChange={setRating} />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      canSave
                        ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/40 hover:-translate-y-0.5'
                        : 'bg-surface-800 text-surface-600 cursor-not-allowed'
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Save Experiment
                  </button>
                  {saveStatus && (
                    <span className="text-xs text-green-400">{saveStatus}</span>
                  )}
                </div>
              </div>
            </ModuleCard>

            <ModuleCard
              id="prompt-history"
              icon={<HistoryIcon />}
              title="Experiment History"
              badge={<span className="pill bg-brand-950/80 text-brand-300 border border-brand-800/50 text-[10px]">{experiments.length}</span>}
              index={3}
            >
              {experiments.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-center text-surface-600">
                  <div className="w-12 h-12 rounded-xl bg-surface-800/50 border border-surface-700/50 flex items-center justify-center">
                    <HistoryIcon />
                  </div>
                  <p className="text-sm">Saved experiments will appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
                  {experiments.map(experiment => {
                    const active = selectedId === experiment.id
                    return (
                      <div
                        key={experiment.id}
                        className={`rounded-xl border p-4 transition-colors ${
                          active
                            ? 'border-brand-700/70 bg-brand-950/30'
                            : 'border-surface-700/40 bg-surface-950/50 hover:border-surface-600/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-surface-200 line-clamp-2">
                              {experiment.prompt}
                            </p>
                            <div className="mt-2 flex items-center gap-2 flex-wrap text-[11px] text-surface-600">
                              <span>{formatTimestamp(experiment.timestamp)}</span>
                              <span className="text-surface-800">-</span>
                              <span>{experiment.promptLength} in</span>
                              <span>{experiment.outputLength} out</span>
                              <span className="pill bg-surface-800/70 text-surface-400 border border-surface-700/60 text-[10px] px-2 py-0.5">
                                {experiment.rating || 0}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        {experiment.notes && (
                          <p className="mt-3 text-xs text-surface-500 leading-relaxed line-clamp-2">
                            {experiment.notes}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleReload(experiment)}
                            className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700/60 text-xs text-surface-300 hover:text-white transition-colors"
                          >
                            Reload
                          </button>
                          <button
                            onClick={() => handleDelete(experiment.id)}
                            className="px-3 py-1.5 rounded-lg border border-red-900/50 text-xs text-red-400 hover:bg-red-950/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ModuleCard>
          </div>
        </div>
      </main>

      <footer className="border-t border-surface-800/50 mt-10 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-surface-700">
          <span>BlueprintAI v0.1 - Prompt Lab</span>
          <span>LocalStorage only - no backend</span>
        </div>
      </footer>
    </div>
  )
}
