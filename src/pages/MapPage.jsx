import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { CATEGORIES, MAP_PLACES } from '../data/mockData'
import { slugify } from '../data/places'
import { getNearbyPlaces, categoryFromTheme } from '../services/places'
import { getItinerary } from '../services/itinerary'
import { useTrip } from '../context/TripContext'

const CAT_COLOR = {
  FOOD: 'var(--red)',
  CULTURE: 'var(--ink)',
  HALLYU: 'var(--blue)',
  SHOPPING: 'var(--ink-60)',
  ATTRACTIONS: 'var(--blue)',
}

const pad = (n) => String(n).padStart(2, '0')

// Bounding box for South Korea including Jeju and the east-coast islands.
const KOREA_BOUNDS = { latMin: 33.0, latMax: 38.7, lngMin: 124.5, lngMax: 132.0 }

const isInKorea = (lat, lng) =>
  lat >= KOREA_BOUNDS.latMin &&
  lat <= KOREA_BOUNDS.latMax &&
  lng >= KOREA_BOUNDS.lngMin &&
  lng <= KOREA_BOUNDS.lngMax

// Distance from the user to an itinerary place — itinerary places carry
// lat/lon (mapx/mapy) but no distance_km the way /places/nearby results do,
// so it's derived client-side to keep the existing DISTANCE sort working.
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Matches the .map-reco-grid column counts in pages.css (3 cols by default,
// 1 col under the 767px breakpoint) so "2 rows" of MORE pagination lines up
// with the actual grid instead of an assumed column count.
const useGridColumns = () => {
  const [columns, setColumns] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 1 : 3
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setColumns(mq.matches ? 1 : 3)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return columns
}

export default function MapPage() {
  const { trip } = useTrip()
  const [mapView, setMapView] = useState('trip')
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState('recommended')
  const [active, setActive] = useState(null)
  const gridColumns = useGridColumns()
  const [visibleRows, setVisibleRows] = useState(2)

  // Location gate: 'loading' | 'denied' | 'outside' | 'inside'
  const [geo, setGeo] = useState({ status: 'loading', coords: null })

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeo({ status: 'denied', coords: null })
      return
    }
    setGeo({ status: 'loading', coords: null })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setGeo({
          status: isInKorea(latitude, longitude) ? 'inside' : 'outside',
          coords: { lat: latitude, lng: longitude },
        })
      },
      () => setGeo({ status: 'denied', coords: null }),
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(requestLocation, [])

  // "Recommended around you" — the one part of this page real data can drive
  // without a map library: GET /places/nearby using the same coordinates the
  // location gate already obtained. The mock map canvas/pins below stay mock
  // (see TODO there) since there's no map library in this project to plot
  // real coordinates onto.
  const [nearby, setNearby] = useState({ status: 'idle', places: [], error: '' })

  useEffect(() => {
    if (geo.status !== 'inside' || !geo.coords) {
      setNearby({ status: 'idle', places: [], error: '' })
      return
    }
    let active = true
    setNearby({ status: 'loading', places: [], error: '' })
    getNearbyPlaces({ lat: geo.coords.lat, lon: geo.coords.lng, radiusKm: 5, limit: 12 })
      .then((data) => {
        if (active) setNearby({ status: 'ready', places: data, error: '' })
      })
      .catch((err) => {
        if (active) setNearby({ status: 'error', places: [], error: err.message })
      })
    return () => {
      active = false
    }
  }, [geo.status, geo.coords])

  // YOUR TRIP bottom list — reuses the same TripContext selections and
  // GET /itinerary call Home.jsx uses, so only places that are actually part
  // of the user's current custom itinerary appear here (EXPLORE keeps using
  // `nearby` untouched).
  const [tripPlaces, setTripPlaces] = useState({ status: 'idle', places: [], error: '' })

  useEffect(() => {
    if (mapView !== 'trip' || !trip.completed) {
      setTripPlaces({ status: 'idle', places: [], error: '' })
      return
    }
    let active = true
    setTripPlaces({ status: 'loading', places: [], error: '' })
    getItinerary({
      categories: trip.interests,
      region: trip.destination,
      days: parseInt(trip.duration, 10) || 3,
      pace: trip.pace,
    })
      .then((data) => {
        if (!active) return
        const seen = new Map()
        data.forEach((d) => d.places.forEach((p) => { if (!seen.has(p.id)) seen.set(p.id, p) }))
        setTripPlaces({ status: 'ready', places: Array.from(seen.values()), error: '' })
      })
      .catch((err) => {
        if (active) setTripPlaces({ status: 'error', places: [], error: err.message })
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapView, trip.completed, trip.interests.join(','), trip.destination, trip.duration, trip.pace])

  const isTrip = mapView === 'trip'

  // TODO(map library): MAP_PLACES/pins below are decorative mock data plotted
  // by percentage position on a drawn SVG, not real coordinates — this
  // project has no map library (Leaflet/Mapbox/etc.) to project real place
  // lat/lon onto an actual map yet. Wiring real coordinates here needs that
  // library first; until then this stays mock, matching guidance not to
  // build a map UI from scratch.
  const visible = isTrip
    ? MAP_PLACES.filter((p) => p.day)
    : MAP_PLACES.filter((p) => filter === 'ALL' || p.category === filter)

  const tripPlacesWithDistance = tripPlaces.places.map((p) => ({
    ...p,
    distance_km: geo.coords ? haversineKm(geo.coords.lat, geo.coords.lng, p.mapy, p.mapx) : null,
  }))

  const recoStatus = isTrip ? tripPlaces.status : nearby.status
  const recoError = isTrip ? tripPlaces.error : nearby.error
  const recoList = isTrip ? tripPlacesWithDistance : nearby.places

  const sorted =
    sort === 'distance'
      ? [...recoList].sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity))
      : recoList

  // MORE pagination — 2 grid rows at a time, reset whenever the view, sort,
  // or underlying data source changes so it never opens on stale state.
  useEffect(() => {
    setVisibleRows(2)
  }, [isTrip, sort, recoStatus])

  const visibleCount = visibleRows * gridColumns
  const visibleSorted = sorted.slice(0, visibleCount)
  const hasMore = sorted.length > visibleCount

  return (
    <div className="page">
      <Header />

      <section className="container page-hero map-hero">
        <div className="map-hero-head">
          <div>
            <span className="t-label">Map</span>
            <h1 className="t-h1">{isTrip ? 'YOUR TRIP' : 'EXPLORE'}</h1>
            <p className="t-body t-muted page-hero-desc">
              {isTrip
                ? 'Your personalized AI itinerary on the map — every stop and the route between them. Seoul, city center.'
                : "Every place worth knowing around you — browse by category, beyond your itinerary. Seoul, city center."}
            </p>
          </div>
          <div className="view-toggle" role="tablist" aria-label="Map view">
            <button
              role="tab"
              aria-selected={isTrip}
              className={`view-toggle-btn ${isTrip ? 'is-active' : ''}`}
              onClick={() => setMapView('trip')}
            >
              YOUR TRIP
            </button>
            <button
              role="tab"
              aria-selected={!isTrip}
              className={`view-toggle-btn ${!isTrip ? 'is-active' : ''}`}
              onClick={() => setMapView('explore')}
            >
              EXPLORE
            </button>
          </div>
        </div>
      </section>

      {/* Location gate: the map content blurs unless the user is located in Korea */}
      <div className="map-gate">
      <div className={geo.status === 'inside' ? '' : 'comm-gate-blur'}>
      <section className="container map-layout">
        {/* --------- Map visualization --------- */}
        <div className="map-canvas" role="img" aria-label="Mock map of central Seoul">
          <svg className="map-bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {/* river */}
            <path
              d="M -2 78 C 20 72, 35 76, 50 72 S 80 60, 103 64"
              fill="none"
              stroke="rgba(0,71,160,0.14)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* main roads */}
            <path d="M -2 30 L 103 26" stroke="rgba(10,10,10,0.07)" strokeWidth="1.4" />
            <path d="M -2 48 L 103 44" stroke="rgba(10,10,10,0.07)" strokeWidth="1.8" />
            <path d="M 24 -2 L 30 103" stroke="rgba(10,10,10,0.07)" strokeWidth="1.4" />
            <path d="M 58 -2 L 54 103" stroke="rgba(10,10,10,0.07)" strokeWidth="1.8" />
            <path d="M 82 -2 L 86 103" stroke="rgba(10,10,10,0.06)" strokeWidth="1.2" />
            <path d="M -2 12 L 103 16" stroke="rgba(10,10,10,0.05)" strokeWidth="1" />
            {/* park block */}
            <rect x="38" y="50" width="14" height="12" rx="2" fill="rgba(10,10,10,0.045)" />
            <rect x="8" y="14" width="12" height="10" rx="2" fill="rgba(10,10,10,0.045)" />
            {/* route through the user's day-1 pins — itinerary view only */}
            {isTrip && (
              <path
                d="M 44 26 C 47 29, 49 30, 52 32 C 55 35, 56 36, 58 38"
                fill="none"
                stroke="rgba(198,12,48,0.55)"
                strokeWidth="0.9"
                strokeDasharray="2.4 1.6"
                strokeLinecap="round"
              />
            )}
          </svg>

          {visible.map((p) => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              className={`map-pin ${active === p.id ? 'is-active' : ''}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, '--pin': CAT_COLOR[p.category] }}
              onClick={() => setActive(active === p.id ? null : p.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActive(active === p.id ? null : p.id)
              }}
              aria-label={`${p.name}, ${isTrip ? `Day ${p.day}` : p.category}`}
            >
              <span className="map-pin-dot" />
              {active === p.id ? (
                <Link
                  to={`/place/${slugify(p.name)}`}
                  className="map-pin-tip is-open"
                  onClick={(e) => e.stopPropagation()}
                >
                  <strong>{p.name}</strong>
                  <em>
                    {isTrip ? `DAY ${pad(p.day)}` : p.category} · {p.area} · View →
                  </em>
                </Link>
              ) : (
                <span className="map-pin-tip">
                  <strong>{p.name}</strong>
                  <em>
                    {isTrip ? `DAY ${pad(p.day)}` : p.category} · {p.area}
                  </em>
                </span>
              )}
            </div>
          ))}

          <div className="map-attribution t-caption t-faint">Mock map — visual prototype</div>
        </div>

        {/* --------- Side panel --------- */}
        <aside className="map-side">
          {!isTrip && (
            <div className="map-side-block">
              <span className="t-label t-faint">Map category</span>
              <div className="map-filters">
                {['ALL', ...CATEGORIES].map((c) => (
                  <button
                    key={c}
                    className={`map-filter ${filter === c ? 'is-active' : ''}`}
                    onClick={() => setFilter(c)}
                  >
                    {c !== 'ALL' && (
                      <span className="map-filter-dot" style={{ background: CAT_COLOR[c] }} />
                    )}
                    {c === 'ALL' ? 'ALL PLACES' : c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="map-side-block">
            <span className="t-label t-faint">{isTrip ? 'Your trip' : 'Tip'}</span>
            <p className="t-small t-muted map-side-note">
              {isTrip
                ? 'Only the places in your personalized itinerary are shown. The dotted red line follows your Day 01 route — palace, hanok alleys, then Gwangjang Market.'
                : 'Pick a category to narrow the map, or tap a pin for details. Switch back to YOUR TRIP to see your itinerary route.'}
            </p>
          </div>
        </aside>
      </section>

      {/* --------- Recommended --------- */}
      <section className="container map-reco">
        <div className="map-reco-head">
          <h2 className="t-h3">Recommended around you</h2>
          <div className="map-sort" role="tablist" aria-label="Sort">
            <button
              role="tab"
              aria-selected={sort === 'recommended'}
              className={`map-sort-btn ${sort === 'recommended' ? 'is-active' : ''}`}
              onClick={() => setSort('recommended')}
            >
              RECOMMENDED
            </button>
            <span className="map-sort-sep">|</span>
            <button
              role="tab"
              aria-selected={sort === 'distance'}
              className={`map-sort-btn ${sort === 'distance' ? 'is-active' : ''}`}
              onClick={() => setSort('distance')}
            >
              DISTANCE
            </button>
          </div>
        </div>

        {recoStatus === 'idle' && (
          <div className="api-state" role="status">
            <p className="t-body t-muted">
              {isTrip ? 'Complete your custom trip to see its places here.' : 'Waiting for your location…'}
            </p>
          </div>
        )}
        {recoStatus === 'loading' && (
          <div className="api-state" role="status">
            <p className="t-body t-muted">{isTrip ? 'Loading your itinerary…' : 'Finding places near you…'}</p>
          </div>
        )}
        {recoStatus === 'error' && (
          <div className="api-state is-error" role="alert">
            <p className="t-body t-muted">{recoError}</p>
          </div>
        )}
        {recoStatus === 'ready' && sorted.length === 0 && (
          <div className="api-state" role="status">
            <p className="t-body t-muted">
              {isTrip ? 'No places in your itinerary yet.' : 'No places found within 5 km of your location.'}
            </p>
          </div>
        )}

        {recoStatus === 'ready' && sorted.length > 0 && (
          <div className="map-reco-grid">
            {visibleSorted.map((p) => (
              <Link key={p.id} to={`/place/${p.id}`} className="map-reco-card">
                <div className="ph ph-hover map-reco-img">
                  {p.first_image ? (
                    <img src={p.first_image} alt={p.title} loading="lazy" />
                  ) : (
                    <span className="api-media-empty t-caption t-faint">IMAGE UNAVAILABLE</span>
                  )}
                </div>
                <div className="map-reco-info">
                  <span className="t-caption t-faint">
                    {(categoryFromTheme(p.theme_code) || p.theme_code || '').toString().toUpperCase()}
                    {p.distance_km != null && ` · ${p.distance_km.toFixed(1)} km`}
                  </span>
                  <h3 className="map-reco-name">{p.title}</h3>
                  {p.address && <span className="t-caption map-reco-note">{p.address}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {recoStatus === 'ready' && hasMore && (
          <div className="map-reco-more">
            <button className="btn btn-outline btn-sm" onClick={() => setVisibleRows((r) => r + 2)}>
              MORE
            </button>
          </div>
        )}
      </section>
      </div>

      {geo.status !== 'inside' && (
        <div className="comm-gate-prompt map-gate-prompt">
          <div className="comm-gate-card">
            {geo.status === 'loading' && (
              <>
                <span className="t-label comm-gate-label">Location</span>
                <h2 className="t-h3">Checking your location…</h2>
                <p className="t-small t-muted">
                  The K-TRIP map is made for travel within Korea.
                </p>
              </>
            )}
            {geo.status === 'denied' && (
              <>
                <span className="t-label comm-gate-label">Location</span>
                <h2 className="t-h3">Please allow location permission.</h2>
                <p className="t-small t-muted">
                  The map needs your location to show places around you. If your browser blocked
                  the request, allow location access in the site settings and retry.
                </p>
                <button className="btn btn-primary" onClick={requestLocation}>
                  Retry
                </button>
              </>
            )}
            {geo.status === 'outside' && (
              <>
                <span className="t-label comm-gate-label">Location</span>
                <h2 className="t-h3">You are not in Korea.</h2>
                <p className="t-small t-muted">
                  The K-TRIP map covers travel within Korea, so it is available once you arrive.
                </p>
              </>
            )}
          </div>
        </div>
      )}
      </div>

      <Footer />
    </div>
  )
}
