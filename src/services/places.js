import { useEffect, useState } from 'react'
import { apiRequest } from './api'

export const THEME_TO_CATEGORY = {
  food: 'FOOD',
  culture: 'CULTURE',
  shopping: 'SHOPPING',
  hallyu: 'HALLYU',
  sightseeing: 'ATTRACTIONS',
}

export const categoryFromTheme = (theme) => THEME_TO_CATEGORY[theme] || null

export const getPlaces = ({ category, region, limit = 20, offset = 0 } = {}) => {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (category) query.set('category', category)
  if (region) query.set('region', region)
  return apiRequest(`/places?${query.toString()}`)
}

export const getPlaceById = (placeId) => apiRequest(`/places/${placeId}`)

// Community REVIEW posts only carry a place_id, not the place's name — this
// resolves it to the real title via GET /places/{id} so callers never fall
// back to showing the raw id (e.g. "Place #1").
export function usePlaceTitle(placeId) {
  const [title, setTitle] = useState(null)

  useEffect(() => {
    if (!placeId) {
      setTitle(null)
      return
    }
    let active = true
    getPlaceById(placeId)
      .then((data) => {
        if (active) setTitle(data.title)
      })
      .catch(() => {
        if (active) setTitle(null)
      })
    return () => {
      active = false
    }
  }, [placeId])

  return title
}

// GET /places/nearby — real lat/lon required (see nearby.py). Results are
// always distance-sorted server side; there is no separate "recommended"
// ranking field, so callers should not invent one.
export const getNearbyPlaces = ({ lat, lon, radiusKm = 5, limit = 12, theme } = {}) => {
  const query = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius_km: String(radiusKm),
    limit: String(limit),
  })
  if (theme) query.set('theme', theme)
  return apiRequest(`/places/nearby?${query.toString()}`)
}
