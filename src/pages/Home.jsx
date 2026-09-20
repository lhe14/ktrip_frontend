import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Rating from '../components/Rating'
import { useTrip } from '../context/TripContext'
import { getItinerary } from '../services/itinerary'
import { categoryFromTheme } from '../services/places'
import { getBoardPosts } from '../services/board'

// Fetches GET /itinerary live whenever the completed trip's own selections
// change. The backend's day_plans is the source of truth — no client-side
// caching or mock fallback, so a stale trip never shows old results.
function useItinerary(trip) {
  const [state, setState] = useState({ status: 'idle', days: [], error: '' })
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    if (!trip.completed) {
      setState({ status: 'idle', days: [], error: '' })
      return
    }
    let active = true
    setState({ status: 'loading', days: [], error: '' })
    getItinerary({
      categories: trip.interests,
      region: trip.destination,
      days: parseInt(trip.duration, 10) || 3,
      pace: trip.pace,
    })
      .then((data) => {
        if (active) setState({ status: 'ready', days: data, error: '' })
      })
      .catch((err) => {
        if (active) setState({ status: 'error', days: [], error: err.message })
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.completed, trip.interests.join(','), trip.destination, trip.duration, trip.pace, retryToken])

  return { ...state, retry: () => setRetryToken((t) => t + 1) }
}

