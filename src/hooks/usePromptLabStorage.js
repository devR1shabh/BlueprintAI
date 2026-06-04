import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'blueprintai.promptLab.experiments.v1'

function readExperiments() {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeExperiments(experiments) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments))
}

function createExperiment({ prompt, output, notes, rating }) {
  const now = new Date().toISOString()

  return {
    id: `experiment_${Date.now()}`,
    prompt,
    output,
    notes,
    rating,
    timestamp: now,
    promptLength: prompt.length,
    outputLength: output.length,
  }
}

export function usePromptLabStorage() {
  const [experiments, setExperiments] = useState(() => readExperiments())

  useEffect(() => {
    writeExperiments(experiments)
  }, [experiments])

  const saveExperiment = useCallback((draft) => {
    const experiment = createExperiment(draft)
    setExperiments(current => [experiment, ...current])
    return experiment
  }, [])

  const deleteExperiment = useCallback((id) => {
    setExperiments(current => current.filter(experiment => experiment.id !== id))
  }, [])

  return {
    experiments,
    saveExperiment,
    deleteExperiment,
  }
}
