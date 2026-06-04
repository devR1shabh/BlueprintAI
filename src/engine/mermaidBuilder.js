/**
 * mermaidBuilder.js
 * Generates valid Mermaid.js flowchart syntax from extracted steps and roles.
 *
 * Returns a string of Mermaid syntax ready to pass to mermaid.render().
 *
 * v0.2 migration: replace body of `buildMermaid()` with an API call.
 * The return type (string) stays the same — MermaidDiagram needs no changes.
 */

// ─── Sanitisation ─────────────────────────────────────────────────────────────

/**
 * Mermaid node labels cannot contain: quotes, backticks, certain brackets.
 * We sanitise to a safe subset.
 */
function sanitiseLabel(str) {
  return str
    .replace(/"/g, "'")
    .replace(/`/g, "'")
    .replace(/[<>]/g, '')
    .replace(/[[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 48)  // keep node labels readable
}

function sanitiseId(str) {
  return str
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1')  // ids can't start with digit
}

// ─── Node shape selector ──────────────────────────────────────────────────────

/**
 * Map step type to Mermaid node shape syntax.
 *
 * trigger  → stadium shape  ([label])
 * action   → rounded rect   (label)
 * decision → rhombus        {label}
 * end      → stadium shape  ([label])
 */
function nodeShape(step, label) {
  const safe = sanitiseLabel(label)
  switch (step.type) {
    case 'trigger':  return `([${safe}])`
    case 'decision': return `{${safe}}`
    case 'end':      return `([${safe}])`
    default:         return `(${safe})`     // action
  }
}

// ─── Role colour classes ──────────────────────────────────────────────────────
// Mermaid classDef + class assignment for visual role grouping

const ROLE_STYLE_MAP = {
  human:    { class: 'humanNode',    style: 'fill:#1e2d4a,stroke:#3b6fd4,stroke-width:1.5px,color:#a5b8fc' },
  system:   { class: 'systemNode',   style: 'fill:#1a2e1a,stroke:#3a7d3a,stroke-width:1.5px,color:#86efac' },
  external: { class: 'externalNode', style: 'fill:#2d1e1e,stroke:#c0392b,stroke-width:1.5px,color:#fca5a5' },
  decision: { class: 'decisionNode', style: 'fill:#2d2b1e,stroke:#c0a739,stroke-width:1.5px,color:#fde68a' },
  trigger:  { class: 'triggerNode',  style: 'fill:#1e1a2d,stroke:#7c3aed,stroke-width:2px,color:#c4b5fd'  },
  end:      { class: 'endNode',      style: 'fill:#1a1a2d,stroke:#6366f1,stroke-width:2px,color:#a5b4fc'  },
}

// ─── Actor → role type lookup ─────────────────────────────────────────────────

function resolveNodeClass(step, roles) {
  if (step.type === 'trigger')  return 'triggerNode'
  if (step.type === 'end')      return 'endNode'
  if (step.type === 'decision') return 'decisionNode'

  // Find the role whose name matches the step actor
  const lowerActor = step.actor.toLowerCase()
  const matchedRole = roles.find(r =>
    r.name.toLowerCase().includes(lowerActor) ||
    lowerActor.includes(r.name.toLowerCase())
  )

  if (matchedRole) {
    return ROLE_STYLE_MAP[matchedRole.type]?.class || 'humanNode'
  }
  return 'humanNode'
}

// ─── Subgraph grouping by actor ───────────────────────────────────────────────

/**
 * Groups steps by actor into subgraphs (swim lanes).
 * Returns a Map<actorName, step[]>
 */
function groupByActor(steps) {
  const groups = new Map()
  for (const step of steps) {
    const actor = step.actor || 'Process Actor'
    if (!groups.has(actor)) groups.set(actor, [])
    groups.get(actor).push(step)
  }
  return groups
}

// ─── Edge label builder ───────────────────────────────────────────────────────

function edgeLabel(fromStep, toStep) {
  // Decision nodes get Yes/No branch labels for the first two exits
  if (fromStep.type === 'decision') return '-->|Yes|'

  // Trigger → first action
  if (fromStep.type === 'trigger') return '-->'

  return '-->'
}

// ─── Main builder ─────────────────────────────────────────────────────────────

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

  // ── Class definitions ──────────────────────────────────────────────────────
  lines.push('')
  lines.push('    %% Node style classes')
  for (const [, val] of Object.entries(ROLE_STYLE_MAP)) {
    lines.push(`    classDef ${val.class} ${val.style}`)
  }

  // ── Node definitions ───────────────────────────────────────────────────────
  lines.push('')
  lines.push('    %% Process nodes')

  const nodeIds = []   // track insertion order
  const nodeClassMap = new Map()

  for (const step of steps) {
    const id    = sanitiseId(step.id)
    const shape = nodeShape(step, step.title)
    const cls   = resolveNodeClass(step, roles)

    lines.push(`    ${id}${shape}`)
    nodeIds.push(id)
    nodeClassMap.set(id, cls)
  }

  // ── Edges ──────────────────────────────────────────────────────────────────
  lines.push('')
  lines.push('    %% Flow connections')

  for (let i = 0; i < steps.length - 1; i++) {
    const fromId = sanitiseId(steps[i].id)
    const toId   = sanitiseId(steps[i + 1].id)
    const arrow  = edgeLabel(steps[i], steps[i + 1])

    lines.push(`    ${fromId} ${arrow} ${toId}`)

    // Decision nodes also need a No path back or to next+1 if available
    if (steps[i].type === 'decision' && i + 2 < steps.length) {
      const altId = sanitiseId(steps[i + 2].id)
      lines.push(`    ${fromId} -->|No| ${altId}`)
    }
  }

  // ── Class assignments ──────────────────────────────────────────────────────
  lines.push('')
  lines.push('    %% Class assignments')

  // Group by class for compact syntax
  const classGroups = new Map()
  for (const [nodeId, cls] of nodeClassMap) {
    if (!classGroups.has(cls)) classGroups.set(cls, [])
    classGroups.get(cls).push(nodeId)
  }
  for (const [cls, ids] of classGroups) {
    lines.push(`    class ${ids.join(',')} ${cls}`)
  }

  // ── Actor subgraph annotations (as comments, not subgraphs) ───────────────
  // Note: Mermaid subgraphs work but can break auto-layout in some renderers.
  // We use comments to annotate actor groupings, keeping the diagram clean.
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