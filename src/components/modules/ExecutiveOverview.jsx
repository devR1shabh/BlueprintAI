/**
 * ExecutiveOverview.jsx
 * Top-level summary section above all output modules.
 * Derives all scores from existing outputs — zero new state or engine calls.
 *
 * Contains:
 *   - Workflow Health Score
 *   - Risk Score
 *   - Key stats (steps, roles, risks)
 *   - QuickNavBar for one-click section scrolling
 */

// ─── Score computation (pure functions) ───────────────────────────────────────

/**
 * Workflow Health: rewards step count, trigger/end bookends, role coverage.
 * Returns 0–100.
 */
function computeHealthScore(steps, roles) {
  if (!steps || steps.length === 0) return 0

  let score = 50 // baseline

  // Step count reward (sweet spot 5–12 steps)
  if (steps.length >= 5)  score += 10
  if (steps.length >= 8)  score += 5
  if (steps.length > 15)  score -= 10  // too many steps = complexity risk

  // Has a trigger node (well-defined start)
  if (steps.some(s => s.type === 'trigger')) score += 10

  // Has an end node (well-defined finish)
  if (steps.some(s => s.type === 'end')) score += 10

  // Role coverage: at least one role per 3 steps
  const coveredSteps = steps.filter(s => s.actor && s.actor !== 'Process Actor').length
  const coverageRatio = coveredSteps / steps.length
  score += Math.round(coverageRatio * 15)

  // Has at least one human role
  if (roles && roles.some(r => r.type === 'human')) score += 5

  return Math.min(100, Math.max(0, score))
}

/**
 * Risk Score: inverse of severity distribution.
 * 100 = no risks, decreases with high/critical risks.
 * Returns 0–100.
 */
function computeRiskScore(risks) {
  if (!risks || risks.length === 0) return 95

  const weights = { critical: 25, high: 15, medium: 7, low: 2 }
  const totalDeduction = risks.reduce((acc, r) => acc + (weights[r.severity] || 2), 0)

  return Math.min(100, Math.max(0, 100 - totalDeduction))
}

function scoreColor(score) {
  if (score >= 75) return { text: 'text-green-400',  ring: 'stroke-green-500',  bg: 'bg-green-950/40 border-green-800/40'  }
  if (score >= 50) return { text: 'text-yellow-400', ring: 'stroke-yellow-500', bg: 'bg-yellow-950/40 border-yellow-800/40' }
  return           { text: 'text-red-400',    ring: 'stroke-red-500',    bg: 'bg-red-950/40 border-red-800/40'    }
}

function scoreLabel(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 35) return 'Needs Work'
  return 'At Risk'
}

// ─── Circular score gauge ─────────────────────────────────────────────────────

function ScoreGauge({ score, label, sublabel }) {
  const colors    = scoreColor(score)
  const radius    = 28
  const circ      = 2 * Math.PI * radius
  const fillArc   = (score / 100) * circ
  const dashOffset = circ - fillArc

  return (
    <div className={`flex items-center gap-4 rounded-xl border p-4 ${colors.bg}`}>
      {/* SVG ring */}
      <div className="relative w-16 h-16 shrink-0">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="36" cy="36" r={radius} fill="none" stroke="currentColor" strokeWidth="5"
            className="text-surface-800" />
          {/* Fill */}
          <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={colors.ring}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-display font-700 ${colors.text}`}>{score}</span>
        </div>
      </div>

      {/* Labels */}
      <div>
        <p className="text-xs text-surface-500 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`font-display font-700 text-base ${colors.text}`}>{scoreLabel(score)}</p>
        <p className="text-xs text-surface-600 mt-0.5">{sublabel}</p>
      </div>
    </div>
  )
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ value, label, icon }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl border border-surface-700/40 bg-surface-800/30 min-w-[72px]">
      <span className="text-surface-500">{icon}</span>
      <span className="font-display font-700 text-xl text-white leading-none">{value}</span>
      <span className="text-[10px] text-surface-600 uppercase tracking-wide">{label}</span>
    </div>
  )
}

// ─── Quick Nav Bar ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'summary',         label: 'Summary'   },
  { id: 'workflow',        label: 'Workflow'  },
  { id: 'roles',           label: 'Roles'     },
  { id: 'risks',           label: 'Risks'     },
  { id: 'sop',             label: 'SOP'       },
  { id: 'diagram',         label: 'Diagram'   },
]

function QuickNavBar() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex items-center gap-1 flex-wrap pt-4 border-t border-surface-800/50 mt-4">
      <span className="text-[10px] text-surface-700 uppercase tracking-widest mr-2 shrink-0">Jump to</span>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className="px-3 py-1.5 rounded-lg text-xs text-surface-400 hover:text-white hover:bg-surface-700/60 border border-transparent hover:border-surface-600/50 transition-all duration-150 font-medium"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ─── ExecutiveOverview ────────────────────────────────────────────────────────

export default function ExecutiveOverview({ outputs }) {
  const { steps = [], roles = [], risks = [], summary } = outputs

  const healthScore = computeHealthScore(steps, roles)
  const riskScore   = computeRiskScore(risks)

  const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical').length

  return (
    <div className="rounded-2xl border border-surface-700/50 bg-surface-900/70 overflow-hidden animate-fade-up mb-1">

      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-950 border border-brand-800/50 flex items-center justify-center text-brand-400 shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <h3 className="font-display font-700 text-sm text-white leading-tight">Executive Overview</h3>
          </div>
        </div>
        <span className="pill bg-brand-950/80 text-brand-300 border border-brand-800/50 text-[10px]">
          {summary?.title || 'Blueprint Analysis'}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5">

        {/* Score gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <ScoreGauge
            score={healthScore}
            label="Workflow Health"
            sublabel={`${steps.length} steps · ${roles.length} roles`}
          />
          <ScoreGauge
            score={riskScore}
            label="Risk Score"
            sublabel={highRisks > 0 ? `${highRisks} high-severity risk${highRisks > 1 ? 's' : ''}` : 'No critical risks'}
          />
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatChip
            value={steps.length}
            label="Steps"
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              </svg>
            }
          />
          <StatChip
            value={roles.length}
            label="Roles"
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            }
          />
          <StatChip
            value={risks.length}
            label="Risks"
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
          />
          <StatChip
            value={summary?.estimatedComplexity?.[0] || '–'}
            label="Complexity"
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            }
          />
        </div>

        {/* Quick Nav */}
        <QuickNavBar />
      </div>
    </div>
  )
}