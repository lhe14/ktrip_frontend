import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Rating from '../components/Rating'
import { useAuth } from '../context/AuthContext'
import { MemberGateCard, MemberGateModal } from '../components/MemberGate'
import { getBoardPosts } from '../services/board'
import { usePlaceTitle } from '../services/places'
import { formatApiDate, regionLabel, companionSummary, toFrontendCommunityCategory } from '../data/apiMappings'

const TABS = ['ALL', 'QUICK', 'REVIEWS', 'COMPANION']

// Community tab -> backend board category (getBoardPosts maps to the
// lowercase wire value itself via COMMUNITY_CATEGORY).
const TAB_CATEGORY = { QUICK: 'Q&A', REVIEWS: 'REVIEW', COMPANION: 'COMPANION' }

const TYPE_CHIP = {
  'Q&A': 'chip',
  TIPS: 'chip chip-blue',
  REVIEW: 'chip chip-red',
  COMPANION: 'chip chip-fill',
}

function LikeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4 8 4c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.4 5 5.3 0 4-4 7.2-9 11.7z" />
    </svg>
  )
}
function CommentIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12a8 8 0 01-8 8H4l2.3-2.9A8 8 0 1121 12z" />
    </svg>
  )
}

export default function Community() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')?.toUpperCase()) ? params.get('tab').toUpperCase() : 'ALL'
  const [sortBy, setSortBy] = useState('latest')
  const [gateOpen, setGateOpen] = useState(false)
  const { isLoggedIn } = useAuth()

  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [rawPosts, setRawPosts] = useState([])

  useEffect(() => {
    let active = true
    setStatus('loading')
    setError('')
    getBoardPosts({ category: TAB_CATEGORY[tab] })
      .then((data) => {
        if (!active) return
        setRawPosts(data)
        setStatus('ready')
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message)
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [tab])

  // GET /board/posts always returns newest-first and has no server-side
  // popularity sort — POPULAR is a client-side re-sort of the fetched page.
  const posts = [...rawPosts].sort((a, b) =>
    sortBy === 'popular' ? b.like_count - a.like_count : 0
  )

  return (
    <div className="page">
      <Header />

      <section className="container page-hero comm-hero">
        <div>
          <span className="t-label">Community</span>
          <h1 className="t-h1">Travelers, together.</h1>
        </div>
        {isLoggedIn ? (
          <Link to="/community/new" className="btn btn-primary">
            Create Post
          </Link>
        ) : (
          <button className="btn btn-primary" onClick={() => setGateOpen(true)}>
            Create Post
          </button>
        )}
      </section>

      <div className="container comm-bar">
        <div className="comm-tabs" role="tablist" aria-label="Community sections">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`comm-tab ${tab === t ? 'is-active' : ''}`}
              onClick={() => setParams(t === 'ALL' ? {} : { tab: t.toLowerCase() })}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="map-sort" role="tablist" aria-label="Sort posts">
          <button
            role="tab"
            aria-selected={sortBy === 'latest'}
            className={`map-sort-btn ${sortBy === 'latest' ? 'is-active' : ''}`}
            onClick={() => setSortBy('latest')}
          >
            LATEST
          </button>
          <span className="map-sort-sep">|</span>
          <button
            role="tab"
            aria-selected={sortBy === 'popular'}
            className={`map-sort-btn ${sortBy === 'popular' ? 'is-active' : ''}`}
            onClick={() => setSortBy('popular')}
          >
            POPULAR
          </button>
        </div>
      </div>

      <section className="container comm-list fade-in" key={tab + sortBy}>
        {tab === 'QUICK' && (
          <p className="t-small t-muted comm-intro">Quick questions, quick answers — no long posts.</p>
        )}
        {tab === 'COMPANION' && (
          <p className="t-small t-muted comm-intro">Find someone to share the road with.</p>
        )}

        {status === 'loading' && <ApiState message="Loading posts…" />}
        {status === 'error' && <ApiState message={error} isError />}
        {status === 'ready' && posts.length === 0 && (
          <ApiState message="No posts here yet — be the first to write one." />
        )}

        {status === 'ready' &&
          posts.length > 0 &&
          (() => {
            const renderPost = (p) =>
              tab === 'QUICK' ? (
                <QuickItem key={p.id} post={p} />
              ) : tab === 'REVIEWS' ? (
                <ReviewItem key={p.id} post={p} />
              ) : tab === 'COMPANION' ? (
                <CompanionItem key={p.id} post={p} />
              ) : (
                <AllItem key={p.id} post={p} />
              )

            // Members see everything.
            if (isLoggedIn) return posts.map(renderPost)

            // Non-members: ALL shows the first 3 posts, the rest sit blurred
            // behind a sign-up prompt. Other tabs are fully blurred.
            const visible = tab === 'ALL' ? posts.slice(0, 3) : []
            const locked = tab === 'ALL' ? posts.slice(3) : posts

            return (
              <>
                {/* Visible posts stay readable, but clicking one opens the
                    sign-up modal instead of navigating to the post detail. */}
                <div
                  onClickCapture={(e) => {
                    e.preventDefault()
                    setGateOpen(true)
                  }}
                >
                  {visible.map(renderPost)}
                </div>
                {locked.length > 0 && (
                  <div className="comm-gate">
                    <div className="comm-gate-blur" aria-hidden="true">
                      {locked.map(renderPost)}
                    </div>
                    <div className="comm-gate-prompt">
                      <MemberGateCard />
                    </div>
                  </div>
                )}
              </>
            )
          })()}
      </section>

      <MemberGateModal open={gateOpen} onClose={() => setGateOpen(false)} />

      <Footer />
    </div>
  )
}

