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
  'if ', 'unless ', 'whether ', 'either ', 'otherwise', 'alternatively',
]

const QUESTION_WORDS = ['is ', 'are ', 'does ', 'do ', 'can ', 'will ', 'has ', 'have ', 'was ', 'were ']

const CONDITIONAL_TRANSFORMS = [
  { 
    regex: /^if (approved|rejected|successful|failed|valid|invalid|so|not)[,\s]+(.*)$/i, 
    question: (m) => capitalise(m[1]) + '?',
    action: (m) => m[2],
    label: (m) => /rejected|failed|invalid|not/i.test(m[1]) ? 'No' : 'Yes'
  },
  { 
    regex: /^(?:for|when) (.*?)[,\s]+(.*?)$/i, 
    question: (m) => capitalise(m[1]) + '?',
    action: (m) => m[2],
    label: () => 'Yes'
  }
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

// ─── Branching patterns ───────────────────────────────────────────────────────

const BRANCH_PATTERNS = [
  { label: 'No', pattern: /(?:if not|otherwise|if rejected|rejection|fail|invalid)\b.*?(?:return|go back|repeat|step\s*(\d+))/i },
  { label: 'Yes', pattern: /(?:if approved|approval|success|valid|if so)\b.*?(?:continue|proceed|next)/i },
  { label: 'Return', pattern: /(?:return|go back|repeat|restart)\s+to\s+(?:the\s+)?(?:start|beginning|step\s*(\d+))/i },
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

function inferType(sentence, branches = []) {
  const lower = sentence.toLowerCase()
  if (TRIGGER_MARKERS.some(m => lower.includes(m))) return 'trigger'
  if (END_MARKERS.some(m => lower.includes(m))) return 'end'
  
  const isQuestion = sentence.trim().endsWith('?') || 
                     QUESTION_WORDS.some(w => lower.startsWith(w))
  
  const hasBranches = branches.length > 0
  
  // Strict rule: Decision only if it's a question or has explicit logical branches
  if (isQuestion || hasBranches) {
    return 'decision'
  }
  
  return 'action'
}

/**
 * Attempts to find explicit jump targets (e.g., "go back to step 1").
 * Returns an array of { label, targetIndex }
 */
function inferBranches(sentence, currentIndex, totalSteps) {
  const branches = []
  
  for (const bp of BRANCH_PATTERNS) {
    const match = sentence.match(bp.pattern)
    if (match) {
      let targetIndex = null
      
      // If a step number is explicitly mentioned (e.g. "step 2")
      if (match[1]) {
        targetIndex = parseInt(match[1], 10) - 1
      } 
      // If "return to start"
      else if (bp.pattern.source.includes('start|beginning')) {
        targetIndex = 0
      }
      
      if (targetIndex !== null && targetIndex >= 0 && targetIndex < totalSteps) {
        branches.push({ label: bp.label, targetIndex })
      }
    }
  }
  
  return branches
}

function buildTitle(sentence) {
  // Remove leading connector words
  let clean = sentence.trim()
  for (const connector of STEP_CONNECTORS) {
    const pattern = new RegExp(`^${connector}[,\\s]+`, 'i')
    clean = clean.replace(pattern, '')
  }

  // Capitalise and truncate to ~120 chars at a word boundary
  clean = capitalise(clean.replace(/\s+/g, ' ').trim())
  if (clean.length <= 120) return clean.replace(/[.!?]+$/, '')

  const truncated = clean.slice(0, 120)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 60 ? truncated.slice(0, lastSpace) : truncated) + '…'
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
 *   type: 'action' | 'decision' | 'trigger' | 'end',
 *   branches: Array<{ label: string, targetIndex: number }>
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

  // Normalise and cap at 12 segments (may expand to 15+ steps)
  const cappedSegments = segments.slice(0, 12)
  const steps = []

  for (const segment of cappedSegments) {
    const clean = segment.replace(/\s+/g, ' ').trim()
    const actor = inferActor(clean)
    let expanded = false

    for (const transform of CONDITIONAL_TRANSFORMS) {
      const match = clean.match(transform.regex)
      if (match) {
        const questionText = transform.question(match)
        const actionText = transform.action(match)
        const label = transform.label(match)

        const decisionStep = {
          id:          generateId(steps.length),
          stepNumber:  steps.length + 1,
          title:       questionText,
          description: capitalise(clean),
          actor:       actor,
          type:        'decision',
          branches:    [] // Will be linked to next step
        }
        steps.push(decisionStep)

        const actionStep = {
          id:          generateId(steps.length),
          stepNumber:  steps.length + 1,
          title:       buildTitle(actionText),
          description: capitalise(clean),
          actor:       actor,
          type:        'action',
          branches:    []
        }
        
        // Link decision to this action
        decisionStep.branches.push({ 
          label: label, 
          targetIndex: steps.length 
        })
        
        steps.push(actionStep)
        expanded = true
        break
      }
    }

    if (!expanded) {
      steps.push({
        id:          generateId(steps.length),
        stepNumber:  steps.length + 1,
        title:       buildTitle(clean),
        description: capitalise(clean),
        actor:       actor,
        type:        'action', // Default, will refine below
        branches:    []
      })
    }
  }

  // Refine types and infer non-sequential branches
  return steps.map((step, index) => {
    // Only infer additional branches for non-expanded steps
    if (step.branches.length === 0) {
      step.branches = inferBranches(step.description, index, steps.length)
    }

    // Refine type based on refined logic
    if (index === 0) {
      step.type = inferType(step.title, step.branches) === 'trigger' ? 'trigger' : step.type
    } else if (index === steps.length - 1) {
      step.type = inferType(step.title, step.branches) === 'end' ? 'end' : step.type
    } else if (step.type !== 'decision') {
      step.type = inferType(step.title, step.branches)
    }

    return step
  })
}