import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

export async function submitRequest(payload) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error(
      'Missing VITE_API_BASE_URL. Create a .env file in /frontend.'
    )
  }
  const { data } = await api.post('/submit_request.php', payload)
  if (!data || data.status !== 'success') {
    const message = data?.message || 'Request failed.'
    const err = new Error(message)
    err.response = { data }
    throw err
  }
  return data
}