export default function Home() {
  const [view, setView] = useState('compact')
  const { trip } = useTrip()
  const itinerary = useItinerary(trip)

  return (
    <div className="page">
      <Header />

      {/* ---------------- Hero ---------------- */}
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-copy">
            <span className="t-label home-hero-label">Personal travel platform</span>
            <h1 className="t-display">
              Discover
              <br />
              Korea
              <br />
              your way.
            </h1>
            <p className="t-body t-muted home-hero-desc">
              Enjoy a personal journey and a community of travelers. Customize your interests and
              K-TRIP builds a trip that is yours alone.
            </p>
            <div className="home-hero-actions">
              <Link to="/welcome" className="btn btn-primary">
                Customize
              </Link>
              <Link to="/explore" className="btn btn-outline">
                Explore Korea
              </Link>
            </div>
          </div>
          <div className="home-hero-visual">
            <div className="sphere home-sphere" />
            <div className="sphere-shadow" />
          </div>
        </div>
      </section>

      {/* ---------------- YOUR TRIP ----------------
          The section is always visible; itinerary data only appears after the
          user has completed the customization flow (trip.completed). */}
      <section className="section your-trip">
        <div className="container">
          <div className="your-trip-head">
            <div>
              {trip.completed && (
                <span className="t-label your-trip-label">
                  {trip.destination} · {trip.duration} · {trip.pace}
                </span>
              )}
              <h2 className="t-h1">YOUR TRIP</h2>
              <p className="t-body t-muted your-trip-sub">An AI-powered itinerary made around you.</p>
            </div>
            {trip.completed && itinerary.status === 'ready' && itinerary.days.length > 0 && (
              <div className="view-toggle" role="tablist" aria-label="Trip view">
                <button
                  role="tab"
                  aria-selected={view === 'compact'}
                  className={`view-toggle-btn ${view === 'compact' ? 'is-active' : ''}`}
                  onClick={() => setView('compact')}
                >
                  COMPACT
                </button>
                <button
                  role="tab"
                  aria-selected={view === 'detailed'}
                  className={`view-toggle-btn ${view === 'detailed' ? 'is-active' : ''}`}
                  onClick={() => setView('detailed')}
                >
                  DETAILED
                </button>
              </div>
            )}
          </div>

          {!trip.completed ? (
            <Link to="/welcome" className="trip-empty">
              <span className="t-label t-faint">No trip yet</span>
              <p className="t-h3 trip-empty-msg">
                Complete your custom trip first to see your itinerary here.
              </p>
              <span className="btn btn-primary">Customize</span>
            </Link>
          ) : itinerary.status === 'loading' ? (
            <ItineraryState message="Building your itinerary…" />
          ) : itinerary.status === 'error' ? (
            <ItineraryState message={itinerary.error} isError onRetry={itinerary.retry} />
          ) : itinerary.days.length === 0 ? (
            <ItineraryState message="No itinerary could be generated for these choices yet. Try a different destination or interests." />
          ) : view === 'compact' ? (
            <CompactTrip days={itinerary.days} />
          ) : (
            <DetailedTrip days={itinerary.days} />
          )}
        </div>
      </section>

      {/* ---------------- Follow the trip CTA — belongs to the trip, so gated too ---------------- */}
      {trip.completed && (
        <section className="section home-cta">
          <div className="container home-cta-inner">
            <h2 className="t-h2">Not your trip yet?</h2>
            <p className="t-body t-muted">
              Change your interests, destination or pace — the itinerary follows you.
            </p>
            <Link to="/welcome" className="btn btn-outline">
              Re-customize
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}

function ItineraryState({ message, isError = false, onRetry }) {
  return (
    <div className={`api-state ${isError ? 'is-error' : ''}`} role={isError ? 'alert' : 'status'}>
      <p className="t-body t-muted">{message}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

// Each itinerary place only carries a K-TRIP relevance score, not a review
// rating — the real ratings live on Community's REVIEW-category board posts
// (see PlaceDetail.jsx), keyed by place_id. Fetched once and grouped here so
// the detailed day list can show each place's real average rating.
function usePlaceRatings() {
  const [ratings, setRatings] = useState(new Map())

  useEffect(() => {
    let active = true
    getBoardPosts({ category: 'REVIEW', limit: 100 })
      .then((posts) => {
        if (!active) return
        const grouped = new Map()
        posts.forEach((post) => {
          if (post.place_id == null || post.rating == null) return
          const entry = grouped.get(post.place_id) || { sum: 0, count: 0 }
          entry.sum += post.rating
          entry.count += 1
          grouped.set(post.place_id, entry)
        })
        setRatings(grouped)
      })
      .catch(() => {
        if (active) setRatings(new Map())
      })
    return () => {
      active = false
    }
  }, [])

  return ratings
}

function PlaceThumb({ place }) {
  return place.first_image ? (
    <img src={place.first_image} alt={place.title} loading="lazy" />
  ) : (
    <span className="api-media-empty t-caption t-faint">IMAGE UNAVAILABLE</span>
  )
}

/* ---------------- Detailed: one editorial day at a time ---------------- */

function DetailedTrip({ days }) {
  const [dayIndex, setDayIndex] = useState(0)
  const total = days.length
  const safeIndex = Math.min(dayIndex, total - 1)
  const d = days[safeIndex]
  const places = d.places
  const placeRatings = usePlaceRatings()

  // Auto-advancing slideshow through that day's places. One interval drives
  // a single slideIndex, so every image region reading it stays in lockstep;
  // it resets and restarts whenever the selected day changes, and the
  // interval is always cleared on day change / unmount.
  const [slideIndex, setSlideIndex] = useState(0)
  useEffect(() => {
    setSlideIndex(0)
    if (places.length <= 1) return
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % places.length)
    }, 3000)
    return () => clearInterval(id)
  }, [safeIndex, places.length])

  return (
    <div className="fade-in" key={safeIndex}>
      <article className="trip-day">
        <div className="trip-day-media">
          <div className="ph ph-hover trip-day-img trip-day-slideshow">
            {places.length === 0 ? (
              <PlaceThumb place={{}} />
            ) : (
              places.map((p, i) => (
                <div key={p.id} className={`trip-day-slide ${i === slideIndex ? 'is-active' : ''}`}>
                  <PlaceThumb place={p} />
                </div>
              ))
            )}
          </div>
        </div>
        <div className="trip-day-info">
          <div className="trip-day-head">
            <span className="trip-day-num">DAY {d.day_index}</span>
          </div>
          {d.places.length === 0 ? (
            <p className="t-small t-muted">No places could be found for this day.</p>
          ) : (
            <ul className="trip-places">
              {d.places.map((p, i) => {
                const rating = placeRatings.get(p.id)
                return (
                  <li key={p.id} className="trip-place">
                    <span className={`trip-place-time t-caption ${i === slideIndex ? 'is-active' : ''}`}>
                      {i + 1}
                    </span>
                    <div className="trip-place-row">
                      <Link to={`/place/${p.id}`} className="trip-place-name place-link">
                        {p.title}
                      </Link>
                      {p.theme_code && (
                        <span className="chip trip-place-cat">
                          {categoryFromTheme(p.theme_code) || p.theme_code.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {rating && (
                      <div className="trip-place-rating">
                        <Rating value={Math.round(rating.sum / rating.count)} size={14} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </article>

      <div className="trip-day-nav">
        <button
          className="trip-day-nav-btn"
          onClick={() => setDayIndex((i) => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          aria-label="Previous day"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>
        <span className="trip-day-nav-label">
          DAY {d.day_index} / {total}
        </span>
        <button
          className="trip-day-nav-btn"
          onClick={() => setDayIndex((i) => Math.min(total - 1, i + 1))}
          disabled={safeIndex === total - 1}
          aria-label="Next day"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ---------------- Compact: scannable full-trip overview ---------------- */

function CompactTrip({ days }) {
  // One shared tick drives every day card's slideshow, so all the image
  // regions on this screen cross-fade at the same moment instead of each
  // card running its own independent interval (each card just wraps the
  // shared tick by its own place count).
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="trip-compact fade-in">
      {days.map((d) => {
        const places = d.places
        const slideIndex = places.length > 0 ? tick % places.length : 0

        return (
          <article key={d.day_index} className="trip-compact-item">
            <div className="ph trip-compact-img">
              {places.length === 0 ? (
                <PlaceThumb place={{}} />
              ) : (
                places.map((p, i) => (
                  <div key={p.id} className={`trip-day-slide ${i === slideIndex ? 'is-active' : ''}`}>
                    <PlaceThumb place={p} />
                  </div>
                ))
              )}
            </div>
            <div className="trip-compact-info">
              <div className="trip-day-head">
                <span className="trip-day-num trip-day-num-sm">DAY {d.day_index}</span>
              </div>
              {places.length === 0 ? (
                <p className="t-small t-muted">No places could be found for this day.</p>
              ) : (
                <ul className="trip-compact-list">
                  {places.map((p, i) => (
                    <li key={p.id} className="trip-compact-place">
                      <span className={`trip-place-time t-caption ${i === slideIndex ? 'is-active' : ''}`}>
                        {i + 1}
                      </span>
                      <Link to={`/place/${p.id}`} className="t-small place-link">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
