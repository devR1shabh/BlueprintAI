export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall through to textarea copy for restricted clipboard contexts.
    }
  }

  const el = document.createElement('textarea')
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'fixed'
  el.style.top = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export function downloadTextFile({ content, filename, mimeType = 'text/plain;charset=utf-8' }) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function createSafeFilename(value, fallback = 'workflow') {
  const source = value || fallback
  const safe = source
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  return safe || fallback
}

export function createWorkflowExport(outputs) {
  return {
    summary: outputs.summary,
    steps: outputs.steps,
    roles: outputs.roles,
    risks: outputs.risks,
    compliance: outputs.compliance,
    sop: outputs.sop,
    mermaid: outputs.mermaidSyntax,
  }
}

export function stringifyWorkflowExport(outputs) {
  return JSON.stringify(createWorkflowExport(outputs), null, 2)
}
