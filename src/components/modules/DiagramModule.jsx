import { useEffect, useRef, useState, useCallback } from 'react'
import { ModuleCard } from './ModuleCard.jsx'

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
)

let mermaidCounter = 0

function useMermaidRenderer(syntax) {
  const containerRef              = useRef(null)
  const [svgHtml, setSvgHtml]     = useState('')
  const [renderError, setRenderError] = useState(null)
  const [rendering, setRendering] = useState(false)

  const render = useCallback(async () => {
    if (!syntax) return

    setRendering(true)
    setRenderError(null)

    try {
      const mermaid = (await import('mermaid')).default

      mermaid.initialize({
        startOnLoad:  false,
        theme:        'dark',
        darkMode:     true,
        themeVariables: {
          background:          '#0d0f1c',
          mainBkg:             '#141728',
          nodeBorder:          '#3c43d0',
          lineColor:           '#4a55e8',
          textColor:           '#a5b8fc',
          fontSize:            '13px',
          edgeLabelBackground: '#1e2235',
        },
        flowchart: {
          htmlLabels:  true,
          curve:       'basis',
          padding:     16,
          nodeSpacing: 50,
          rankSpacing: 60,
        },
        securityLevel: 'loose',
      })

      const id = `mermaid-diagram-${++mermaidCounter}`
      const { svg } = await mermaid.render(id, syntax)
      setSvgHtml(svg)

    } catch (err) {
      console.error('[BlueprintAI] Mermaid render error:', err)
      setRenderError(err.message || 'Failed to render diagram')
    } finally {
      setRendering(false)
    }
  }, [syntax])

  useEffect(() => { render() }, [render])

  return { containerRef, svgHtml, renderError, rendering, retry: render }
}

export default function DiagramModule({ mermaidSyntax, index }) {
  const [showSource, setShowSource] = useState(false)
  const { containerRef, svgHtml, renderError, rendering, retry } = useMermaidRenderer(mermaidSyntax)

  if (!mermaidSyntax) return null

  return (
    <ModuleCard
      id="diagram"
      icon={<Icon />}
      title="Workflow Diagram"
      index={index}
      badge={
        <span className="pill bg-green-950/40 text-green-400 border border-green-800/40 text-[10px]">
          Mermaid
        </span>
      }
      action={
        <button
          onClick={() => setShowSource(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700/60 text-xs text-surface-300 hover:text-white transition-all duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          {showSource ? 'Hide source' : 'View source'}
        </button>
      }
    >
      <div className="rounded-xl border border-surface-700/40 bg-surface-950/60 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-800/60 bg-surface-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
          </div>
          <span className="ml-2 text-xs text-surface-600 font-mono">workflow.mmd</span>
          {rendering && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-brand-400">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" opacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Rendering…
            </div>
          )}
        </div>

        <div
  ref={containerRef}
  className="p-4 flex items-center justify-center overflow-x-auto min-h-[300px]"
  dangerouslySetInnerHTML={
    svgHtml ? { __html: svgHtml } : undefined
  }
/>

        {rendering && (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-surface-600">
            <svg className="w-8 h-8 animate-spin text-brand-600" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10" opacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-xs">Rendering diagram…</span>
          </div>
        )}

        {renderError && !rendering && (
          <div className="p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="text-sm text-surface-300 mb-1">Diagram could not render</p>
              <p className="text-xs text-surface-600 mb-3">{renderError}</p>
              <button
                onClick={retry}
                className="px-4 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700 text-xs text-surface-300 hover:text-white transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {showSource && (
        <div className="mt-3 rounded-xl border border-surface-700/40 bg-surface-950/60 overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-800/60 bg-surface-900/60">
            <span className="text-xs text-surface-600 font-mono">Mermaid source</span>
          </div>
          <pre className="p-4 text-[11px] text-surface-400 font-mono leading-relaxed overflow-x-auto whitespace-pre">
            {mermaidSyntax}
          </pre>
        </div>
      )}
    </ModuleCard>
  )
}