import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Rating from '../components/Rating'
import DateRangeField from '../components/DateRangeField'
import { useAuth } from '../context/AuthContext'
import { useTrip } from '../context/TripContext'
import { MemberGateCard } from '../components/MemberGate'
import { ApiError } from '../services/api'
import { createBoardPost } from '../services/board'
import { getPlaces } from '../services/places'
import { getItinerary } from '../services/itinerary'
import { toBackendCommunityCategory } from '../data/apiMappings'

const POST_TYPES = ['Q&A', 'TIPS', 'REVIEW', 'COMPANION']
const REGIONS = ['SEOUL', 'INCHEON', 'GANGNEUNG', 'DAEJEON', 'GYEONGJU', 'BUSAN', 'JEJU']

export default function CreatePost() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { trip } = useTrip()

  // Arriving from a place's "Write a review" link (?category=REVIEW&region=
  // SEOUL&placeId=1&placeTitle=...) preselects that place instead of making
  // the user search again. Community's own "Create Post" entry point simply
  // carries no query params, so this has no effect there.
  const [searchParams] = useSearchParams()
  const presetCategory = searchParams.get('category')
  const presetRegion = searchParams.get('region')
  const presetPlaceId = searchParams.get('placeId')
  const presetPlaceTitle = searchParams.get('placeTitle')

  const [type, setType] = useState(POST_TYPES.includes(presetCategory) ? presetCategory : 'Q&A')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [region, setRegion] = useState(REGIONS.includes(presetRegion) ? presetRegion : '')
  const [rating, setRating] = useState(0)
  const [placeId, setPlaceId] = useState(presetPlaceId || '')
  const [placeQuery, setPlaceQuery] = useState(presetPlaceTitle || '')
  const [places, setPlaces] = useState([])
  const [tripDays, setTripDays] = useState([])
  const [tripDayIndex, setTripDayIndex] = useState(0)
  const [companionDestination, setCompanionDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelersNeeded, setTravelersNeeded] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // REVIEW posts need a real place_id. Place search is gated behind Region:
  // a region must be picked first, then this loads that region's places to
  // search/select from instead of one long unfiltered list. The selection is
  // only cleared once type/region actually change from their initial (mount)
  // values, so a place preset from the URL survives StrictMode's dev-mode
  // double-invoke of this effect (which re-runs with the same values).
  const initialFormValues = useRef({ type, region })
  useEffect(() => {
    const isInitial =
      type === initialFormValues.current.type && region === initialFormValues.current.region
    if (!isInitial) {
      setPlaceId('')
      setPlaceQuery('')
    }
    if (type !== 'REVIEW' || !region) {
      setPlaces([])
      return
    }
    let active = true
    getPlaces({ region, limit: 50 })
      .then((data) => {
        if (active) setPlaces(data)
      })
      .catch(() => {
        if (active) setPlaces([])
      })
    return () => {
      active = false
    }
  }, [type, region])

  // "YOUR TRIP" day-by-day panel — reuses the same TripContext selections and
  // GET /itinerary call Home.jsx/MapPage.jsx use, limited to the selected
  // region so it never offers a place outside what was just searched.
  useEffect(() => {
    if (type !== 'REVIEW' || !region || !trip.completed || region !== trip.destination) {
      setTripDays([])
      setTripDayIndex(0)
      return
    }
    let active = true
    getItinerary({
      categories: trip.interests,
      region: trip.destination,
      days: parseInt(trip.duration, 10) || 3,
      pace: trip.pace,
    })
      .then((data) => {
        if (!active) return
        setTripDays(data)
        setTripDayIndex(0)
      })
      .catch(() => {
        if (active) {
          setTripDays([])
          setTripDayIndex(0)
        }
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, region, trip.completed, trip.destination, trip.interests.join(','), trip.duration, trip.pace])

  const safeDayIndex = Math.min(tripDayIndex, Math.max(0, tripDays.length - 1))

  const placeResults = region
    ? places.filter((p) => p.title.toLowerCase().includes(placeQuery.trim().toLowerCase()))
    : []

  const selectPlace = (p) => {
    setPlaceId(p.id)
    setPlaceQuery(p.title)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      title,
      content,
      category: toBackendCommunityCategory(type),
      region: region || null,
    }
    if (type === 'REVIEW') {
      // The backend requires place_id + rating for a REVIEW post (400s
      // otherwise even though the field is nullable in its schema), so this
      // stays a hard requirement — selecting a place needs a region first.
      if (!placeId) {
        setError('Choose a place to review.')
        return
      }
      payload.place_id = Number(placeId)
      payload.rating = rating || null
    }
    if (type === 'COMPANION') {
      if (!companionDestination.trim()) {
        setError('Destination is required for a companion post.')
        return
      }
      payload.companion = {
        destination: companionDestination.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        travelers_needed: travelersNeeded ? Number(travelersNeeded) : null,
      }
    }

    setSubmitting(true)
    try {
      const post = await createBoardPost(payload)
      navigate(`/community/post/${post.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Creating posts is members-only: blur the page behind the sign-up prompt.
  if (!isLoggedIn) {
    return (
      <div className="page">
        <Header />
        <div className="map-gate">
          <div className="comm-gate-blur" aria-hidden="true">
            <section className="container page-hero create-hero">
              <h1 className="t-h1">CREATE POST</h1>
            </section>
            <div className="container create-form" style={{ minHeight: 320 }} />
          </div>
          <div className="comm-gate-prompt map-gate-prompt">
            <MemberGateCard />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page">
      <Header />

      <section className="container page-hero create-hero">
        <nav className="cat-crumbs t-caption t-faint" aria-label="Breadcrumb">
          <Link to="/community">COMMUNITY</Link>
          <span>/</span>
          <span className="cat-crumb-current">NEW POST</span>
        </nav>
        <h1 className="t-h1">CREATE POST</h1>
      </section>

      <form className="container create-form" onSubmit={submit}>
        <div className="field">
          <span className="field-label">Category</span>
          <div className="create-types">
            {POST_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`pill ${type === t ? 'is-active' : ''}`}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field-label">Title</span>
          <input
            className="field-input"
            placeholder="Give your post a clear title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">
            Region{(type === 'Q&A' || type === 'TIPS') ? ' (optional)' : ''}
          </span>
          <div className="field-select-wrap">
            <select
              className="field-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Select a region</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </label>

        {type === 'REVIEW' && (
          <div className="create-place fade-in">
            <div className="create-place-body">
              <div className="create-place-search">
                <span className="field-label">Place</span>
                <div className="create-place-box">
                  <input
                    className="field-input"
                    aria-label="Search places"
                    placeholder={region ? 'Search places in this region…' : 'Select a region first'}
                    value={placeQuery}
                    disabled={!region}
                    onChange={(e) => {
                      setPlaceQuery(e.target.value)
                      setPlaceId('')
                    }}
                  />
                  {region && placeResults.length > 0 && (
                    <div className="create-place-results">
                      {placeResults.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={`pill create-place-option ${String(placeId) === String(p.id) ? 'is-active' : ''}`}
                          onClick={() => selectPlace(p)}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {region && placeQuery && placeResults.length === 0 && (
                    <p className="t-caption t-faint">No places match “{placeQuery}”.</p>
                  )}
                </div>
              </div>

              <div className="create-place-trip">
                <span className="field-label">Your trip</span>
                <div className="create-place-box">
                  {tripDays.length === 0 ? (
                    <p className="t-caption t-faint">
                      {region ? 'No matching trip itinerary.' : 'Select a region first.'}
                    </p>
                  ) : (
                    <>
                      <div className="create-place-trip-nav">
                        <button
                          type="button"
                          className="create-place-trip-nav-btn"
                          onClick={() => setTripDayIndex((i) => Math.max(0, i - 1))}
                          disabled={safeDayIndex === 0}
                          aria-label="Previous day"
                        >
                          ‹
                        </button>
                        <span className="create-place-trip-nav-label">DAY {safeDayIndex + 1}</span>
                        <button
                          type="button"
                          className="create-place-trip-nav-btn"
                          onClick={() => setTripDayIndex((i) => Math.min(tripDays.length - 1, i + 1))}
                          disabled={safeDayIndex === tripDays.length - 1}
                          aria-label="Next day"
                        >
                          ›
                        </button>
                      </div>
                      <div className="create-place-trip-list">
                        {tripDays[safeDayIndex].places.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className={`pill create-place-option ${String(placeId) === String(p.id) ? 'is-active' : ''}`}
                            onClick={() => selectPlace(p)}
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="field">
              <span className="field-label">Rating</span>
              <Rating value={rating} size={30} interactive onChange={setRating} />
            </div>
          </div>
        )}

        {type === 'COMPANION' && (
          <div className="create-companion fade-in">
            <label className="field">
              <span className="field-label">Destination</span>
              <input
                className="field-input"
                placeholder="e.g. Jeju"
                value={companionDestination}
                onChange={(e) => setCompanionDestination(e.target.value)}
                required
              />
            </label>
            <div className="field">
              <span className="field-label">Travel dates</span>
              <DateRangeField
                startDate={startDate}
                endDate={endDate}
                onChange={({ startDate: s, endDate: e }) => {
                  setStartDate(s)
                  setEndDate(e)
                }}
              />
            </div>
            <label className="field">
              <span className="field-label">Travelers needed</span>
              <input
                className="field-input"
                type="number"
                min="1"
                placeholder="e.g. 2"
                value={travelersNeeded}
                onChange={(e) => setTravelersNeeded(e.target.value)}
              />
            </label>
          </div>
        )}

        <label className="field">
          <span className="field-label">Content</span>
          <textarea
            className="field-textarea"
            placeholder={
              type === 'REVIEW'
                ? 'How was it? What should other travelers know?'
                : type === 'COMPANION'
                  ? 'Introduce yourself and your plan.'
                  : 'Write your post…'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>

        {error && <p className="t-caption signup-error">{error}</p>}

        <div className="create-actions">
          <Link to="/community" className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>

      <Footer />
    </div>
  )
}
