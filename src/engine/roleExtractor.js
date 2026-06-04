/**
 * roleExtractor.js
 * Identifies roles, actors, and systems from extracted steps + raw text.
 *
 * Each Role:
 *   { id, name, type, responsibilities, stepIds }
 *
 * type: 'human' | 'system' | 'external'
 *
 * v0.2 migration: replace body of `extractRoles()` with an API call.
 */

// ─── Role taxonomy ────────────────────────────────────────────────────────────

const HUMAN_ROLES = [
  'customer', 'client', 'user', 'end user',
  'agent', 'support agent', 'support rep',
  'manager', 'team lead', 'supervisor', 'director',
  'admin', 'administrator',
  'employee', 'staff', 'team member', 'operator',
  'approver', 'reviewer', 'auditor', 'analyst',
  'coordinator', 'project manager',
  'tier 1', 'tier 2', 'tier 3', 'level 1', 'level 2', 'level 3',
  'finance team', 'finance manager', 'accountant',
  'hr', 'hr team', 'recruiter', 'hiring manager',
  'it team', 'it admin', 'developer', 'engineer',
  'sales team', 'sales rep', 'account manager',
  'legal team', 'compliance officer',
  'operations team', 'operations manager',
]

const SYSTEM_ROLES = [
  'system', 'platform', 'portal', 'database', 'api',
  'automated', 'automation', 'bot', 'workflow engine',
  'crm', 'erp', 'hris', 'ticketing system', 'helpdesk',
  'notification system', 'email system', 'slack',
  'payment gateway', 'billing system',
  'monitoring system', 'alert system',
]

const EXTERNAL_ROLES = [
  'vendor', 'supplier', 'partner', 'third party', 'third-party',
  'regulator', 'auditor', 'external', 'contractor', 'consultant',
  'customer', 'client', // customers are often external
]

// Responsibility verb patterns for each actor
const RESPONSIBILITY_VERBS = [
  'review', 'approve', 'reject', 'submit', 'send', 'notify',
  'create', 'assign', 'resolve', 'escalate', 'process', 'check',
  'verify', 'confirm', 'complete', 'generate', 'log', 'record',
  'update', 'close', 'open', 'contact', 'inform', 'request',
  'receive', 'forward', 'handle', 'analyze', 'assess', 'evaluate',
  'investigate', 'diagnose', 'fix', 'apply', 'deploy', 'test',
  'schedule', 'coordinate', 'manage', 'monitor', 'report',
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateId(index) {
  return `role_${String(index + 1).padStart(3, '0')}`
}

function normalise(str) {
  return str.toLowerCase().trim().replace(/\s+/g, ' ')
}

function toTitleCase(str) {
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function classifyRole(roleName) {
  const lower = normalise(roleName)

  // System check first (most distinct)
  if (SYSTEM_ROLES.some(s => lower.includes(s))) return 'system'

  // External check
  if (EXTERNAL_ROLES.some(e => lower.includes(e))) {
    // Customers/clients can be external; if also in human list, external wins
    if (['customer', 'client', 'vendor', 'partner', 'contractor'].some(e => lower.includes(e))) {
      return 'external'
    }
  }

  // Human check
  if (HUMAN_ROLES.some(h => lower.includes(h))) return 'human'

  // Default: if contains "team" or "department", treat as human
  if (lower.includes('team') || lower.includes('department') || lower.includes('group')) return 'human'

  return 'human' // sensible default
}

/**
 * Extract responsibilities for a role from the steps where they appear.
 * @param {string} roleName
 * @param {Array} steps
 * @returns {string[]}
 */
function extractResponsibilities(roleName, steps) {
  const lowerRole = normalise(roleName)
  const responsibilities = []

  for (const step of steps) {
    const lowerDesc = step.description.toLowerCase()
    const lowerActor = step.actor.toLowerCase()

    // This step belongs to this role
    if (lowerActor.includes(lowerRole) || lowerRole.includes(lowerActor)) {
      // Extract the core action phrase
      for (const verb of RESPONSIBILITY_VERBS) {
        if (lowerDesc.includes(verb)) {
          // Find the verb + object phrase
          const verbIdx = lowerDesc.indexOf(verb)
          const phrase = step.description.slice(verbIdx, verbIdx + 60).split(/[,.]/, 1)[0].trim()
          if (phrase.length > 5 && !responsibilities.some(r => r.toLowerCase().includes(verb))) {
            responsibilities.push(
              phrase.charAt(0).toUpperCase() + phrase.slice(1)
            )
          }
          break
        }
      }
    }
  }

  // Deduplicate and cap
  return [...new Set(responsibilities)].slice(0, 4)
}

// ─── Role collection ──────────────────────────────────────────────────────────

/**
 * Collect unique role names from steps (actors) + raw text scanning.
 * @param {Array} steps
 * @param {string} rawInput
 * @returns {string[]}
 */
function collectRoleNames(steps, rawInput) {
  const found = new Set()

  // 1. All actors from extracted steps
  for (const step of steps) {
    if (step.actor && step.actor !== 'Process Actor') {
      found.add(normalise(step.actor))
    }
  }

  // 2. Scan raw text for known role keywords
  const lower = rawInput.toLowerCase()
  for (const role of [...HUMAN_ROLES, ...SYSTEM_ROLES, ...EXTERNAL_ROLES]) {
    if (lower.includes(role) && role.length > 2) {
      found.add(role)
    }
  }

  // 3. Scan for "the [Word] " pattern — e.g. "The Approver reviews..."
  const actorPattern = /\bthe\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g
  let match
  while ((match = actorPattern.exec(rawInput)) !== null) {
    const candidate = normalise(match[1])
    if (candidate.length > 2 && candidate.length < 25 && !['process', 'system', 'following'].includes(candidate)) {
      found.add(candidate)
    }
  }

  return [...found]
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {Array} steps        — output of extractSteps()
 * @param {string} rawInput    — original text (for supplementary scanning)
 * @returns {Array<{
 *   id: string,
 *   name: string,
 *   type: 'human' | 'system' | 'external',
 *   responsibilities: string[],
 *   stepIds: string[]
 * }>}
 */
export function extractRoles(steps, rawInput = '') {
  if (!steps || steps.length === 0) return []

  const roleNames = collectRoleNames(steps, rawInput)

  if (roleNames.length === 0) {
    // Fallback: create a generic role from the first step actor
    return [{
      id: 'role_001',
      name: 'Process Owner',
      type: 'human',
      responsibilities: ['Oversee and execute the described business process'],
      stepIds: steps.map(s => s.id),
    }]
  }

  // Build role objects
  const roles = roleNames.map((name, index) => {
    const formatted = toTitleCase(name)
    const type = classifyRole(name)

    // Find steps where this role appears as actor
    const lowerName = name.toLowerCase()
    const stepIds = steps
      .filter(s => s.actor.toLowerCase().includes(lowerName) || lowerName.includes(s.actor.toLowerCase()))
      .map(s => s.id)

    const responsibilities = extractResponsibilities(name, steps)

    // Add a default responsibility if none found
    if (responsibilities.length === 0) {
      if (type === 'system') responsibilities.push(`Automated processing and data management`)
      else if (type === 'external') responsibilities.push(`External participation in the process`)
      else responsibilities.push(`Active participation and task execution`)
    }

    return {
      id: generateId(index),
      name: formatted,
      type,
      responsibilities,
      stepIds,
    }
  })

  // Sort: human → external → system
  const typeOrder = { human: 0, external: 1, system: 2 }
  return roles.sort((a, b) => typeOrder[a.type] - typeOrder[b.type])
}