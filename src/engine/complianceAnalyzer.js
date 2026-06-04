/**
 * complianceAnalyzer.js
 * Rule-based governance and compliance analysis for v0.1.
 *
 * Input: summary, extracted workflow steps, extracted roles.
 * Output: { score, status, findings, recommendations }
 *
 * v0.2 migration: rules can be expanded or moved behind an API while keeping
 * this output shape stable for the dashboard.
 */

const CONTROL_RULES = [
  {
    id: 'approval',
    patterns: ['approval', 'approve', 'approved', 'approver', 'authorized', 'authorised'],
    finding: 'Missing approval stage',
    recommendation: 'Add an approval checkpoint before final activation or completion.',
  },
  {
    id: 'validation',
    patterns: ['review', 'verify', 'verified', 'verification', 'validation', 'validate', 'validated'],
    finding: 'Missing validation step',
    recommendation: 'Add a validation or review stage to confirm process accuracy.',
  },
  {
    id: 'compliance',
    patterns: ['compliance', 'legal', 'audit', 'regulatory', 'policy'],
    finding: 'No compliance checkpoint detected',
    recommendation: 'Add compliance verification for legal, regulatory, or policy requirements.',
  },
  {
    id: 'auditTrail',
    patterns: ['record', 'recorded', 'log', 'logged', 'documentation', 'documented', 'archive', 'archived'],
    finding: 'No audit trail detected',
    recommendation: 'Add audit logging or documentation steps for traceability.',
  },
]

function collectSearchText(summary, steps, roles) {
  const summaryText = summary
    ? [summary.title, summary.overview, summary.scope, summary.objective].filter(Boolean).join(' ')
    : ''

  const stepText = (steps || [])
    .map(step => [step.title, step.description, step.actor, step.type].filter(Boolean).join(' '))
    .join(' ')

  const roleText = (roles || [])
    .map(role => [role.name, role.type, ...(role.responsibilities || [])].filter(Boolean).join(' '))
    .join(' ')

  return `${summaryText} ${stepText} ${roleText}`.toLowerCase()
}

function resolveStatus(score) {
  if (score === 100) return 'Excellent'
  if (score === 75) return 'Good'
  if (score === 50) return 'Needs Improvement'
  return 'High Risk'
}

/**
 * @param {object} summary
 * @param {Array} steps
 * @param {Array} roles
 * @returns {{ score: number, status: string, findings: string[], recommendations: string[] }}
 */
export function analyzeCompliance(summary, steps = [], roles = []) {
  const text = collectSearchText(summary, steps, roles)

  const missingControls = CONTROL_RULES.filter(rule =>
    !rule.patterns.some(pattern => text.includes(pattern))
  )

  const presentCount = CONTROL_RULES.length - missingControls.length
  const score = presentCount * 25

  return {
    score,
    status: resolveStatus(score),
    findings: missingControls.map(rule => rule.finding),
    recommendations: missingControls.map(rule => rule.recommendation),
  }
}
