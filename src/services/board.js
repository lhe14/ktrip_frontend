import { apiRequest } from './api'
import { COMMUNITY_CATEGORY } from '../data/apiMappings'

// GET /board/posts?category=... expects the backend's lowercase category
// string (qna/tips/review/companion) — there is no server-side resolver for
// this one, unlike region/theme, so the frontend must map it itself.
export const getBoardPosts = ({ category, limit = 50, offset = 0 } = {}) => {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (category) query.set('category', COMMUNITY_CATEGORY[category] || category)
  return apiRequest(`/board/posts?${query.toString()}`)
}

export const getBoardPost = (postId) => apiRequest(`/board/posts/${postId}`)

export const createBoardPost = (payload) =>
  apiRequest('/board/posts', { method: 'POST', json: payload })

export const likeBoardPost = (postId) => apiRequest(`/board/posts/${postId}/like`, { method: 'POST' })

export const getBoardComments = (postId) => apiRequest(`/board/posts/${postId}/comments`)

export const createBoardComment = (postId, content) =>
  apiRequest(`/board/posts/${postId}/comments`, { method: 'POST', json: { content } })

export const likeBoardComment = (commentId) =>
  apiRequest(`/board/comments/${commentId}/like`, { method: 'POST' })
