import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { CATEGORIES, EXPLORE_INTRO } from '../data/mockData'
import { getPlaces } from '../services/places'

export default function Explore() {
  // One representative real place per category, for the index thumbnail —
  // EXPLORE_INTRO's taglines stay as static copy (there is no backend
  // endpoint for category descriptions), but the images are live now.
  const [thumbs, setThumbs] = useState({})

  useEffect(() => {
    let active = true
    CATEGORIES.forEach((c) => {
      getPlaces({ category: c, limit: 1 })
        .then((data) => {
          if (active) setThumbs((t) => ({ ...t, [c]: data[0] || null }))
        })
        .catch(() => {
          if (active) setThumbs((t) => ({ ...t, [c]: null }))
        })
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page">
      <Header />

      <section className="container page-hero">
        <span className="t-label">Explore</span>
        <h1 className="t-h1">
          Korea, in five
          <br />
          directions.
        </h1>
        <p className="t-body t-muted page-hero-desc">
          Pick a lane — or wander between them. Every place you save here shapes your personal trip.
        </p>
      </section>

      <section className="container explore-index">
        {CATEGORIES.map((c, i) => {
          const thumb = thumbs[c]
          return (
            <Link key={c} to={`/explore/${c.toLowerCase()}`} className="explore-row">
              <span className="explore-row-num t-caption t-faint">{String(i + 1).padStart(2, '0')}</span>
              <div className="explore-row-main">
                <h2 className="explore-row-title">{c}</h2>
                <p className="t-small t-muted explore-row-tag">{EXPLORE_INTRO[c].tagline}</p>
              </div>
              <div className="ph explore-row-img">
                {thumb?.first_image ? (
                  <img src={thumb.first_image} alt={c} loading="lazy" />
                ) : (
                  <span className="api-media-empty t-caption t-faint">IMAGE UNAVAILABLE</span>
                )}
              </div>
              <span className="explore-row-arrow" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          )
        })}
      </section>

      <Footer />
    </div>
  )
}
