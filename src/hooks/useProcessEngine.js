/**
 * useProcessEngine.js
 * Orchestrates all engine functions in the correct sequence.
 * Manages processing status and surfaces outputs to Workspace.
 *
 * Usage:
 *   const { run, outputs, status, error } = useProcessEngine()
 *   await run(rawInput)
 *
 * v0.2 migration:
 *   Each engine import below becomes an async API call.
 *   The hook's external interface (run, outputs, status, error) is unchanged.
 *   Workspace.jsx needs zero modifications.
 */

import { useState, useCallback } from 'react'
import { summarize }      from '../engine/summarizer.js'
import { extractSteps }   from '../engine/stepExtractor.js'
import { extractRoles }   from '../engine/roleExtractor.js'
import { analyzeRisks }   from '../engine/riskAnalyzer.js'
import { generateSOP }    from '../engine/sopGenerator.js'
import { buildMermaid }   from '../engine/mermaidBuilder.js'

// ─── Output shape (null = not yet generated) ──────────────────────────────────

const EMPTY_OUTPUTS = {
  summary:       null,   // { title, overview, scope, objective, stepCount, estimatedComplexity }
  steps:         [],     // Step[]
  roles:         [],     // Role[]
  risks:         [],     // Risk[]
  sop:           null,   // string
  mermaidSyntax: null,   // string
}

// ─── Micro-delay ─────────────────────────────────────────────────────────────
// Gives React time to paint the 'processing' state before synchronous
// engine work blocks the main thread. Remove in v0.2 (async API calls
// won't need this since they naturally yield control).

function tick(ms = 30) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProcessEngine() {
  const [status,  setStatus]  = useState('idle')  // 'idle' | 'processing' | 'ready' | 'error'
  const [outputs, setOutputs] = useState(EMPTY_OUTPUTS)
  const [error,   setError]   = useState(null)

  /**
   * Run the full engine pipeline against rawInput.
   * Resolves to the outputs object on success.
   * @param {string} rawInput
   */
  const run = useCallback(async (rawInput) => {
    if (!rawInput || !rawInput.trim()) return
    if (status === 'processing') return

    setStatus('processing')
    setError(null)

    try {
      // Yield to React paint cycle so the spinner renders before CPU work starts
      await tick()

      // ── Stage 1: Steps (everything downstream depends on this) ────────────
      const steps = extractSteps(rawInput)

      await tick()

      // ── Stage 2: Roles (depends on steps + raw text) ──────────────────────
      const roles = extractRoles(steps, rawInput)

      await tick()

      // ── Stage 3: Summary (uses stepCount from Stage 1) ────────────────────
      const summary = summarize(rawInput, steps.length)

      await tick()

      // ── Stage 4: Risks (depends on steps + roles) ─────────────────────────
      const risks = analyzeRisks(steps, roles)

      await tick()

      // ── Stage 5: SOP (depends on all upstream outputs) ────────────────────
      const sop = generateSOP({ summary, steps, roles, risks })

      await tick()

      // ── Stage 6: Mermaid diagram (depends on steps + roles) ───────────────
      const mermaidSyntax = buildMermaid(steps, roles)

      // ── Atomic state update ───────────────────────────────────────────────
      // All outputs written in a single setState call so React re-renders
      // everything at once, not in six separate paints.
      const result = { summary, steps, roles, risks, sop, mermaidSyntax }
      setOutputs(result)
      setStatus('ready')

      return result

    } catch (err) {
      console.error('[BlueprintAI] Engine error:', err)
      setError(err.message || 'An unexpected error occurred during analysis.')
      setStatus('error')
      return null
    }
  }, [status])

  /**
   * Reset all state back to idle, clearing outputs and errors.
   */
  const reset = useCallback(() => {
    setStatus('idle')
    setOutputs(EMPTY_OUTPUTS)
    setError(null)
  }, [])

  return { run, reset, outputs, status, error }
}