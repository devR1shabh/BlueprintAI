/**
 * mermaidBuilder.js
 * Generates valid Mermaid.js flowchart syntax from extracted steps and roles.
 *
 * Returns a string of Mermaid syntax ready to pass to mermaid.render().
 *
 * v0.2 migration: replace body of `buildMermaid()` with an API call.
 * The return type (string) stays the same — MermaidDiagram needs no changes.
 */

// ─── Verb-object compression ──────────────────────────────────────────────────
// Converts full sentences → short "Verb Object" labels that fit inside nodes.
// "The payroll system is automatically updated to reflect approved leave"
//   → "Update Payroll System"

const VERB_MAP = [
  [/submits?|submission/i,       'Submit'],
  [/receiv|arrives?|incoming/i,  'Receive'],
  [/review|reviews?/i,           'Review'],
  [/approv|approves?/i,          'Approve'],
  [/rejects?|denied|declines?/i, 'Reject'],
  [/escalat/i,                   'Escalate'],
  [/assign|routes?/i,            'Assign'],
  [/notif|sends?\s+notif|alerts?/i, 'Notify'],
  [/send|sends?\s+email/i,       'Send'],
  [/verif|validates?/i,          'Verify'],
  [/confirm|confirms?/i,         'Confirm'],
  [/complet|completes?/i,        'Complete'],
  [/resolv|fixes?|resolved/i,    'Resolve'],
  [/creat|creates?|opens?/i,     'Create'],
  [/updat|updates?/i,            'Update'],
  [/check|checks?/i,             'Check'],
  [/process|processes/i,         'Process'],
  [/generat|generates?/i,        'Generate'],
  [/schedul|schedules?/i,        'Schedule'],
  [/conduct|conducts?/i,         'Conduct'],
  [/investigat/i,                'Investigate'],
  [/diagnos/i,                   'Diagnose'],
  [/deploy|deploys?/i,           'Deploy'],
  [/test|tests?/i,               'Test'],
  [/log|logs?|records?/i,        'Log'],
  [/close|closes?|closing/i,     'Close'],
  [/contact|contacts?/i,         'Contact'],
  [/coordinat/i,                 'Coordinate'],
  [/monitor|monitors?/i,         'Monitor'],
  [/request|requests?/i,         'Request'],
  [/forward|forwards?/i,         'Forward'],
  [/handl|handles?/i,            'Handle'],
  [/provid|provides?/i,          'Provide'],
  [/configur/i,                  'Configure'],
  [/enroll|enrolls?/i,           'Enroll'],
  [/activat/i,                   'Activate'],
  [/initiat/i,                   'Initiate'],
  [/implement/i,                 'Implement'],
  [/conduct/i,                   'Conduct'],
]

// Key nouns we want to preserve in the compressed label
const IMPORTANT_NOUNS = [
  'payroll', 'ticket', 'survey', 'invoice', 'payment', 'vendor',
  'employee', 'customer', 'manager', 'agent', 'system', 'portal',
  'email', 'report', 'request', 'order', 'contract', 'document',
  'access', 'account', 'credentials', 'onboarding', 'approval',
  'resolution', 'notification', 'leave', 'budget', 'compliance',
  'training', 'checklist', 'review', 'audit', 'complaint', 'escalation',
]

/**
 * Compress a full sentence label into a short "Verb Noun" phrase.
 * Max 32 chars — fits cleanly in all Mermaid node shapes.
 * @param {string} title  — step.title from stepExtractor
 * @returns {string}
 */
