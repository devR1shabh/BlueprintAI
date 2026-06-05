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
  /^(?:the\s+)?([\w\s]{2,24}?)\s+(?:then\s+)?(?:review|approv|submit|send|notif|creat|assign|resolv|escalat|process|check|verif|confirm|complet|generat|log|record|updat|close|open|contact|inform|request|receive|reject|forward|handl|analyz|assess|evaluat)/i,
  /^([\w\s]{2,20}?)\s+(?:is|are)\s+responsible/i,
  /assigned\s+to\s+(?:the\s+)?([\w\s]{2,20})/i,
  /by\s+(?:the\s+)?([\w\s]{2,20}?)\s*[.,]/i,
]

const KNOWN_ACTORS = [
  'customer', 'client', 'user', 'agent', 'manager', 'supervisor', 'admin',
  'administrator', 'team', 'system', 'platform', 'portal', 'service',
  'employee', 'staff', 'operator', 'approver', 'reviewer', 'analyst',
  'coordinator', 'tier 1', 'tier 2', 'tier 3', 'level 1', 'level 2',
  'finance team', 'hr team', 'it team', 'support team', 'sales team',
  'management', 'department', 'vendor', 'supplier', 'partner',
  'hr', 'it', 'finance', 'legal', 'compliance',
]

// ─── Verb extraction for title synthesis ─────────────────────────────────────

const VERB_TITLE_MAP = [
  // pattern, present-tense verb for title
  [/\baccepts?\b/i,            'Accepts'],
  [/\battends?\b/i,            'Attends'],
  [/\bactivates?\b/i,          'Activates'],
  [/\bapprov/i,                'Approves'],
  [/\bassigns?\b/i,            'Assigns'],
  [/\baudits?\b/i,             'Audits'],
  [/\bchecks?\b(?!-)/i,         'Checks'],
  [/\bcloses?\b/i,             'Closes'],
  [/\bcomplet/i,               'Completes'],
  [/\bconfirms?\b/i,           'Confirms'],
  [/\bconfigur/i,              'Configures'],
  [/\bcontacts?\b/i,           'Contacts'],
  [/\bcoordinat/i,             'Coordinates'],
  [/\bcreates?\b/i,            'Creates'],
  [/\bconducts?\b/i,           'Conducts'],
  [/\bdelivers?\b/i,           'Delivers'],
  [/\bdeploys?\b/i,            'Deploys'],
  [/\bdiagnos/i,               'Diagnoses'],
  [/\bdocuments?\b/i,          'Documents'],
  [/\benrolls?\b/i,            'Enrolls'],
  [/\bschedul/i,               'Schedules'],
  [/\bescalat/i,               'Escalates'],
  [/\bevaluates?\b/i,          'Evaluates'],
  [/\bexecutes?\b/i,           'Executes'],
  [/\bforwards?\b/i,           'Forwards'],
  [/\bgenerates?\b/i,          'Generates'],
  [/\bhandles?\b/i,            'Handles'],
  [/\bimplements?\b/i,         'Implements'],
  [/\binitiates?\b/i,          'Initiates'],
  [/\binvestigates?\b/i,       'Investigates'],
  [/\blogs?\b/i,               'Logs'],
  [/\bmonitors?\b/i,           'Monitors'],
  [/\bnotif/i,                 'Notifies'],
  [/\bopens?\b/i,              'Opens'],
  [/\bperforms?\b/i,           'Performs'],
  [/\bprovides?\b/i,           'Provides'],
  [/\bprocesses?\b/i,          'Processes'],
  [/\bprovisions?\b/i,         'Provisions'],
  [/\breceives?\b/i,           'Receives'],
  [/\brecords?\b/i,            'Records'],
  [/\brejects?\b/i,            'Rejects'],
  [/\bresolves?\b/i,           'Resolves'],
  [/\breviews?\b/i,            'Reviews'],
  [/\bruns?\b/i,               'Runs'],
  [/\bscreens?\b/i,            'Screens'],
  [/\bsends?\b/i,              'Sends'],
  [/\bsets?\s+up\b/i,          'Sets Up'],
  [/\bset\s+up\b/i,            'Sets Up'],
  [/\bsubmits?\b/i,            'Submits'],
  [/\bupdates?\b/i,            'Updates'],
  [/\bvalidates?\b/i,          'Validates'],
  [/\bverif/i,                 'Verifies'],
]

