/**
 * stepExtractor.js
 * Parses raw process text into an ordered array of workflow steps.
 *
 * Each Step:
 *   { id, stepNumber, title, description, actor, type }
 *
 * type: 'action' | 'decision' | 'trigger' | 'end'
 *
 * v0.2 migration: replace body of `extractSteps()` with an API call.
 * Return shape is the contract — do not change it.
 */

// ─── Connector words that signal a new step ───────────────────────────────────

const STEP_CONNECTORS = [
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh',
  'eighth', 'ninth', 'tenth', 'next', 'then', 'after that', 'afterwards',
  'subsequently', 'following this', 'once', 'when', 'finally', 'lastly',
  'upon', 'before', 'during', 'meanwhile',
]

// ─── Decision/conditional markers ────────────────────────────────────────────

const DECISION_MARKERS = [
  'if ', 'unless ', 'when ', 'in case', 'depending on', 'based on',
  'should ', 'whether ', 'either ', 'otherwise', 'alternatively',
]

// ─── Trigger markers (start events) ──────────────────────────────────────────

const TRIGGER_MARKERS = [
  'begins when', 'starts when', 'initiated by', 'triggered by',
  'is submitted', 'is received', 'submits', 'receives', 'requests',
  'initiates', 'opens', 'creates', 'raises',
]

// ─── End step markers ─────────────────────────────────────────────────────────

const END_MARKERS = [
  'finally', 'lastly', 'completed', 'closed', 'resolved', 'archived',
  'finalized', 'concluded', 'end of', 'process ends', 'is complete',
  'is finished', 'closes the', 'marks the end',
]

// ─── Common actor patterns ────────────────────────────────────────────────────

const ACTOR_PATTERNS = [
  // "The [Actor] verb..."
  /^(?:the\s+)?([\w\s]{2,24}?)\s+(?:then\s+)?(?:review|approv|submit|send|notif|creat|assign|resolv|escalat|process|check|verif|confirm|complet|generat|log|record|updat|close|open|contact|inform|request|receive|reject|forward|handl|analyz|assess|evaluat)/i,
  // "[Actor] is responsible..."
  /^([\w\s]{2,20}?)\s+(?:is|are)\s+responsible/i,
  // "Assigned to [Actor]"
  /assigned\s+to\s+(?:the\s+)?([\w\s]{2,20})/i,
  // "by the [Actor]"
  /by\s+(?:the\s+)?([\w\s]{2,20}?)\s*[.,]/i,
]

const KNOWN_ACTORS = [
  'customer', 'client', 'user', 'agent', 'manager', 'supervisor', 'admin',
  'administrator', 'team', 'system', 'platform', 'portal', 'service',
  'employee', 'staff', 'operator', 'approver', 'reviewer', 'analyst',
  'coordinator', 'tier 1', 'tier 2', 'tier 3', 'level 1', 'level 2',
  'finance team', 'hr team', 'it team', 'support team', 'sales team',
  'management', 'department', 'vendor', 'supplier', 'partner',
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateId(index) {
  return `step_${String(index + 1).padStart(3, '0')}`
}

function capitalise(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function inferActor(sentence) {
  const lower = sentence.toLowerCase()

  // Check known actors first (fast path)
  for (const actor of KNOWN_ACTORS) {
    if (lower.includes(actor)) {
      return actor
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }
  }

  // Try regex patterns
  for (const pattern of ACTOR_PATTERNS) {
    const match = sentence.match(pattern)
    if (match?.[1]) {
      const candidate = match[1].trim().toLowerCase()
      if (candidate.length > 1 && candidate.length < 30 && !/^\d+$/.test(candidate)) {
        return capitalise(candidate)
      }
    }
  }

  return 'Process Actor'
}

function inferType(sentence) {
  const lower = sentence.toLowerCase()
  if (TRIGGER_MARKERS.some(m => lower.includes(m))) return 'trigger'
  if (END_MARKERS.some(m => lower.includes(m))) return 'end'
  if (DECISION_MARKERS.some(m => lower.startsWith(m) || lower.includes(` ${m}`))) return 'decision'
  return 'action'
}

function buildTitle(sentence) {
  // Remove leading connector words
  let clean = sentence.trim()
  for (const connector of STEP_CONNECTORS) {
    const pattern = new RegExp(`^${connector}[,\\s]+`, 'i')
    clean = clean.replace(pattern, '')
  }

  // Capitalise and truncate to ~60 chars at a word boundary
  clean = capitalise(clean.replace(/\s+/g, ' ').trim())
  if (clean.length <= 60) return clean.replace(/[.!?]+$/, '')

  const truncated = clean.slice(0, 60)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 30 ? truncated.slice(0, lastSpace) : truncated) + '…'
}

// ─── Text splitter strategies ─────────────────────────────────────────────────

/**
 * Strategy 1: Numbered list  "1. ... 2. ..."
 */
function splitByNumberedList(text) {
  const pattern = /(?:^|\n)\s*(?:\d+[\).:\-]|\([a-z]\))\s+/gm
  const parts = text.split(pattern).map(s => s.trim()).filter(s => s.length > 10)
  return parts.length >= 2 ? parts : null
}

/**
 * Strategy 2: Bullet list  "- ..." or "* ..." or "• ..."
 */
function splitByBullets(text) {
  const pattern = /(?:^|\n)\s*[-*•◦▸►]\s+/gm
  const parts = text.split(pattern).map(s => s.trim()).filter(s => s.length > 10)
  return parts.length >= 2 ? parts : null
}

/**
 * Strategy 3: Sentence splitting on connector words
 */
function splitByConnectors(text) {
  const connectorPattern = new RegExp(
    `(?<=[.!?]\\s{0,2}|\\n)\\s*(?:${STEP_CONNECTORS.join('|')})\\s+`,
    'gi'
  )

  const sentences = text
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .split(connectorPattern)
    .map(s => s.trim())
    .filter(s => s.length > 15)

  return sentences.length >= 2 ? sentences : null
}

/**
 * Strategy 4: Sentence boundary split (fallback)
 */
function splitBySentences(text) {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 15)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {string} rawInput
 * @returns {Array<{
 *   id: string,
 *   stepNumber: number,
 *   title: string,
 *   description: string,
 *   actor: string,
 *   type: 'action' | 'decision' | 'trigger' | 'end'
 * }>}
 */
export function extractSteps(rawInput) {
  if (!rawInput || !rawInput.trim()) return []

  // Try each splitting strategy in priority order
  const segments =
    splitByNumberedList(rawInput) ||
    splitByBullets(rawInput) ||
    splitByConnectors(rawInput) ||
    splitBySentences(rawInput)

  if (!segments || segments.length === 0) return []

  // Normalise and cap at 15 steps for v0.1
  const capped = segments.slice(0, 15)

  return capped.map((segment, index) => {
    const clean = segment.replace(/\s+/g, ' ').trim()

    return {
      id:          generateId(index),
      stepNumber:  index + 1,
      title:       buildTitle(clean),
      description: capitalise(clean),
      actor:       inferActor(clean),
      type:        index === 0
        ? inferType(clean) === 'trigger' ? 'trigger' : 'action'
        : index === capped.length - 1
          ? inferType(clean) === 'end' ? 'end' : 'action'
          : inferType(clean),
    }
  })
}