function compressLabel(title) {
  const lower = title.toLowerCase()

  // Find the best matching verb
  let verb = ''
  for (const [pattern, replacement] of VERB_MAP) {
    if (pattern.test(lower)) {
      verb = replacement
      break
    }
  }

  // Find the most important noun present
  let noun = ''
  for (const n of IMPORTANT_NOUNS) {
    if (lower.includes(n)) {
      noun = n.charAt(0).toUpperCase() + n.slice(1)
      break
    }
  }

  // Build compressed label
  if (verb && noun) {
    const compressed = `${verb} ${noun}`
    return compressed.length <= 32 ? compressed : verb
  }

  if (verb) return verb

  // Fallback: use first 3 words of title, title-cased
  const words = title.replace(/^(the|a|an)\s+/i, '').split(/\s+/).slice(0, 3)
  const fallback = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  return fallback.slice(0, 32)
}

// ─── Decision label builder ───────────────────────────────────────────────────
// Converts an action step title into a yes/no business question.

const DECISION_QUESTION_MAP = [
  [/approv/i,                     'Approval Granted?'],
  [/reject/i,                     'Rejected?'],
  [/compli/i,                     'Compliance Passed?'],
  [/verif/i,                      'Verification Passed?'],
  [/valid/i,                      'Validation Passed?'],
  [/escalat/i,                    'Escalation Required?'],
  [/resolv/i,                     'Resolved Successfully?'],
  [/match|three.way/i,            'Documents Match?'],
  [/budget|threshold|limit/i,     'Within Budget Limit?'],
  [/leave|duration|days/i,        'Leave > 10 Days?'],
  [/availab/i,                    'Resource Available?'],
  [/credit|financ/i,              'Credit Check Passed?'],
  [/legal|contract/i,             'Legal Review Passed?'],
  [/onboard/i,                    'Onboarding Complete?'],
  [/receiv|arrival/i,             'Receipt Confirmed?'],
  [/payment|pay/i,                'Payment Authorised?'],
  [/access|permiss/i,             'Access Granted?'],
  [/discrepan|mismatch/i,         'Discrepancy Found?'],
  [/satisf|survey/i,              'Satisfied?'],
  [/manag/i,                      'Manager Approved?'],
  [/review/i,                     'Review Passed?'],
]

/**
 * Build a meaningful yes/no question label for a decision node.
 * @param {string} title  — step.title
 * @returns {string}
 */
function buildDecisionLabel(title) {
  const lower = title.toLowerCase()

  for (const [pattern, question] of DECISION_QUESTION_MAP) {
    if (pattern.test(lower)) return question
  }

  // Generic fallback: compress + question mark
  const compressed = compressLabel(title)
  return compressed.endsWith('?') ? compressed : `${compressed}?`
}

// ─── Sanitisation ─────────────────────────────────────────────────────────────

