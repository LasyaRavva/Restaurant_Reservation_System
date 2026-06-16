function normalizeApiBase(value) {
  const base = (value || 'http://localhost:5000').replace(/\/+$/, '')
  return base.endsWith('/api') ? base : `${base}/api`
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL)

async function readResponse(response) {
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || 'Request failed')
  }
  return payload
}

export async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  return readResponse(response)
}

export async function patchJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  return readResponse(response)
}
