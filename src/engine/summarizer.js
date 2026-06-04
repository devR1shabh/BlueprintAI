/**
 * summarizer.js
 * Extracts a structured process summary from raw input text.
 *
 * Returns a Summary object:
 *   { title, overview, scope, objective, stepCount, estimatedComplexity }
 *
 * v0.2 migration: replace the body of `summarize()` with an API call.
 * The return shape and all consumers remain unchanged.
 */

// ─── Complexity heuristic ─────────────────────────────────────────────────────

/**
 * Estimate process complexity based on word count, connector density,
 * and presence of conditional/exception language.
 * @param {string} text
 * @param {number} stepCount
 * @returns {'Low' | 'Medium' | 'High'}
 */
function estimateComplexity(text, stepCount) {
  const lower = text.toLowerCase()
  const wordCount = text.trim().split(/\s+/).length

  const conditionalKeywords = [
    'if ', 'unless ', 'in case', 'except ', 'otherwise', 'alternatively',
    'depending on', 'should ', 'must ', 'may ', 'might ',
  ]
  const conditionalScore = conditionalKeywords.reduce(
    (acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0
  )

  const exceptionKeywords = ['escalat', 'exception', 'fallback', 'failure', 'reject', 'retry']
  const exceptionScore = exceptionKeywords.reduce(
    (acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0
  )

  const score = stepCount + conditionalScore * 2 + exceptionScore * 2 + Math.floor(wordCount / 80)

  if (score >= 14) return 'High'
  if (score >= 7)  return 'Medium'
  return 'Low'
}

// ─── Title inference ──────────────────────────────────────────────────────────

/**
 * Infer a short process title from the first meaningful sentence.
 * @param {string} text
 * @returns {string}
 */
function inferTitle(text) {
  const cleaned = text.trim()

  // If it starts with a heading-like line (short, no period), use it
  const firstLine = cleaned.split('\n')[0].trim()
  if (firstLine.length > 0 && firstLine.length < 80 && !firstLine.includes('.')) {
    return toTitleCase(firstLine.replace(/[:#\-–—]+$/, '').trim())
  }

  // Otherwise derive from first sentence
  const firstSentence = cleaned.split(/[.!?\n]/)[0].trim()
  const words = firstSentence.split(/\s+/).slice(0, 8).join(' ')
  return toTitleCase(words) || 'Business Process'
}

function toTitleCase(str) {
  const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => (i === 0 || !stopWords.has(word)) ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(' ')
}

// ─── Scope extraction ─────────────────────────────────────────────────────────

/**
 * Extract a short scope description (who/what is involved at a high level).
 * @param {string} text
 * @returns {string}
 */
function extractScope(text) {
  const lower = text.toLowerCase()

  const deptKeywords = [
    'customer', 'client', 'user', 'employee', 'manager', 'team', 'department',
    'system', 'platform', 'portal', 'service', 'vendor', 'partner', 'stakeholder',
    'finance', 'hr', 'it', 'operations', 'sales', 'support', 'legal', 'compliance',
  ]

  const found = deptKeywords.filter(kw => lower.includes(kw))
  const unique = [...new Set(found.map(w => toTitleCase(w)))]

  if (unique.length === 0) return 'Internal organizational process'
  if (unique.length === 1) return `Process involving ${unique[0]}`
  if (unique.length === 2) return `Process involving ${unique[0]} and ${unique[1]}`
  return `Cross-functional process involving ${unique.slice(0, -1).join(', ')}, and ${unique[unique.length - 1]}`
}

// ─── Objective extraction ─────────────────────────────────────────────────────

/**
 * Extract or infer the primary objective of the process.
 * @param {string} text
 * @returns {string}
 */
function extractObjective(text) {
  const lower = text.toLowerCase()

  // Look for explicit purpose statements
  const purposePatterns = [
    /(?:purpose|goal|objective|aim|intent)(?:\s+is)?\s*(?:to|:)\s*([^.!?\n]{10,80})/i,
    /(?:in order to|so that|to ensure|to enable|to allow)\s+([^.!?\n]{10,80})/i,
    /^(?:this process|the process)\s+(?:is designed to|aims to|enables|ensures)\s+([^.!?\n]{10,80})/im,
  ]

  for (const pattern of purposePatterns) {
    const match = text.match(pattern)
    if (match?.[1]) return capitalise(match[1].trim())
  }

  // Fallback: infer from common domain keywords
  if (lower.includes('onboard')) return 'Streamline the onboarding experience for new participants'
  if (lower.includes('invoice') || lower.includes('payment')) return 'Ensure accurate and timely processing of financial transactions'
  if (lower.includes('support') || lower.includes('ticket')) return 'Resolve customer issues efficiently and improve satisfaction'
  if (lower.includes('hire') || lower.includes('recruit')) return 'Attract, evaluate, and hire qualified candidates'
  if (lower.includes('deploy') || lower.includes('release')) return 'Deliver software changes reliably to production environments'
  if (lower.includes('approv')) return 'Ensure proper authorisation before proceeding with key actions'
  if (lower.includes('audit') || lower.includes('compliance')) return 'Maintain regulatory compliance and operational accountability'

  // Generic fallback from first sentence verb phrase
  const firstSentence = text.trim().split(/[.!?\n]/)[0]
  if (firstSentence.length > 20) return capitalise(firstSentence.trim())

  return 'Ensure consistent execution of the described business process'
}

function capitalise(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ─── Overview builder ─────────────────────────────────────────────────────────

/**
 * Build a clean 2–3 sentence overview from the raw text.
 * @param {string} text
 * @returns {string}
 */
function buildOverview(text) {
  // Split into sentences, clean up whitespace
  const sentences = text
    .trim()
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)

  if (sentences.length === 0) return text.trim()

  // Take first 2–3 substantive sentences but cap at 300 chars
  let overview = ''
  for (const sentence of sentences.slice(0, 3)) {
    if ((overview + ' ' + sentence).length > 320) break
    overview = (overview + ' ' + sentence).trim()
  }

  return overview || sentences[0]
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {string} rawInput
 * @param {number} stepCount  — pass in after stepExtractor runs
 * @returns {{
 *   title: string,
 *   overview: string,
 *   scope: string,
 *   objective: string,
 *   stepCount: number,
 *   estimatedComplexity: 'Low' | 'Medium' | 'High'
 * }}
 */
export function summarize(rawInput, stepCount = 0) {
  if (!rawInput || !rawInput.trim()) {
    return {
      title: 'Untitled Process',
      overview: '',
      scope: '',
      objective: '',
      stepCount: 0,
      estimatedComplexity: 'Low',
    }
  }

  return {
    title:               inferTitle(rawInput),
    overview:            buildOverview(rawInput),
    scope:               extractScope(rawInput),
    objective:           extractObjective(rawInput),
    stepCount,
    estimatedComplexity: estimateComplexity(rawInput, stepCount),
  }
}