import { apiRequest } from './api'

// GET /itinerary accepts the frontend's own vocabulary directly (categories,
// region, pace) and resolves it to backend codes server-side — see
// app/api/itinerary.py's docstring example. No local mapping needed.
export const getItinerary = ({ categories = [], region, days, pace } = {}) => {
  const query = new URLSearchParams()
  categories.forEach((c) => query.append('categories', c))
  if (region) query.set('region', region)
  if (days) query.set('days', String(days))
  if (pace) query.set('pace', pace)
  const qs = query.toString()
  return apiRequest(`/itinerary${qs ? `?${qs}` : ''}`)
}
