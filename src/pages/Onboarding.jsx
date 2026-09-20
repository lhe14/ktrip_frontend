import { useNavigate, useParams } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import DurationWheel from '../components/DurationWheel'
import { CATEGORIES, DESTINATIONS, DURATIONS, PACES } from '../data/mockData'

const STEPS = ['welcome', 'interests', 'destination', 'duration', 'pace', 'ready']

export default function Onboarding() {
  const { step: stepParam } = useParams()
  const navigate = useNavigate()
  const { trip, update } = useTrip()

  const step = STEPS.includes(stepParam) ? stepParam : 'welcome'
  const stepIndex = STEPS.indexOf(step)

  const go = (s) => navigate(s === 'welcome' ? '/welcome' : `/welcome/${s}`)
  const next = () => go(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)])
  const back = () => go(STEPS[Math.max(stepIndex - 1, 0)])

  const toggleInterest = (c) =>
    update((t) => ({
      interests: t.interests.includes(c)
        ? t.interests.filter((i) => i !== c)
        : [...t.interests, c],
    }))

  const canContinue =
    step === 'interests' ? trip.interests.length > 0 : true

  return (
    <div className="ob" key={step}>
      {/* progress + brand */}
      <div className="ob-top">
        <span className="ob-brand">K-TRIP</span>
        {step !== 'welcome' && (
          <div className="ob-progress" aria-label={`Step ${stepIndex} of ${STEPS.length - 1}`}>
            {STEPS.slice(1).map((s, i) => (
              <span key={s} className={`ob-progress-dot ${i < stepIndex ? 'is-done' : ''}`} />
            ))}
          </div>
        )}
        <button className="ob-skip" onClick={() => navigate('/')}>
          SKIP
        </button>
      </div>

      {/* ---------------- WELCOME ---------------- */}
      {step === 'welcome' && (
        <div className="ob-body ob-welcome fade-in">
          <div className="ob-sphere-wrap">
            <div className="sphere ob-sphere" />
            <div className="sphere-shadow" />
          </div>
          <h1 className="ob-title t-h1">
            WELCOME TO K-TRIP
          </h1>
          <p className="ob-sub t-body t-muted">Discover Korea your way.</p>
          <button className="btn btn-primary" onClick={next}>
            Get Started
          </button>
        </div>
      )}

      {/* ---------------- INTERESTS ---------------- */}
      {step === 'interests' && (
        <div className="ob-body fade-in">
          <span className="ob-step-label t-label">01 — Interests</span>
          <h1 className="ob-title t-h2">WHAT ARE YOU INTO?</h1>
          <p className="ob-sub t-small t-muted">Pick as many as you like.</p>
          <div className="ob-circles">
            {CATEGORIES.map((c, i) => (
              <button
                key={c}
                className={`ob-circle ${trip.interests.includes(c) ? 'is-selected' : ''} ob-circle-${i % 2 === 0 ? 'red' : 'blue'}`}
                onClick={() => toggleInterest(c)}
                aria-pressed={trip.interests.includes(c)}
              >
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- DESTINATION ---------------- */}
      {step === 'destination' && (
        <div className="ob-body fade-in">
          <span className="ob-step-label t-label">02 — Destination</span>
          <h1 className="ob-title t-h2">WHERE ARE YOU GOING?</h1>
          <p className="ob-sub t-small t-muted">Choose your main destination.</p>
          <div className="ob-circles ob-circles-dense">
            {DESTINATIONS.map((d, i) => (
              <button
                key={d}
                className={`ob-circle ob-circle-sm ${trip.destination === d ? 'is-selected' : ''} ob-circle-${i % 2 === 0 ? 'blue' : 'red'}`}
                onClick={() => update({ destination: d })}
                aria-pressed={trip.destination === d}
              >
                <span>{d}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- DURATION ---------------- */}
      {step === 'duration' && (
        <div className="ob-body fade-in">
          <span className="ob-step-label t-label">03 — Duration</span>
          <h1 className="ob-title t-h2">HOW LONG ARE YOU STAYING?</h1>
          <p className="ob-sub t-small t-muted">You can change this any time.</p>
          <DurationWheel
            options={DURATIONS}
            value={trip.duration}
            onChange={(d) => update({ duration: d })}
          />
        </div>
      )}

      {/* ---------------- PACE ---------------- */}
      {step === 'pace' && (
        <div className="ob-body fade-in">
          <span className="ob-step-label t-label">04 — Pace</span>
          <h1 className="ob-title t-h2">WHAT'S YOUR PACE?</h1>
          <p className="ob-sub t-small t-muted">How full should your days be?</p>
          <div className="ob-pace">
            {PACES.map((p) => (
              <button
                key={p.id}
                className={`ob-pace-item ${trip.pace === p.id ? 'is-selected' : ''}`}
                onClick={() => update({ pace: p.id })}
                aria-pressed={trip.pace === p.id}
              >
                <span className="ob-pace-name">{p.id}</span>
                <span className="ob-pace-desc t-small t-muted">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- READY ---------------- */}
      {step === 'ready' && (
        <div className="ob-body ob-ready fade-in">
          <span className="ob-step-label t-label">Ready to explore</span>
          <h1 className="ob-title t-h2">YOUR KOREA, YOUR WAY</h1>
          <div className="ob-summary">
            <div className="ob-summary-row">
              <span className="t-label t-faint">Interest</span>
              <span className="ob-summary-val">{trip.interests.join(' · ') || '—'}</span>
            </div>
            <div className="ob-summary-row">
              <span className="t-label t-faint">Destination</span>
              <span className="ob-summary-val">{trip.destination}</span>
            </div>
            <div className="ob-summary-row">
              <span className="t-label t-faint">Duration</span>
              <span className="ob-summary-val">{trip.duration}</span>
            </div>
            <div className="ob-summary-row">
              <span className="t-label t-faint">Pace</span>
              <span className="ob-summary-val">{trip.pace}</span>
            </div>
          </div>
          <button
            className="btn btn-primary ob-create-btn"
            onClick={() => {
              // Home fetches GET /itinerary live from trip.interests/destination/
              // duration/pace whenever trip.completed flips true — no payload
              // needs to be pre-built or stored here.
              update({ completed: true })
              navigate('/')
            }}
          >
            Create My Trip
          </button>
        </div>
      )}

      {/* footer nav */}
      <div className="ob-bottom">
        {stepIndex > 0 ? (
          <button className="btn btn-ghost btn-sm" onClick={back}>
            ← Back
          </button>
        ) : (
          <span />
        )}
        {stepIndex > 0 && stepIndex < STEPS.length - 1 && (
          <button className="btn btn-primary btn-sm" onClick={next} disabled={!canContinue}>
            Continue
          </button>
        )}
      </div>
    </div>
  )
}
