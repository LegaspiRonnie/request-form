export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // Same-origin request from Vercel frontend; allow anyway.
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }

  const backendBase = process.env.BACKEND_BASE_URL
  if (!backendBase) {
    return res
      .status(500)
      .json({ status: 'error', message: 'Missing BACKEND_BASE_URL on server.' })
  }

  const target = `${backendBase.replace(/\/+$/g, '')}/submit_request.php`

  try {
    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        // Forward as JSON (our PHP supports it), simpler than parsing form on Vercel.
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body ?? {}),
    })

    const text = await upstream.text()
    // Backend should return JSON; if not, pass text through as error.
    try {
      const json = JSON.parse(text)
      return res.status(upstream.status).json(json)
    } catch {
      return res.status(502).json({
        status: 'error',
        message: 'Upstream returned non-JSON response.',
        upstream_status: upstream.status,
        upstream_body: text,
      })
    }
  } catch (e) {
    return res.status(502).json({ status: 'error', message: 'Upstream request failed.' })
  }
}

