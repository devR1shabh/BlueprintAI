/**
 * riskAnalyzer.js
 * Identifies process risks, classifies severity, and suggests mitigations.
 *
 * Each Risk:
 *   { id, title, description, severity, category, mitigation, stepId }
 *
 * severity:  'low' | 'medium' | 'high' | 'critical'
 * category:  'operational' | 'compliance' | 'security' | 'process' | 'human'
 *
 * v0.2 migration: replace body of `analyzeRisks()` with an API call.
 */

// ─── Risk pattern definitions ─────────────────────────────────────────────────
// Each entry: { keywords[], title, description fn, severity, category, mitigation fn }

const RISK_PATTERNS = [

  // ── Manual / human-error risks ──────────────────────────────────────────────
  {
    keywords: ['manual', 'manually', 'by hand', 'paper', 'spreadsheet'],
    title: 'Manual Processing Risk',
    description: (ctx) => `Manual step "${ctx}" is prone to human error and inconsistency.`,
    severity: 'medium',
    category: 'human',
    mitigation: () => 'Introduce automation or digital workflows to reduce manual intervention. Add validation checkpoints before manual data is accepted downstream.',
  },
  {
    keywords: ['email', 'emails', 'phone call', 'verbally', 'word of mouth'],
    title: 'Informal Communication Risk',
    description: (ctx) => `Communication via informal channels in "${ctx}" may lead to lost information or missed handoffs.`,
    severity: 'medium',
    category: 'process',
    mitigation: () => 'Centralise communications in a tracked system (ticketing, CRM, or project tool). Require documented confirmations for key decisions.',
  },

  // ── Approval / authorisation risks ──────────────────────────────────────────
  {
    keywords: ['approv', 'approval', 'sign off', 'sign-off', 'authorize', 'authorise', 'authorisation'],
    title: 'Approval Bottleneck Risk',
    description: (ctx) => `Approval gate in "${ctx}" may create bottlenecks if the approver is unavailable.`,
    severity: 'medium',
    category: 'operational',
    mitigation: () => 'Define an approval delegation matrix. Set SLA timers on approval steps and implement auto-escalation if breached.',
  },
  {
    keywords: ['single point', 'only one', 'sole', 'one person'],
    title: 'Single Point of Failure',
    description: (ctx) => `"${ctx}" depends on a single individual, creating a critical dependency.`,
    severity: 'high',
    category: 'operational',
    mitigation: () => 'Cross-train at least one backup resource for each critical role. Document the process thoroughly to enable knowledge transfer.',
  },

  // ── Escalation / exception risks ─────────────────────────────────────────────
  {
    keywords: ['escalat', 'escalate', 'escalation'],
    title: 'Escalation Path Risk',
    description: (ctx) => `Escalation in "${ctx}" may lack clear criteria or SLA, causing delays.`,
    severity: 'medium',
    category: 'process',
    mitigation: () => 'Define explicit escalation criteria, timelines, and responsible parties. Ensure escalation paths are documented and tested.',
  },
  {
    keywords: ['exception', 'edge case', 'special case', 'workaround'],
    title: 'Exception Handling Gap',
    description: (ctx) => `"${ctx}" may lack a defined path for exceptional cases, leading to ad hoc handling.`,
    severity: 'medium',
    category: 'process',
    mitigation: () => 'Document known exception scenarios and their handling procedures. Create an exceptions register and review it periodically.',
  },

  // ── Data / compliance risks ───────────────────────────────────────────────────
  {
    keywords: ['data', 'record', 'log', 'audit trail', 'audit log'],
    title: 'Data Integrity Risk',
    description: (ctx) => `Data handling in "${ctx}" may lack integrity controls or audit trails.`,
    severity: 'medium',
    category: 'compliance',
    mitigation: () => 'Implement data validation at entry points. Ensure all data changes are logged with timestamps and user identifiers for audit purposes.',
  },
  {
    keywords: ['compliance', 'regulatory', 'regulation', 'legal', 'gdpr', 'hipaa', 'sox', 'pci'],
    title: 'Compliance & Regulatory Risk',
    description: (ctx) => `"${ctx}" involves regulatory or compliance obligations that must be formally documented.`,
    severity: 'high',
    category: 'compliance',
    mitigation: () => 'Conduct a formal compliance review with your legal/compliance team. Map the step to specific regulatory requirements and maintain evidence of adherence.',
  },
  {
    keywords: ['personal data', 'sensitive data', 'pii', 'password', 'credentials', 'private'],
    title: 'Data Privacy Risk',
    description: (ctx) => `"${ctx}" may involve sensitive personal data requiring privacy protection.`,
    severity: 'high',
    category: 'security',
    mitigation: () => 'Apply data minimisation principles. Ensure data is encrypted at rest and in transit. Restrict access on a need-to-know basis and obtain necessary consents.',
  },

  // ── External dependency risks ─────────────────────────────────────────────────
  {
    keywords: ['external', 'third party', 'third-party', 'vendor', 'supplier', 'partner'],
    title: 'External Dependency Risk',
    description: (ctx) => `"${ctx}" depends on an external party whose availability or quality is not directly controlled.`,
    severity: 'medium',
    category: 'operational',
    mitigation: () => 'Define SLAs with third parties contractually. Establish contingency plans for vendor delays and maintain alternative suppliers where feasible.',
  },

  // ── Timing / deadline risks ───────────────────────────────────────────────────
  {
    keywords: ['deadline', 'sla', 'time-sensitive', 'time sensitive', 'urgent', 'within 24', 'within 48', 'by end of'],
    title: 'SLA / Deadline Risk',
    description: (ctx) => `"${ctx}" has time-sensitive requirements that may be breached without active monitoring.`,
    severity: 'high',
    category: 'operational',
    mitigation: () => 'Configure automated SLA tracking and alerts. Define consequences and escalation paths when deadlines are at risk. Review capacity regularly.',
  },

  // ── Handoff risks ─────────────────────────────────────────────────────────────
  {
    keywords: ['handoff', 'hand-off', 'hand off', 'transfer', 'pass to', 'forward to', 'handover'],
    title: 'Handoff Communication Risk',
    description: (ctx) => `The handoff in "${ctx}" may result in information loss or delays if not structured.`,
    severity: 'medium',
    category: 'process',
    mitigation: () => 'Standardise handoff templates with required fields. Use a shared system to track handoff status and confirm receipt by the receiving party.',
  },

  // ── Capacity / resource risks ─────────────────────────────────────────────────
  {
    keywords: ['queue', 'backlog', 'capacity', 'overload', 'volume', 'high volume', 'peak'],
    title: 'Capacity & Throughput Risk',
    description: (ctx) => `"${ctx}" may face throughput issues during high-volume periods.`,
    severity: 'medium',
    category: 'operational',
    mitigation: () => 'Define maximum queue depths and capacity thresholds. Plan for surge capacity (on-call resources, automation) and monitor volume trends proactively.',
  },

  // ── Undocumented / knowledge risk ─────────────────────────────────────────────
  {
    keywords: ['undocumented', 'not documented', 'informal', 'ad hoc', 'ad-hoc', 'unwritten'],
    title: 'Knowledge Documentation Risk',
    description: (ctx) => `"${ctx}" relies on undocumented knowledge, creating fragility.`,
    severity: 'high',
    category: 'human',
    mitigation: () => 'Document this process step in detail, including decision criteria and edge cases. Store documentation in an accessible, version-controlled location.',
  },

  // ── No error handling ─────────────────────────────────────────────────────────
  {
    keywords: ['fail', 'failure', 'error', 'incorrect', 'invalid', 'reject', 'denied'],
    title: 'Error Handling Gap',
    description: (ctx) => `"${ctx}" may lack explicit error handling, leaving failure scenarios undefined.`,
    severity: 'medium',
    category: 'process',
    mitigation: () => 'Define explicit failure paths for this step. Document what constitutes an error, who is notified, and what the corrective action is.',
  },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateId(index) {
  return `risk_${String(index + 1).padStart(3, '0')}`
}

function truncate(str, len = 50) {
  if (str.length <= len) return str
  const cut = str.slice(0, len)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut) + '…'
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/**
 * Avoid flagging the same risk category more than twice.
 */
function deduplicateRisks(risks) {
  const categoryCount = {}
  return risks.filter(risk => {
    categoryCount[risk.category] = (categoryCount[risk.category] || 0) + 1
    return categoryCount[risk.category] <= 2
  })
}

// ─── Severity upgrade logic ───────────────────────────────────────────────────

const CRITICAL_AMPLIFIERS = [
  'critical', 'critical path', 'no fallback', 'no backup', 'irreversible',
  'permanent', 'financial impact', 'legal action', 'breach', 'outage',
]

function maybeUpgradeSeverity(severity, stepDescription) {
  if (severity === 'high') {
    const lower = stepDescription.toLowerCase()
    if (CRITICAL_AMPLIFIERS.some(a => lower.includes(a))) return 'critical'
  }
  return severity
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {Array} steps    — output of extractSteps()
 * @param {Array} roles    — output of extractRoles() (reserved for v0.2 enrichment)
 * @returns {Array<{
 *   id: string,
 *   title: string,
 *   description: string,
 *   severity: 'low' | 'medium' | 'high' | 'critical',
 *   category: 'operational' | 'compliance' | 'security' | 'process' | 'human',
 *   mitigation: string,
 *   stepId: string | null
 * }>}
 */
export function analyzeRisks(steps, roles = []) {
  if (!steps || steps.length === 0) return []

  const found = []

  for (const step of steps) {
    const lowerDesc = step.description.toLowerCase()
    const contextTitle = truncate(step.title)

    for (const pattern of RISK_PATTERNS) {
      const matched = pattern.keywords.some(kw => lowerDesc.includes(kw))
      if (!matched) continue

      // Avoid exact duplicate titles in the results
      if (found.some(r => r.title === pattern.title && r.stepId === step.id)) continue

      const severity = maybeUpgradeSeverity(pattern.severity, step.description)

      found.push({
        _title: pattern.title,  // used for dedup before removing
        title:       pattern.title,
        description: pattern.description(contextTitle),
        severity,
        category:    pattern.category,
        mitigation:  pattern.mitigation(),
        stepId:      step.id,
      })
    }
  }

  // Deduplicate by category (max 2 per category), then cap total
  const deduped = deduplicateRisks(found)

  // Sort: critical → high → medium → low
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = deduped.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const capped = sorted.slice(0, 10)

  // Assign final IDs and clean up internal fields
  return capped.map((risk, index) => {
    const { _title, ...rest } = risk
    return { id: generateId(index), ...rest }
  })
}