function sanitiseLabel(str) {
  return str
    .replace(/"/g, "'")
    .replace(/`/g, "'")
    .replace(/[<>]/g, '')
    .replace(/[[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    // Hard cap: 35 chars. After compression this should rarely trigger.
    .slice(0, 35)
}

function sanitiseId(str) {
  return str
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1')
}

// ─── Node shape selector ──────────────────────────────────────────────────────

function nodeShape(step, roles) {
  // Compute the right label per type
  let label
  if (step.type === 'decision') {
    label = sanitiseLabel(buildDecisionLabel(step.title))
  } else {
    label = sanitiseLabel(compressLabel(step.title))
  }

  switch (step.type) {
    case 'trigger':  return `([${label}])`
    case 'decision': return `{${label}}`
    case 'end':      return `([${label}])`
    default:         return `(${label})`
  }
}

// ─── Role colour classes ──────────────────────────────────────────────────────

const ROLE_STYLE_MAP = {
  human:    { class: 'humanNode',    style: 'fill:#1e2d4a,stroke:#3b6fd4,stroke-width:1.5px,color:#a5b8fc' },
  system:   { class: 'systemNode',   style: 'fill:#1a2e1a,stroke:#3a7d3a,stroke-width:1.5px,color:#86efac' },
  external: { class: 'externalNode', style: 'fill:#2d1e1e,stroke:#c0392b,stroke-width:1.5px,color:#fca5a5' },
  decision: { class: 'decisionNode', style: 'fill:#2d2b1e,stroke:#c0a739,stroke-width:1.5px,color:#fde68a' },
  trigger:  { class: 'triggerNode',  style: 'fill:#1e1a2d,stroke:#7c3aed,stroke-width:2px,color:#c4b5fd'  },
  end:      { class: 'endNode',      style: 'fill:#1a1a2d,stroke:#6366f1,stroke-width:2px,color:#a5b4fc'  },
}

function resolveNodeClass(step, roles) {
  if (step.type === 'trigger')  return 'triggerNode'
  if (step.type === 'end')      return 'endNode'
  if (step.type === 'decision') return 'decisionNode'

  const lowerActor = step.actor.toLowerCase()
  const matchedRole = roles.find(r =>
    r.name.toLowerCase().includes(lowerActor) ||
    lowerActor.includes(r.name.toLowerCase())
  )
  if (matchedRole) return ROLE_STYLE_MAP[matchedRole.type]?.class || 'humanNode'
  return 'humanNode'
}

// ─── Actor grouping ───────────────────────────────────────────────────────────

function groupByActor(steps) {
  const groups = new Map()
  for (const step of steps) {
    const actor = step.actor || 'Process Actor'
    if (!groups.has(actor)) groups.set(actor, [])
    groups.get(actor).push(step)
  }
  return groups
}

// ─── Edge labels ─────────────────────────────────────────────────────────────

function edgeLabel(fromStep) {
  if (fromStep.type === 'decision') return '-->|Yes|'
  if (fromStep.type === 'trigger')  return '-->'
  return '-->'
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {Array} steps   — output of extractSteps()
 * @param {Array} roles   — output of extractRoles()
 * @returns {string}      — Mermaid flowchart TD syntax
 */
export function buildMermaid(steps, roles = []) {
  if (!steps || steps.length === 0) {
    return 'flowchart TD\n    A([No steps extracted])'
  }

  const lines = ['flowchart TD']

  // Class definitions
  lines.push('')
  lines.push('    %% Node style classes')
  for (const [, val] of Object.entries(ROLE_STYLE_MAP)) {
    lines.push(`    classDef ${val.class} ${val.style}`)
  }

  // Node definitions
  lines.push('')
  lines.push('    %% Process nodes')

  const nodeClassMap = new Map()

  for (const step of steps) {
    const id    = sanitiseId(step.id)
    const shape = nodeShape(step, roles)
    const cls   = resolveNodeClass(step, roles)

    lines.push(`    ${id}${shape}`)
    nodeClassMap.set(id, cls)
  }

  // Edges
  lines.push('')
  lines.push('    %% Flow connections')

  for (let i = 0; i < steps.length - 1; i++) {
    const fromId = sanitiseId(steps[i].id)
    const toId   = sanitiseId(steps[i + 1].id)
    const arrow  = edgeLabel(steps[i])

    lines.push(`    ${fromId} ${arrow} ${toId}`)

    if (steps[i].type === 'decision' && i + 2 < steps.length) {
      const altId = sanitiseId(steps[i + 2].id)
      lines.push(`    ${fromId} -->|No| ${altId}`)
    }
  }

  // Class assignments
  lines.push('')
  lines.push('    %% Class assignments')

  const classGroups = new Map()
  for (const [nodeId, cls] of nodeClassMap) {
    if (!classGroups.has(cls)) classGroups.set(cls, [])
    classGroups.get(cls).push(nodeId)
  }
  for (const [cls, ids] of classGroups) {
    lines.push(`    class ${ids.join(',')} ${cls}`)
  }

  // Actor annotations
  const actorGroups = groupByActor(steps)
  if (actorGroups.size > 1) {
    lines.push('')
    lines.push('    %% Actor groupings (informational)')
    for (const [actor, actorSteps] of actorGroups) {
      const ids = actorSteps.map(s => sanitiseId(s.id)).join(', ')
      lines.push(`    %% ${actor}: ${ids}`)
    }
  }

  return lines.join('\n')
}