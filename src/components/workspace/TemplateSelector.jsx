import { useState } from 'react'
import { WORKFLOW_TEMPLATES } from '../../data/workflowTemplates.js'

const CATEGORY_COLORS = {
  HR:          'bg-brand-950/60 text-brand-300 border-brand-800/50',
  Finance:     'bg-green-950/60 text-green-300 border-green-800/50',
  Procurement: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/50',
  Support:     'bg-purple-950/60 text-purple-300 border-purple-800/50',
}

export default function TemplateSelector({ onSelect, disabled }) {
  const [activeId, setActiveId] = useState(null)

  const handleSelect = (template) => {
    if (disabled) return
    setActiveId(template.id)
    onSelect(template.content)
  }

  return (
    <div className="mb-4">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span className="text-xs font-medium text-surface-500 tracking-wide">Quick Start Templates</span>
      </div>

      {/* Template chips */}
      <div className="flex flex-wrap gap-2">
        {WORKFLOW_TEMPLATES.map((template) => {
          const isActive = activeId === template.id
          const catColor = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.HR

          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              disabled={disabled}
              title={template.description}
              className={`
                group flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium
                transition-all duration-150
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}
                ${isActive
                  ? 'bg-brand-600/20 border-brand-500/60 text-white'
                  : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:border-surface-500 hover:text-surface-200 hover:bg-surface-800'
                }
              `}
            >
              {/* Category dot */}
              <span className={`pill border text-[9px] px-1.5 py-0.5 ${catColor}`}>
                {template.category}
              </span>

              {template.name}

              {/* Active checkmark */}
              {isActive && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}