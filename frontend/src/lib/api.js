import axios from 'axios'

const api = axios.create({
  timeout: 15000,
})

export async function submitRequest(payload) {
  const baseURL = (import.meta.env.VITE_API_BASE_URL || '').trim()
  const endpoint = baseURL
    ? `${baseURL.replace(/\/+$/g, '')}/submit_request.php`
    : '/api/submit_request'

  const { data } = await api.post(endpoint, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!data || data.status !== 'success') {
    const message = data?.message || 'Request failed.'
    const err = new Error(message)
    err.response = { data }
    throw err
  }
  return data
}