// Key object nouns for title synthesis — ordered by specificity
const OBJECT_NOUNS = [
  // Onboarding/HR
  'offer letter', 'offer', 'orientation', 'onboarding', 'probation review',
  'compliance training', 'training', 'buddy', 'background check',
  'payroll', 'benefits', 'access credentials', 'credentials',
  'laptop', 'system access', 'email account', 'equipment',
  // Finance/procurement
  'invoice', 'payment', 'purchase order', 'budget', 'expense',
  'bank details', 'bank account', 'contract', 'agreement', 'quote',
  // Support/tickets
  'support ticket', 'ticket', 'complaint', 'issue', 'request',
  'satisfaction survey', 'survey', 'resolution', 'root cause',
  // Approval workflows
  'leave request', 'leave', 'approval', 'application', 'submission',
  'escalation', 'notification', 'report', 'document', 'checklist',
  // Vendor/procurement
  'vendor', 'supplier', 'registration', 'due diligence', 'screening',
  // General
  'review', 'audit', 'assessment', 'diagnosis', 'fix', 'solution',
  'check-in', '30-day check-in', '90-day check-in', 'follow-up',
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateId(index) {
  return `step_${String(index + 1).padStart(3, '0')}`
}

function capitalise(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function toTitleCase(str) {
  const stop = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by'])
  return str.split(' ').map((w, i) =>
    i === 0 || !stop.has(w.toLowerCase())
      ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      : w.toLowerCase()
  ).join(' ')
}

function inferActor(sentence) {
  const lower = sentence.toLowerCase()

  for (const actor of KNOWN_ACTORS) {
    if (lower.includes(actor)) {
      return actor.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
  }

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

// ─── Title synthesis ──────────────────────────────────────────────────────────

/**
 * Strips common filler openings that add no meaning to a step title.
 * Examples removed:
 *   "On day one, ..."          → content after comma
 *   "At the 90-day mark, ..."  → content after comma
 *   "The direct manager ..."   → kept, but "The" stripped
 */
function stripFillerOpening(sentence) {
  const lower = sentence.toLowerCase().trim()

  // Time/sequence openers: "On day one,", "At the 30-day mark,", "During week two,"
  const timeOpener = sentence.match(/^(?:on|at|during|after|before)\s+[\w\s-]+?,\s*/i)
  if (timeOpener) return sentence.slice(timeOpener[0].length)

  // "The [actor] ..." → strip only the leading "The "
  if (/^the\s/i.test(lower)) return sentence.slice(4)

  return sentence
}

/**
 * Extract the best actor label for the title (short, capitalised).
 * Returns e.g. "HR", "Manager", "IT Team", "Employee".
 */
function extractTitleActor(sentence) {
  const lower = sentence.toLowerCase()

  // Prefer short, recognisable role names for titles
  const TITLE_ACTORS = [
    ['hr team', 'HR'], ['it team', 'IT Team'], ['finance team', 'Finance'],
    ['support team', 'Support'], ['sales team', 'Sales'], ['legal team', 'Legal'],
    ['compliance', 'Compliance'], ['procurement', 'Procurement'],
    ['tier 2', 'Tier 2'], ['tier 1', 'Tier 1'],
    ['direct manager', 'Manager'], ['hiring manager', 'Manager'],
    ['manager', 'Manager'], ['supervisor', 'Supervisor'],
    ['employee', 'Employee'], ['new hire', 'Employee'],
    ['customer', 'Customer'], ['client', 'Client'],
    ['vendor', 'Vendor'], ['supplier', 'Supplier'],
    ['system', 'System'], ['platform', 'Platform'], ['portal', 'Portal'],
    ['agent', 'Agent'], ['approver', 'Approver'],
    ['admin', 'Admin'], ['analyst', 'Analyst'],
    ['coordinator', 'Coordinator'], ['reviewer', 'Reviewer'],
    ['hr', 'HR'], ['it', 'IT'], ['payroll', 'Payroll'], ['benefits', 'Benefits'],
  ]

  for (const [keyword, label] of TITLE_ACTORS) {
    if (lower.includes(keyword)) return label
  }

  return ''
}

/**
 * Extract the main action verb from a sentence for use in a title.
 * Returns present-tense verb e.g. "Completes", "Assigns", "Provisions".
 */
function extractTitleVerb(sentence) {
  for (const [pattern, verb] of VERB_TITLE_MAP) {
    if (pattern.test(sentence)) return verb
  }
  return ''
}

/**
 * Extract the most important object noun from the sentence.
 * Returns e.g. "Compliance Training", "Payroll", "Ticket".
 */
function extractTitleObject(sentence) {
  const lower = sentence.toLowerCase()
  for (const noun of OBJECT_NOUNS) {
    if (lower.includes(noun)) return toTitleCase(noun)
  }
  return ''
}

/**
 * Build a professional "Actor Verbs Object" title from a raw sentence.
 *
 * Priority:
 *   1. Actor + Verb + Object  →  "Employee Completes Compliance Training"
 *   2. Actor + Verb           →  "Manager Reviews"
 *   3. Verb + Object          →  "Complete Compliance Training"
 *   4. Verb only              →  "Review"  (rare fallback)
 *   5. First 5 words cleaned  →  last resort
 *
 * Hard cap: 48 chars.
 */
function buildTitle(sentence) {
  const stripped = stripFillerOpening(sentence.trim())
  const actor    = extractTitleActor(stripped)
  const verb     = extractTitleVerb(stripped)
  const obj      = extractTitleObject(stripped)

  let title = ''

  if (actor && verb && obj) {
    title = `${actor} ${verb} ${obj}`
  } else if (actor && verb) {
    title = `${actor} ${verb}`
  } else if (verb && obj) {
    title = `${verb} ${obj}`
  } else if (verb) {
    title = verb
  }

  // If synthesis produced a good result, use it
  if (title.length >= 5) {
    return title.length <= 48 ? title : title.slice(0, title.lastIndexOf(' ', 48)) || title.slice(0, 48)
  }

  // Last resort: clean the raw sentence and take first 5 words
  let clean = stripped.replace(/\s+/g, ' ').replace(/[.!?]+$/, '').trim()
  // Strip leading connector words
  for (const connector of STEP_CONNECTORS) {
    const pattern = new RegExp(`^${connector}[,\\s]+`, 'i')
    clean = clean.replace(pattern, '')
  }
  clean = capitalise(clean)
  const words = clean.split(' ').slice(0, 5).join(' ')
  return words.length <= 48 ? words : words.slice(0, 48)
}

// ─── Text splitter strategies ─────────────────────────────────────────────────

function splitByNumberedList(text) {
  const pattern = /(?:^|\n)\s*(?:\d+[\).:\-]|\([a-z]\))\s+/gm
  const parts = text.split(pattern).map(s => s.trim()).filter(s => s.length > 10)
  return parts.length >= 2 ? parts : null
}

function splitByBullets(text) {
  const pattern = /(?:^|\n)\s*[-*•◦▸►]\s+/gm
  const parts = text.split(pattern).map(s => s.trim()).filter(s => s.length > 10)
  return parts.length >= 2 ? parts : null
}

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

  const segments =
    splitByNumberedList(rawInput) ||
    splitByBullets(rawInput) ||
    splitByConnectors(rawInput) ||
    splitBySentences(rawInput)

  if (!segments || segments.length === 0) return []

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