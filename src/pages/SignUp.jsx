import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'

export default function SignUp() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await signup({ email, nickname, password })
      navigate('/')
    } catch (err) {
      // Backend rejects duplicate email or duplicate nickname with a 400 and
      // a Korean detail message (see auth_service.py) — shown as-is.
      setError(err instanceof ApiError ? err.message : 'Sign up failed. Please try again.')
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
        <h1 className="t-h3 login-title">Create your account</h1>
        <p className="t-small t-muted login-sub">Join the community and keep your trip in sync.</p>

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
            <span className="field-label">Nickname</span>
            <input
              className="field-input"
              type="text"
              placeholder="How you'll appear to other travelers"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="field-input"
              type="password"
              placeholder="8+ characters"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Confirm password</span>
            <input
              className="field-input"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>
          {error && <p className="t-caption signup-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="login-divider">
          <span className="t-caption t-faint">Already a member?</span>
        </div>
        <Link to="/login" className="btn btn-outline login-btn">
          Login
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
