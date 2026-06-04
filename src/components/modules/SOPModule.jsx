import { useState } from 'react'
import { ModuleCard } from './ModuleCard.jsx'

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 border border-surface-700/60 text-xs text-surface-300 hover:text-white transition-all duration-150"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

function DownloadButton({ text, title }) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const safe = (title || 'SOP').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    a.href     = url
    a.download = `${safe}_sop.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs text-white transition-all duration-150"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download
    </button>
  )
}

export default function SOPModule({ sop, title, index }) {
  const [expanded, setExpanded] = useState(false)

  if (!sop) return null

  const lines       = sop.split('\n')
  const previewLines = 30
  const isLong      = lines.length > previewLines
  const displayed   = expanded || !isLong ? sop : lines.slice(0, previewLines).join('\n') + '\n\n…'

  return (
    <ModuleCard
      id="sop"
      icon={<Icon />}
      title="SOP Document"
      index={index}
      badge={
        <span className="pill bg-green-950/40 text-green-400 border border-green-800/40 text-[10px]">
          Ready to export
        </span>
      }
      action={
        <div className="flex items-center gap-2">
          <CopyButton text={sop} />
          <DownloadButton text={sop} title={title} />
        </div>
      }
    >
      {/* Document viewer */}
      <div className="rounded-xl bg-surface-950/80 border border-surface-800/60 overflow-hidden">
        {/* Doc chrome bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-800/60 bg-surface-900/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-surface-700" />
          </div>
          <span className="ml-2 text-xs text-surface-600 font-mono">standard_operating_procedure.txt</span>
        </div>

        {/* SOP text */}
        <pre className="p-4 text-[11px] text-surface-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto scrollbar-thin">
          {displayed}
        </pre>
      </div>

      {/* Expand / collapse toggle */}
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-surface-700/40 hover:border-surface-600 text-xs text-surface-500 hover:text-surface-300 transition-all duration-150 bg-surface-800/20 hover:bg-surface-800/40"
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {expanded ? 'Collapse document' : `Expand full document (${lines.length} lines)`}
        </button>
      )}
    </ModuleCard>
  )
}