/**
 * sopGenerator.js
 * Composes a complete, formatted Standard Operating Procedure document
 * from all upstream engine outputs.
 *
 * Returns a plain-text string (structured with sections).
 * The SOPViewer component renders this with monospace formatting.
 *
 * v0.2 migration: replace body of `generateSOP()` with an API call
 * that uses the structured inputs to produce a richer document.
 * The return type (string) stays the same — SOPViewer needs no changes.
 */

// ─── Formatting helpers ───────────────────────────────────────────────────────

const LINE  = '─'.repeat(60)
const DLINE = '═'.repeat(60)

function heading(text) {
  return `\n${DLINE}\n  ${text.toUpperCase()}\n${DLINE}\n`
}

function subheading(text) {
  return `\n${LINE}\n  ${text}\n${LINE}\n`
}

function bullet(text, indent = 0) {
  const pad = ' '.repeat(indent)
  return `${pad}•  ${text}`
}

function numbered(text, n, indent = 0) {
  const pad = ' '.repeat(indent)
  const num = String(n).padStart(2, ' ')
  return `${pad}${num}.  ${text}`
}

function field(label, value) {
  const labelPad = label.padEnd(22, ' ')
  return `  ${labelPad}${value}`
}

function pad(str, len) {
  return str.length >= len ? str : str + ' '.repeat(len - str.length)
}

function formatDate() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function severityLabel(severity) {
  const map = { critical: '⬛ CRITICAL', high: '🔴 HIGH', medium: '🟡 MEDIUM', low: '🟢 LOW' }
  return map[severity] || severity.toUpperCase()
}

function typeLabel(type) {
  const map = { human: 'Human', system: 'System', external: 'External' }
  return map[type] || type
}

// ─── Section builders ─────────────────────────────────────────────────────────

function buildCoverPage(summary) {
  const docId = `SOP-${Date.now().toString(36).toUpperCase().slice(-6)}`
  return [
    '',
    DLINE,
    '  STANDARD OPERATING PROCEDURE',
    DLINE,
    '',
    field('Document Title:', summary.title || 'Business Process SOP'),
    field('Document ID:', docId),
    field('Version:', '1.0'),
    field('Status:', 'Draft'),
    field('Date Issued:', formatDate()),
    field('Complexity:', summary.estimatedComplexity || 'Medium'),
    field('Total Steps:', String(summary.stepCount || 0)),
    '',
    DLINE,
    '',
  ].join('\n')
}

function buildPurposeSection(summary) {
  const lines = [
    heading('1. Purpose & Scope'),
    '',
    '  PURPOSE',
    '  ' + (summary.objective || 'Define and standardise the execution of this business process.'),
    '',
    '  SCOPE',
    '  ' + (summary.scope || 'This procedure applies to all relevant stakeholders.'),
    '',
    '  OVERVIEW',
  ]

  // Word-wrap the overview at ~56 chars
  const words = (summary.overview || '').split(/\s+/)
  let line = '  '
  for (const word of words) {
    if ((line + word).length > 58) {
      lines.push(line.trimEnd())
      line = '  ' + word + ' '
    } else {
      line += word + ' '
    }
  }
  if (line.trim()) lines.push(line.trimEnd())
  lines.push('')

  return lines.join('\n')
}

