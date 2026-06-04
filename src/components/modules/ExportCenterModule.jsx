import { useMemo, useState } from 'react'
import { ModuleCard } from './ModuleCard.jsx'
import {
  copyToClipboard,
  createSafeFilename,
  downloadTextFile,
  stringifyWorkflowExport,
} from '../../utils/exportUtils.js'

const Icon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

function ExportActionButton({ children, icon, onClick, variant = 'secondary' }) {
  const styles = variant === 'primary'
    ? 'bg-brand-600 hover:bg-brand-500 text-white border border-brand-500/60'
    : 'bg-surface-800 hover:bg-surface-700 border border-surface-700/60 text-surface-300 hover:text-white'

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 ${styles}`}
    >
      {icon}
      {children}
    </button>
  )
}

function ExportTile({ id, title, description, filename, sizeLabel, onCopy, onDownload, copied }) {
  return (
    <div className="rounded-xl border border-surface-700/40 bg-surface-950/60 overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display font-700 text-sm text-white">{title}</h4>
            <span className="pill bg-surface-800/70 text-surface-500 border border-surface-700/60 text-[10px] px-2 py-0.5">
              {sizeLabel}
            </span>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">{description}</p>
          <p className="mt-2 text-[11px] text-surface-700 font-mono">{filename}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-800/60 bg-surface-900/50">
        <ExportActionButton onClick={() => onCopy(id)} icon={copied ? <CheckIcon /> : <CopyIcon />}>
          <span className={copied ? 'text-green-400' : ''}>{copied ? 'Copied' : 'Copy'}</span>
        </ExportActionButton>
        <ExportActionButton onClick={() => onDownload(id)} icon={<DownloadIcon />} variant="primary">
          Download
        </ExportActionButton>
      </div>
    </div>
  )
}

function formatBytes(text) {
  const bytes = new Blob([text]).size
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function ExportCenterModule({ outputs, index }) {
  const [copiedId, setCopiedId] = useState(null)
  const baseName = createSafeFilename(outputs.summary?.title, 'workflow-blueprint')

  const exports = useMemo(() => {
    const sop = outputs.sop || ''
    const mermaid = outputs.mermaidSyntax || ''
    const json = stringifyWorkflowExport(outputs)

    return {
      sop: {
        title: 'SOP Document',
        description: 'Copy or download the generated Standard Operating Procedure.',
        content: sop,
        filename: `${baseName}-sop.txt`,
        mimeType: 'text/plain;charset=utf-8',
      },
      mermaid: {
        title: 'Mermaid Diagram',
        description: 'Copy or download the workflow diagram source syntax.',
        content: mermaid,
        filename: `${baseName}-workflow.mmd`,
        mimeType: 'text/plain;charset=utf-8',
      },
      json: {
        title: 'Workflow JSON',
        description: 'Export the complete structured workflow artifact.',
        content: json,
        filename: `${baseName}-workflow.json`,
        mimeType: 'application/json;charset=utf-8',
      },
    }
  }, [baseName, outputs])

  const handleCopy = async (id) => {
    await copyToClipboard(exports[id].content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(current => current === id ? null : current), 2000)
  }

  const handleDownload = (id) => {
    const item = exports[id]
    downloadTextFile({
      content: item.content,
      filename: item.filename,
      mimeType: item.mimeType,
    })
  }

  return (
    <ModuleCard
      id="export-center"
      icon={<Icon />}
      title="Export Center"
      index={index}
      badge={
        <span className="pill bg-brand-950/80 text-brand-300 border border-brand-800/50 text-[10px]">
          3 artifacts
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(exports).map(([id, item]) => (
          <ExportTile
            key={id}
            id={id}
            title={item.title}
            description={item.description}
            filename={item.filename}
            sizeLabel={formatBytes(item.content)}
            copied={copiedId === id}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </ModuleCard>
  )
}
