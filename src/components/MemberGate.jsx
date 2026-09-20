import { Link } from 'react-router-dom'

/* The sign-up prompt card used by the Community member gates —
   inline over blurred content, and inside the click-intercept modal. */
export function MemberGateCard({ onClose }) {
  return (
    <div className="comm-gate-card">
      {onClose && (
        <button className="gate-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
      <span className="t-label comm-gate-label">Members only</span>
      <h2 className="t-h3">Join the K-TRIP community</h2>
      <p className="t-small t-muted">
        Sign up to read every post, ask questions and find travel companions.
      </p>
      <Link to="/signup" className="btn btn-primary">
        Sign Up
      </Link>
      <Link to="/login" className="t-caption t-muted comm-gate-login">
        Already a member? Login
      </Link>
    </div>
  )
}

/* Modal shown when a non-member clicks a post or Create Post. */
export function MemberGateModal({ open, onClose }) {
  if (!open) return null
  return (
    <div className="gate-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <MemberGateCard onClose={onClose} />
      </div>
    </div>
  )
}