function buildRolesSection(roles) {
  if (!roles || roles.length === 0) {
    return heading('2. Roles & Responsibilities') + '\n  No roles identified.\n'
  }

  const lines = [
    heading('2. Roles & Responsibilities'),
    '',
    `  ${'ROLE'.padEnd(24)}${'TYPE'.padEnd(12)}RESPONSIBILITIES`,
    '  ' + '─'.repeat(56),
  ]

  for (const role of roles) {
    const nameCol = pad(role.name, 24)
    const typeCol = pad(typeLabel(role.type), 12)
    const firstResp = role.responsibilities?.[0] || 'See process steps'
    lines.push(`  ${nameCol}${typeCol}${firstResp}`)

    // Additional responsibilities indented
    for (const resp of (role.responsibilities || []).slice(1)) {
      lines.push(`  ${' '.repeat(36)}${resp}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function buildProcedureSection(steps) {
  if (!steps || steps.length === 0) {
    return heading('3. Procedure') + '\n  No steps identified.\n'
  }

  const typeSymbol = { trigger: '▶', action: '○', decision: '◇', end: '■' }

  const lines = [
    heading('3. Procedure'),
    '',
    '  Follow the steps below in sequence. Decision points require',
    '  evaluation before proceeding to the next action.',
    '',
  ]

  for (const step of steps) {
    const symbol = typeSymbol[step.type] || '○'
    const stepLabel = `STEP ${step.stepNumber} ${symbol}`

    lines.push(subheading(stepLabel))
    lines.push('')
    lines.push(field('  Title:', step.title))
    lines.push(field('  Responsible Party:', step.actor))
    lines.push(field('  Step Type:', step.type.charAt(0).toUpperCase() + step.type.slice(1)))
    lines.push('')
    lines.push('  Description:')

    // Word-wrap description
    const words = step.description.split(/\s+/)
    let descLine = '    '
    for (const word of words) {
      if ((descLine + word).length > 62) {
        lines.push(descLine.trimEnd())
        descLine = '    ' + word + ' '
      } else {
        descLine += word + ' '
      }
    }
    if (descLine.trim()) lines.push(descLine.trimEnd())
    lines.push('')
  }

  return lines.join('\n')
}

function buildRiskSection(risks) {
  if (!risks || risks.length === 0) {
    return heading('4. Risk Register') + '\n  No risks identified.\n'
  }

  const lines = [
    heading('4. Risk Register'),
    '',
    '  Identified risks are listed by severity. Mitigations should',
    '  be actioned before the process goes live.',
    '',
  ]

  let riskNum = 1
  for (const risk of risks) {
    lines.push(`  ${numbered(risk.title, riskNum)}`)
    lines.push(`     Severity  :  ${severityLabel(risk.severity)}`)
    lines.push(`     Category  :  ${risk.category.charAt(0).toUpperCase() + risk.category.slice(1)}`)
    lines.push(`     Risk      :  ${risk.description}`)
    lines.push(`     Mitigation:  ${risk.mitigation}`)
    lines.push('')
    riskNum++
  }

  return lines.join('\n')
}

function buildGlossarySection(roles, steps) {
  const lines = [
    heading('5. Definitions & Abbreviations'),
    '',
  ]

  const terms = new Map()

  // Add role types
  const hasSystem  = roles.some(r => r.type === 'system')
  const hasExternal = roles.some(r => r.type === 'external')
  if (hasSystem)   terms.set('System Actor', 'An automated platform, tool, or service that performs actions without human intervention.')
  if (hasExternal) terms.set('External Party', 'An individual or organisation outside the primary business that participates in the process.')

  // Add step type terms
  const hasDecision = steps.some(s => s.type === 'decision')
  const hasTrigger  = steps.some(s => s.type === 'trigger')
  if (hasTrigger)  terms.set('Trigger', 'An event or condition that initiates the process or a sub-process.')
  if (hasDecision) terms.set('Decision Point', 'A step where the process flow branches based on evaluated criteria.')
  terms.set('SOP', 'Standard Operating Procedure — a documented, step-by-step guide for performing a process.')
  terms.set('SLA', 'Service Level Agreement — a commitment to perform a task within a defined timeframe.')
  terms.set('Escalation', 'The act of routing an issue to a higher authority when normal resolution paths are exhausted.')

  for (const [term, def] of terms) {
    lines.push(`  ${term}`)
    // Word-wrap definition
    const words = def.split(/\s+/)
    let defLine = '    '
    for (const word of words) {
      if ((defLine + word).length > 62) {
        lines.push(defLine.trimEnd())
        defLine = '    ' + word + ' '
      } else {
        defLine += word + ' '
      }
    }
    if (defLine.trim()) lines.push(defLine.trimEnd())
    lines.push('')
  }

  return lines.join('\n')
}

function buildRevisionSection() {
  return [
    heading('6. Revision History'),
    '',
    `  ${'VERSION'.padEnd(10)}${'DATE'.padEnd(18)}${'AUTHOR'.padEnd(20)}CHANGES`,
    '  ' + '─'.repeat(56),
    `  ${'1.0'.padEnd(10)}${formatDate().padEnd(18)}${'BlueprintAI'.padEnd(20)}Initial draft generated`,
    '',
    DLINE,
    '  END OF DOCUMENT',
    DLINE,
    '',
  ].join('\n')
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {{
 *   summary: object,
 *   steps:   Array,
 *   roles:   Array,
 *   risks:   Array
 * }} outputs
 * @returns {string}  — formatted SOP plain-text document
 */
export function generateSOP({ summary, steps, roles, risks }) {
  const sections = [
    buildCoverPage(summary),
    buildPurposeSection(summary),
    buildRolesSection(roles),
    buildProcedureSection(steps),
    buildRiskSection(risks),
    buildGlossarySection(roles, steps),
    buildRevisionSection(),
  ]

  return sections.join('\n')
}