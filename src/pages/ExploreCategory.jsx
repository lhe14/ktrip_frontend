import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { CATEGORIES, EXPLORE_INTRO } from '../data/mockData'
import { getPlaces, categoryFromTheme } from '../services/places'

function PlaceMedia({ place, className }) {
  return (
    <Link to={`/place/${place.id}`} className={`ph ph-hover ${className}`}>
      {place.first_image ? <img src={place.first_image} alt={place.title} loading="lazy" /> : <span className="api-media-empty t-caption t-faint">IMAGE UNAVAILABLE</span>}
    </Link>
  )
}

export default function ExploreCategory() {
  const { category } = useParams()
  const cat = category?.toUpperCase()
  const [places, setPlaces] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!CATEGORIES.includes(cat)) return
    let active = true
    setStatus('loading')
    setError('')
    getPlaces({ category: cat })
      .then((data) => {
        if (!active) return
        setPlaces(data)
        setStatus('ready')
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message)
        setStatus('error')
      })
    return () => { active = false }
  }, [cat])

  if (!CATEGORIES.includes(cat)) return <Navigate to="/explore" replace />

  const intro = EXPLORE_INTRO[cat]
  const featured = places[0]
  const rest = places.slice(1)

  return (
    <div className="page">
      <Header />
      <section className="container page-hero cat-hero">
        <nav className="cat-crumbs t-caption t-faint" aria-label="Breadcrumb">
          <Link to="/explore">EXPLORE</Link><span>/</span><span className="cat-crumb-current">{cat}</span>
        </nav>
        <h1 className="t-h1">{intro.tagline}</h1>
        <p className="t-body t-muted page-hero-desc">{intro.desc}</p>
      </section>

      {status === 'loading' && <ApiState message="Loading places…" />}
      {status === 'error' && <ApiState message={error} isError />}
      {status === 'ready' && places.length === 0 && <ApiState message="No places are available in this category yet." />}

      {status === 'ready' && featured && <>
        <section className="container cat-featured">
          <PlaceMedia place={featured} className="cat-featured-img" />
          <div className="cat-featured-info">
            <span className="chip chip-red">Featured</span>
            <h2 className="t-h2"><Link to={`/place/${featured.id}`} className="place-link">{featured.title}</Link></h2>
            {featured.address && <span className="t-caption t-faint cat-place-loc">{featured.address}</span>}
            {featured.theme_code && <span className="t-caption t-faint cat-place-meta">{categoryFromTheme(featured.theme_code) || featured.theme_code.toUpperCase()} · SCORE {featured.score}</span>}
          </div>
        </section>

        <section className="container cat-list">
          {rest.map((place, index) => (
            <article key={place.id} className={`cat-item ${index % 2 === 1 ? 'is-offset' : ''}`}>
              <PlaceMedia place={place} className="cat-item-img" />
              <div className="cat-item-info">
                <h3 className="t-h3"><Link to={`/place/${place.id}`} className="place-link">{place.title}</Link></h3>
                {place.address && <span className="t-caption t-faint cat-place-loc">{place.address}</span>}
                {place.theme_code && <span className="t-caption t-faint cat-place-meta">{categoryFromTheme(place.theme_code) || place.theme_code.toUpperCase()} · SCORE {place.score}</span>}
              </div>
            </article>
          ))}
        </section>
      </>}

      <section className="container cat-others">
        <span className="t-label t-faint">Keep exploring</span>
        <div className="cat-others-row">
          {CATEGORIES.filter((c) => c !== cat).map((c) => <Link key={c} to={`/explore/${c.toLowerCase()}`} className="pill">{c}</Link>)}
        </div>
      </section>
      <Footer />
    </div>
  )
}

function ApiState({ message, isError = false }) {
  return <section className={`container api-state ${isError ? 'is-error' : ''}`} role={isError ? 'alert' : 'status'}><p className="t-body t-muted">{message}</p></section>
}
