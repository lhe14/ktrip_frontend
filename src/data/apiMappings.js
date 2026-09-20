// Frontend ↔ FastAPI value mappings. UI labels remain unchanged.

export const THEME_CODE = {
  FOOD: 'food',
  CULTURE: 'culture',
  SHOPPING: 'shopping',
  HALLYU: 'hallyu',
  ATTRACTIONS: 'sightseeing',
}

export const PACE_PLACES_PER_DAY = {
  RELAXED: 3,
  BALANCED: 5,
  PACKED: 7,
}

// Verified against app/services/region_mapper.py in the FastAPI project.
export const AREA_CODE = {
  SEOUL: '1',
  INCHEON: '2',
  GANGNEUNG: '32',
  DAEJEON: '3',
  GYEONGJU: '35',
  BUSAN: '6',
  JEJU: '39',
}

// Reverse of AREA_CODE, for displaying a board post's area_code back as a
// frontend region name. Board posts don't otherwise expose which region they
// belong to except through this numeric TourAPI code.
export const AREA_CODE_TO_REGION = Object.fromEntries(
  Object.entries(AREA_CODE).map(([region, code]) => [code, region])
)

// Verified against app/models/board.py's BoardCategory enum — the backend
// does NOT resolve frontend category labels itself (unlike region/theme/pace
// on /itinerary and /places), so this mapping is required for board calls.
export const COMMUNITY_CATEGORY = {
  'Q&A': 'qna',
  TIPS: 'tips',
  REVIEW: 'review',
  COMPANION: 'companion',
}

export const toBackendCommunityCategory = (frontendCategory) =>
  COMMUNITY_CATEGORY[frontendCategory] ?? null

// Reverse of COMMUNITY_CATEGORY, for displaying a fetched post's backend
// category back as its frontend chip label.
const CATEGORY_TO_FRONTEND = Object.fromEntries(
  Object.entries(COMMUNITY_CATEGORY).map(([label, code]) => [code, label])
)
export const toFrontendCommunityCategory = (backendCategory) =>
  CATEGORY_TO_FRONTEND[backendCategory] ?? backendCategory?.toUpperCase() ?? ''

// created_at / start_date / end_date all arrive as ISO strings. Trim to the
// date portion only — no locale/timezone guessing beyond what the API sent.
export const formatApiDate = (isoString) => (isoString ? isoString.slice(0, 10) : null)

export const regionLabel = (areaCode) => AREA_CODE_TO_REGION[areaCode] || areaCode || null

// BoardPostCompanion -> the {destination, dates, travelers} shape the
// Community/PostDetail UI renders. Only formats fields the API actually
// returned — a missing travelers_needed just omits the "of N" clause instead
// of inventing a total.
export const companionSummary = (companion) => {
  if (!companion) return null
  const start = formatApiDate(companion.start_date)
  const end = formatApiDate(companion.end_date)
  const dates = start && end ? `${start} – ${end}` : start || end || '—'
  const joined = companion.travelers_joined ?? 1
  const travelers = companion.travelers_needed
    ? `${joined} of ${companion.travelers_needed} filled`
    : `${joined} joined`
  return { destination: companion.destination, dates, travelers }
}
