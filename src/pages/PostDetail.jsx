import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Rating from '../components/Rating'
import { useAuth } from '../context/AuthContext'
import { MemberGateCard } from '../components/MemberGate'
import {
  getBoardPost,
  getBoardComments,
  createBoardComment,
  likeBoardPost,
  likeBoardComment,
} from '../services/board'
import { usePlaceTitle } from '../services/places'
import { formatApiDate, regionLabel, companionSummary, toFrontendCommunityCategory } from '../data/apiMappings'

const TYPE_CHIP = {
  'Q&A': 'chip',
  TIPS: 'chip chip-blue',
  REVIEW: 'chip chip-red',
  COMPANION: 'chip chip-fill',
}

export default function PostDetail() {
  const { id } = useParams()
  const postId = Number(id)
  const { isLoggedIn } = useAuth()

  const [post, setPost] = useState(null)
  const [postStatus, setPostStatus] = useState('loading')
  const [postError, setPostError] = useState('')

  const [comments, setComments] = useState([])
  const [commentSort, setCommentSort] = useState('latest')
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  // The API doesn't expose whether the current user already liked something,
  // so these only track toggles made in this session (default: unknown/off).
  const [postLiked, setPostLiked] = useState(false)
  const [likedComments, setLikedComments] = useState(() => new Set())

  // Called unconditionally (before the loading/error returns below) so hook
  // order stays stable; post is null until loaded, which the hook handles.
  const placeTitle = usePlaceTitle(post?.place_id)

  useEffect(() => {
    if (!Number.isFinite(postId)) return
    let active = true
    setPostStatus('loading')
    getBoardPost(postId)
      .then((data) => {
        if (active) {
          setPost(data)
          setPostStatus('ready')
        }
      })
      .catch((err) => {
        if (active) {
          setPostError(err.message)
          setPostStatus('error')
        }
      })
    return () => {
      active = false
    }
  }, [postId])

  // Comments are member-only content on this page, so skip the request
  // entirely for non-members instead of fetching data they can't see.
  useEffect(() => {
    if (postStatus !== 'ready' || !isLoggedIn) return
    let active = true
    getBoardComments(postId)
      .then((data) => {
        if (active) setComments(data)
      })
      .catch(() => {
        if (active) setComments([])
      })
    return () => {
      active = false
    }
  }, [postStatus, isLoggedIn, postId])

  if (!Number.isFinite(postId)) return <Navigate to="/community" replace />
  if (postStatus === 'loading') {
    return (
      <div className="page">
        <Header />
        <div className="container api-state" role="status">
          <p className="t-body t-muted">Loading post…</p>
        </div>
        <Footer />
      </div>
    )
  }
  if (postStatus === 'error') {
    return (
      <div className="page">
        <Header />
        <div className="container api-state is-error" role="alert">
          <p className="t-body t-muted">{postError}</p>
          <Link to="/community" className="btn btn-outline">
            Back to Community
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const sortedComments = [...comments].sort((a, b) =>
    commentSort === 'popular' ? b.like_count - a.like_count : new Date(b.created_at) - new Date(a.created_at)
  )

  const addComment = async (e) => {
    e.preventDefault()
    if (!draft.trim() || posting) return
    setPosting(true)
    try {
      const comment = await createBoardComment(postId, draft.trim())
      setComments((cs) => [...cs, comment])
      setPost((p) => ({ ...p, comment_count: p.comment_count + 1 }))
      setDraft('')
    } catch {
      // Comment form keeps the draft on failure so the user doesn't lose it.
    } finally {
      setPosting(false)
    }
  }

  const toggleCommentLike = async (commentId) => {
    try {
      const { liked } = await likeBoardComment(commentId)
      setComments((cs) =>
        cs.map((c) =>
          c.id === commentId ? { ...c, like_count: c.like_count + (liked ? 1 : -1) } : c
        )
      )
      setLikedComments((s) => {
        const next = new Set(s)
        liked ? next.add(commentId) : next.delete(commentId)
        return next
      })
    } catch {
      // Ignore — like state simply doesn't change on failure.
    }
  }

  const togglePostLike = async () => {
    try {
      const { liked } = await likeBoardPost(postId)
      setPost((p) => ({ ...p, like_count: p.like_count + (liked ? 1 : -1) }))
      setPostLiked(liked)
    } catch {
      // Ignore — like state simply doesn't change on failure.
    }
  }

  const typeLabel = toFrontendCommunityCategory(post.category)
  const region = regionLabel(post.area_code)
  const companion = companionSummary(post.companion)

  // Direct URLs to post details are members-only: blur the post behind the
  // same sign-up prompt used on the Community lists.
  if (!isLoggedIn) {
    return (
      <div className="page">
        <Header />
        <div className="map-gate">
          <div className="comm-gate-blur" aria-hidden="true">
            <article className="container post-detail">
              <header className="post-head">
                <div className="comm-item-top">
                  <span className={TYPE_CHIP[typeLabel]}>{typeLabel}</span>
                  {region && <span className="t-caption t-faint">{region}</span>}
                </div>
                <h1 className="t-h2 post-title">{post.title}</h1>
              </header>
              {post.image_url && (
                <div className="ph post-img">
                  <img src={post.image_url} alt="" />
                </div>
              )}
              <div className="post-body">
                <p className="t-body">{post.content.slice(0, 300)}</p>
              </div>
            </article>
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

      <article className="container post-detail">
        <nav className="cat-crumbs t-caption t-faint" aria-label="Breadcrumb">
          <Link to="/community">COMMUNITY</Link>
          <span>/</span>
          <span className="cat-crumb-current">{typeLabel}</span>
        </nav>

        <header className="post-head">
          <div className="comm-item-top">
            <span className={TYPE_CHIP[typeLabel]}>{typeLabel}</span>
            {region && <span className="t-caption t-faint">{region}</span>}
          </div>
          <h1 className="t-h2 post-title">{post.title}</h1>
          <div className="post-byline">
            <div className="avatar">{post.author_nickname.slice(0, 2).toUpperCase()}</div>
            <div>
              <span className="t-small post-author">{post.author_nickname}</span>
              <span className="t-caption t-faint post-date">{formatApiDate(post.created_at)}</span>
            </div>
            {post.rating != null && <Rating value={post.rating} size={15} />}
          </div>
        </header>

        {post.place_id && placeTitle && (
          <p className="t-caption t-faint post-place-ref">
            About{' '}
            <Link to={`/place/${post.place_id}`} className="place-link">
              {placeTitle}
            </Link>
          </p>
        )}

        {companion && (
          <div className="companion-facts post-companion-facts">
            <div className="companion-fact">
              <span className="t-label t-faint">Where</span>
              <span className="t-small">{companion.destination}</span>
            </div>
            <div className="companion-fact">
              <span className="t-label t-faint">When</span>
              <span className="t-small">{companion.dates}</span>
            </div>
            <div className="companion-fact">
              <span className="t-label t-faint">Group</span>
              <span className="t-small">{companion.travelers}</span>
            </div>
          </div>
        )}

        {post.image_url && (
          <div className="ph post-img">
            <img src={post.image_url} alt="" />
          </div>
        )}

        <div className="post-body">
          {post.content.split('\n\n').map((para, i) => (
            <p key={i} className="t-body">
              {para}
            </p>
          ))}
        </div>

        <div className="post-actions">
          <button className={`like-btn ${postLiked ? 'is-liked' : ''}`} onClick={togglePostLike} aria-pressed={postLiked}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={postLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4 8 4c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.4 5 5.3 0 4-4 7.2-9 11.7z" />
            </svg>
            {post.like_count}
          </button>
        </div>

        {/* ---------- Comments ---------- */}
        <section className="comments">
          <div className="comments-head">
            <h2 className="t-h3">Comments ({post.comment_count})</h2>
            <div className="map-sort" role="tablist" aria-label="Sort comments">
              <button
                role="tab"
                aria-selected={commentSort === 'latest'}
                className={`map-sort-btn ${commentSort === 'latest' ? 'is-active' : ''}`}
                onClick={() => setCommentSort('latest')}
              >
                LATEST
              </button>
              <span className="map-sort-sep">|</span>
              <button
                role="tab"
                aria-selected={commentSort === 'popular'}
                className={`map-sort-btn ${commentSort === 'popular' ? 'is-active' : ''}`}
                onClick={() => setCommentSort('popular')}
              >
                POPULAR
              </button>
            </div>
          </div>

          <form className="comment-form" onSubmit={addComment}>
            <div className="avatar">YO</div>
            <input
              className="field-input"
              placeholder="Write a comment…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim() || posting}>
              {posting ? 'Posting…' : 'Post'}
            </button>
          </form>

          <ul className="comment-list">
            {sortedComments.map((c) => (
              <li key={c.id} className="comment">
                <div className="avatar">{c.author_nickname.slice(0, 2).toUpperCase()}</div>
                <div className="comment-main">
                  <div className="comment-top">
                    <span className="t-small comment-author">{c.author_nickname}</span>
                    <span className="t-caption t-faint">{formatApiDate(c.created_at)}</span>
                  </div>
                  <p className="t-small comment-text">{c.content}</p>
                  <button
                    className={`comment-like ${likedComments.has(c.id) ? 'is-liked' : ''}`}
                    onClick={() => toggleCommentLike(c.id)}
                    aria-pressed={likedComments.has(c.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={likedComments.has(c.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 21C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4 8 4c1.6 0 3.1.8 4 2 .9-1.2 2.4-2 4-2 2.8 0 5 2.4 5 5.3 0 4-4 7.2-9 11.7z" />
                    </svg>
                    {c.like_count}
                  </button>
                </div>
              </li>
            ))}
            {comments.length === 0 && (
              <li className="t-small t-muted">No comments yet — be the first.</li>
            )}
          </ul>
        </section>
      </article>

      <Footer />
    </div>
  )
}
