import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Rating from '../components/Rating'
import { MemberGateCard } from '../components/MemberGate'
import { useAuth } from '../context/AuthContext'
import { AUTHOR_INITIALS } from '../data/mockData'
import { formatApiDate, regionLabel } from '../data/apiMappings'
import { getPlace, getPlaceReviews, getAverageRating } from '../data/places'
import { getPlaceById, categoryFromTheme } from '../services/places'
import { getBoardPosts, likeBoardPost } from '../services/board'

// Quiet, non-blocking location request for the "distance to you" fact — no
// gate UI like MapPage's; if permission is denied or unavailable this just
// stays null and the fact falls back to an explanatory line instead of a
// number.
function useUserCoords() {
  const [coords, setCoords] = useState(null)
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 10000, maximumAge: 60000 }
    )
  }, [])
  return coords
}

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function PlaceDetail() {
  const { slug } = useParams()
  const isApiPlace = /^\d+$/.test(slug || '')
  return isApiPlace ? <ApiPlaceDetail placeId={Number(slug)} /> : <MockPlaceDetail slug={slug} />
}

// Reviews are now written exclusively through Community's REVIEW-category
// board posts (the place detail page no longer has its own review-write
// form), so "this place's reviews" means GET /board/posts?category=review
// filtered client-side by place_id — GET /board/posts has no place_id filter
// of its own, and the old GET /places/{id}/reviews table is a separate,
// now-unwritten data source that would never show what's written here.
function ApiPlaceDetail({ placeId }) {
  const [place, setPlace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [placeError, setPlaceError] = useState('')
  const [reviewError, setReviewError] = useState('')

  const reload = () => {
    getPlaceById(placeId)
      .then(setPlace)
      .catch((error) => setPlaceError(error.message))
    getBoardPosts({ category: 'REVIEW', limit: 100 })
      .then((data) => setReviews(data.filter((post) => post.place_id === placeId)))
      .catch((error) => setReviewError(error.message))
  }

  useEffect(() => {
    let active = true
    setPlace(null)
    setReviews([])
    setPlaceError('')
    setReviewError('')

    getPlaceById(placeId)
      .then((data) => { if (active) setPlace(data) })
      .catch((error) => { if (active) setPlaceError(error.message) })

    getBoardPosts({ category: 'REVIEW', limit: 100 })
      .then((data) => { if (active) setReviews(data.filter((post) => post.place_id === placeId)) })
      .catch((error) => { if (active) setReviewError(error.message) })

    return () => { active = false }
  }, [placeId])

  if (placeError) return <ApiFailure message={placeError} />
  if (!place) return <ApiLoading />

  const mappedReviews = reviews.map((post) => ({
    id: post.id,
    author: post.author_nickname,
    rating: post.rating,
    title: post.title,
    content: post.content,
    date: formatApiDate(post.created_at),
    likes: post.like_count,
  }))

  // The place record's own avg_rating/review_count reflect the old, now-
  // unwritten review table — derive both from the board reviews actually
  // shown below instead, so the header stays consistent with the list.
  const reviewCount = mappedReviews.length
  const avgRating = reviewCount
    ? mappedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
    : null

  const mappedPlace = {
    id: place.id,
    name: place.title,
    category: categoryFromTheme(place.theme_code),
    location: place.address,
    image: place.first_image,
    desc: place.overview,
    address: place.address,
    phone: place.tel,
    lat: place.mapy,
    lng: place.mapx,
    avgRating,
    reviewCount,
    region: regionLabel(place.area_code),
  }

  return (
    <PlaceLayout
      place={mappedPlace}
      reviews={mappedReviews}
      reviewError={reviewError}
      isApi
      placeId={placeId}
      onReviewChange={reload}
    />
  )
}

function MockPlaceDetail({ slug }) {
  const place = getPlace(slug)
  if (!place) return <Navigate to="/explore" replace />
  const reviews = getPlaceReviews(slug)
  const avg = getAverageRating(reviews)
  return <PlaceLayout place={{ ...place, avgRating: avg, reviewCount: reviews.length }} reviews={reviews} />
}

function PlaceLayout({ place, reviews, reviewError, isApi = false, placeId, onReviewChange }) {
  const { isLoggedIn } = useAuth()
  const average = place.avgRating

  const userCoords = useUserCoords()
  const hasPlaceCoords = place.lat != null && place.lng != null
  const distanceKm =
    hasPlaceCoords && userCoords
      ? haversineKm(userCoords.lat, userCoords.lng, place.lat, place.lng)
      : null

  return (
    <div className="page">
      <Header />
      <section className="container page-hero place-hero-head">
        <nav className="cat-crumbs t-caption t-faint" aria-label="Breadcrumb">
          <Link to="/explore">EXPLORE</Link>
          {place.category && <><span>/</span><Link to={`/explore/${place.category.toLowerCase()}`}>{place.category}</Link></>}
          <span>/</span><span className="cat-crumb-current">{place.name.toUpperCase()}</span>
        </nav>
      </section>

      <section className="container place-hero">
        <div className="ph place-hero-img">
          {place.image ? <img src={place.image} alt={place.name} /> : <span className="api-media-empty t-caption t-faint">IMAGE UNAVAILABLE</span>}
        </div>
        <div className="place-hero-info">
          {place.category && <span className="chip">{place.category}</span>}
          <h1 className="t-h2">{place.name}</h1>
          {place.location && <span className="t-caption t-faint cat-place-loc">{place.location}</span>}
          <p className="t-body t-muted place-desc">
            {place.desc || 'No description available for this place yet.'}
          </p>
          <div className="place-facts">
            {place.address && <Fact label="Address" value={place.address} />}
            <div className="place-facts-row">
              <Fact label="Phone" value={place.phone || 'Not listed'} />
              {hasPlaceCoords && (
                <Fact
                  label="Distance"
                  value={distanceKm != null ? `${distanceKm.toFixed(1)} km away` : 'Enable location to see distance'}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container place-reviews">
        {reviewError ? <ApiState message={reviewError} isError /> : (
          <div className={isLoggedIn ? '' : 'map-gate'}>
            <div className={isLoggedIn ? '' : 'comm-gate-blur'} aria-hidden={!isLoggedIn || undefined}>
              <div className="place-reviews-head">
                <h2 className="t-h3">Reviews ({place.reviewCount})</h2>
                {average != null && <div className="place-reviews-avg"><Rating value={Math.round(average)} size={15} /><span className="t-small t-muted">{Number(average).toFixed(1)}</span></div>}
              </div>

              {isApi && isLoggedIn && (
                <Link
                  to={`/community/new?category=REVIEW&region=${encodeURIComponent(place.region || '')}&placeId=${placeId}&placeTitle=${encodeURIComponent(place.name)}`}
                  className="btn btn-primary btn-sm place-review-cta"
                >
                  Write a review
                </Link>
              )}

              {reviews.length === 0 ? <p className="t-small t-muted">No reviews yet.</p> : (
                <ul className="place-review-list">
                  {reviews.map((review) => <ReviewRow key={review.id} review={review} isApi={isApi} canLike={isApi && isLoggedIn} onLiked={onReviewChange} />)}
                </ul>
              )}
            </div>
            {!isLoggedIn && <div className="comm-gate-prompt place-gate-prompt"><MemberGateCard /></div>}
          </div>
        )}
      </section>
      <Footer />
    </div>
  )
}

function Fact({ label, value }) {
  return <div className="place-fact"><span className="t-label t-faint">{label}</span><span className="t-small">{value}</span></div>
}

function ReviewRow({ review, isApi, canLike, onLiked }) {
  const [liked, setLiked] = useState(false)

  const toggleLike = async () => {
    try {
      // Reviews are board posts now, so liking one uses the same board-post
      // like endpoint Community/PostDetail use, not the old per-review one.
      const { liked: nowLiked } = await likeBoardPost(review.id)
      setLiked(nowLiked)
      onLiked?.()
    } catch {
      // Ignore — like state simply doesn't change on failure.
    }
  }

  return (
    <li className="place-review">
      <div className="avatar">{isApi ? review.author.slice(0, 2).toUpperCase() : AUTHOR_INITIALS(review.author)}</div>
      <div className="place-review-main">
        <div className="place-review-top"><span className="t-small comment-author">{review.author}</span><Rating value={review.rating} size={13} />{review.date && <span className="t-caption t-faint">{review.date}</span>}</div>
        {review.title && <Link to={`/community/post/${review.id}`} className="place-review-title t-small">{review.title}</Link>}
        {review.content && <p className="t-small t-muted place-review-text">{review.content}</p>}
        {isApi && (
          canLike ? (
            <button className={`comment-like ${liked ? 'is-liked' : ''}`} onClick={toggleLike} aria-pressed={liked}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4 8 4c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.4 5 5.3 0 4-4 7.2-9 11.7z" />
              </svg>
              {review.likes}
            </button>
          ) : (
            <span className="t-caption t-faint">{review.likes} likes</span>
          )
        )}
      </div>
    </li>
  )
}

function ApiLoading() {
  return <div className="page"><Header /><section className="container api-state" role="status"><p className="t-body t-muted">Loading place…</p></section><Footer /></div>
}

function ApiFailure({ message }) {
  return <div className="page"><Header /><section className="container api-state is-error" role="alert"><p className="t-body t-muted">{message}</p><Link to="/explore" className="btn btn-outline">BACK TO EXPLORE</Link></section><Footer /></div>
}

function ApiState({ message, isError = false }) {
  return <div className={`api-state ${isError ? 'is-error' : ''}`} role={isError ? 'alert' : 'status'}><p className="t-body t-muted">{message}</p></div>
}
