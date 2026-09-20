import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <Link to="/" className="logo login-logo">
          K-TRIP
        </Link>
        <h1 className="t-h3 login-title">Welcome back</h1>
        <p className="t-small t-muted login-sub">Sign in to keep your trip in sync.</p>

        <form className="login-form" onSubmit={submit}>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="field-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="t-caption signup-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="login-divider">
          <span className="t-caption t-faint">New to K-TRIP?</span>
        </div>
        <Link to="/signup" className="btn btn-outline login-btn">
          Create Account
        </Link>

        <Link to="/" className="t-caption t-faint login-back">
          ← Back to K-TRIP
        </Link>
      </div>

      <div className="login-visual" aria-hidden="true">
        <div className="sphere login-sphere" />
      </div>
    </div>
  )
}