function ApiState({ message, isError = false }) {
  return (
    <div className={`api-state ${isError ? 'is-error' : ''}`} role={isError ? 'alert' : 'status'}>
      <p className="t-body t-muted">{message}</p>
    </div>
  )
}

/* ----- ALL: editorial list rows ----- */
function AllItem({ post }) {
  const region = regionLabel(post.area_code)
  const label = toFrontendCommunityCategory(post.category)
  return (
    <Link to={`/community/post/${post.id}`} className="comm-item">
      <div className="comm-item-main">
        <div className="comm-item-top">
          <span className={TYPE_CHIP[label]}>{label}</span>
          {region && <span className="t-caption t-faint">{region}</span>}
        </div>
        <h2 className="comm-item-title">{post.title}</h2>
        <div className="post-meta">
          <span>{post.author_nickname}</span>
          <span className="dot">{formatApiDate(post.created_at)}</span>
          <span className="meta-stat">
            <LikeIcon /> {post.like_count}
          </span>
          <span className="meta-stat">
            <CommentIcon /> {post.comment_count}
          </span>
        </div>
      </div>
      {post.image_url && (
        <div className="ph comm-item-img">
          <img src={post.image_url} alt="" loading="lazy" />
        </div>
      )}
    </Link>
  )
}

/* ----- QUICK: lightweight rows (category = qna) ----- */
function QuickItem({ post }) {
  const region = regionLabel(post.area_code)
  return (
    <Link to={`/community/post/${post.id}`} className="quick-item">
      <span className="quick-item-q" aria-hidden="true">
        Q
      </span>
      <div className="quick-item-main">
        <h2 className="quick-item-title">{post.title}</h2>
        <span className="t-caption t-faint">
          {region ? `${region} · ` : ''}
          {post.author_nickname} · {formatApiDate(post.created_at)}
        </span>
      </div>
      <span className="meta-stat">
        <CommentIcon /> {post.comment_count}
      </span>
    </Link>
  )
}

/* ----- REVIEWS: board REVIEW-category posts, also the source for a place's own review list on PlaceDetail ----- */
function ReviewItem({ post }) {
  // Nested inside the item's own Link to the post, so this stays plain text
  // (no second <a>) — resolved from place_id via GET /places/{id}.
  const placeTitle = usePlaceTitle(post.place_id)
  return (
    <Link to={`/community/post/${post.id}`} className="review-item">
      {post.image_url && (
        <div className="ph ph-hover review-item-img">
          <img src={post.image_url} alt="" loading="lazy" />
        </div>
      )}
      <div className="review-item-main">
        <div className="comm-item-top">
          <Rating value={post.rating || 0} size={14} />
          {placeTitle && <span className="t-caption t-faint">{placeTitle}</span>}
        </div>
        <h2 className="comm-item-title">{post.title}</h2>
        <p className="t-small t-muted review-item-excerpt">{post.content.slice(0, 140)}…</p>
        <div className="post-meta">
          <span>{post.author_nickname}</span>
          <span className="dot">{formatApiDate(post.created_at)}</span>
          <span className="meta-stat">
            <LikeIcon /> {post.like_count}
          </span>
          <span className="meta-stat">
            <CommentIcon /> {post.comment_count}
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ----- COMPANION ----- */
function CompanionItem({ post }) {
  const c = companionSummary(post.companion)
  return (
    <Link to={`/community/post/${post.id}`} className="companion-item">
      <div className="avatar">{post.author_nickname.slice(0, 2).toUpperCase()}</div>
      <div className="companion-item-main">
        <h2 className="comm-item-title">{post.title}</h2>
        <p className="t-small t-muted companion-msg">{post.content.slice(0, 110)}…</p>
        <span className="t-caption t-faint">
          {post.author_nickname} · {formatApiDate(post.created_at)}
        </span>
      </div>
      {c && (
        <div className="companion-facts">
          <div className="companion-fact">
            <span className="t-label t-faint">Where</span>
            <span className="t-small">{c.destination}</span>
          </div>
          <div className="companion-fact">
            <span className="t-label t-faint">When</span>
            <span className="t-small">{c.dates}</span>
          </div>
          <div className="companion-fact">
            <span className="t-label t-faint">Group</span>
            <span className="t-small">{c.travelers}</span>
          </div>
        </div>
      )}
    </Link>
  )
}
