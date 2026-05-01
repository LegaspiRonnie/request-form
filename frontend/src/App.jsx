import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { submitRequest } from './lib/api'
import Swal from 'sweetalert2'

const REASONS = [
  { value: 'Request Customize', label: 'Request Customize' },
  { value: 'Buying Source Code', label: 'Buying Source Code' },
  {
    value: 'System Creation or Request to Make a System',
    label: 'System Creation or Request to Make a System',
  },
  { value: 'Other', label: 'Other' },
]

function isValidUrl(value) {
  if (!value) return true
  try {
    // Accept http(s) URLs. Users often paste facebook.com links without protocol.
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`
    const url = new URL(normalized)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeUrl(value) {
  if (!value) return ''
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function validate(values) {
  const next = {}

  if (!values.fullName.trim()) next.fullName = 'Full name is required.'
  if (!values.reason) next.reason = 'Reason is required.'
  if (!values.description.trim())
    next.description = 'Reason description is required.'

  if (values.fbUrl && !isValidUrl(values.fbUrl)) {
    next.fbUrl = 'Please enter a valid URL (e.g. https://facebook.com/...).'
  }

  return next
}

function App() {
  useEffect(() => {
    const slug = (import.meta.env.VITE_ENTRY_SLUG || '').trim().replace(/^\/+|\/+$/g, '')
    if (!slug) return

    const desired = `/${slug}`
    const current = window.location.pathname.replace(/\/+$/g, '')
    if (current !== desired) {
      window.history.replaceState(null, '', `${desired}${window.location.search}${window.location.hash}`)
    }
  }, [])

  const [values, setValues] = useState({
    fullName: '',
    reason: 'Request Customize',
    description: '',
    fbUrl: '',
  })

  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const liveErrors = useMemo(() => validate(values), [values])
  const isValid = useMemo(() => Object.keys(liveErrors).length === 0, [liveErrors])

  function updateField(name, value) {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    setErrors(validate(nextValues))
  }

  function markTouched(name) {
    setTouched((t) => ({ ...t, [name]: true }))
  }

  async function onSubmit(e) {
    e.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    setTouched({
      fullName: true,
      reason: true,
      description: true,
      fbUrl: true,
    })

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        full_name: values.fullName.trim(),
        reason: values.reason,
        description: values.description.trim(),
        fb_url: values.fbUrl ? normalizeUrl(values.fbUrl.trim()) : '',
      }

      const res = await submitRequest(payload)
      await Swal.fire({
        icon: 'success',
        title: 'Request submitted',
        text: res?.message || 'Request submitted successfully.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6d28d9',
      })
      setValues({
        fullName: '',
        reason: 'Request Customize',
        description: '',
        fbUrl: '',
      })
      setTouched({})
      setErrors({})
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.'
      await Swal.fire({
        icon: 'error',
        title: 'Submission failed',
        text: message,
        confirmButtonText: 'OK',
        confirmButtonColor: '#6d28d9',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="bg" aria-hidden="true" />
      <main className="wrap">
        <section className="card">
          <header className="header">
            <div className="badge">Request Form</div>
            <h1 className="title">Submit a request</h1>
            <p className="subtitle">
              Fill out the details below. We’ll get back to you as soon as
              possible.
            </p>
          </header>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                value={values.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                onBlur={() => markTouched('fullName')}
                aria-invalid={Boolean(touched.fullName && errors.fullName)}
              />
              {touched.fullName && errors.fullName ? (
                <div className="error">{errors.fullName}</div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="reason">Reason *</label>
              <select
                id="reason"
                name="reason"
                value={values.reason}
                onChange={(e) => updateField('reason', e.target.value)}
                onBlur={() => markTouched('reason')}
                aria-invalid={Boolean(touched.reason && errors.reason)}
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {touched.reason && errors.reason ? (
                <div className="error">{errors.reason}</div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="description">Reason Description *</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Explain what you need (requirements, details, links, deadline, etc.)"
                value={values.description}
                onChange={(e) => updateField('description', e.target.value)}
                onBlur={() => markTouched('description')}
                aria-invalid={Boolean(touched.description && errors.description)}
              />
              {touched.description && errors.description ? (
                <div className="error">{errors.description}</div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="fbUrl">FB URL Link (optional)</label>
              <input
                id="fbUrl"
                name="fbUrl"
                type="url"
                placeholder="https://facebook.com/yourprofile"
                value={values.fbUrl}
                onChange={(e) => updateField('fbUrl', e.target.value)}
                onBlur={() => markTouched('fbUrl')}
                aria-invalid={Boolean(touched.fbUrl && errors.fbUrl)}
              />
              {touched.fbUrl && errors.fbUrl ? (
                <div className="error">{errors.fbUrl}</div>
              ) : (
                <div className="hint">We’ll only use this if needed.</div>
              )}
            </div>

            <div className="actions">
              <button
                className="btn"
                type="submit"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Request'}
              </button>
              <div className="meta">
                By submitting, you confirm the details are accurate.
              </div>
            </div>
          </form>
        </section>

        <footer className="footer">
          <span className="footnote">
            API: <code>{import.meta.env.VITE_API_BASE_URL || '(not set)'}</code>
          </span>
        </footer>
      </main>
    </div>
  )
}

export default App
