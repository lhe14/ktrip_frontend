// Unified tourism-place index for the place detail page.
//
// NOTE: this repository has no backend — place details and reviews come from
// the existing mock data (EXPLORE_PLACES / ITINERARY / MAP data, and the
// Community's mock REVIEW posts as the review source). When the real
// tourism-place and review APIs exist, `getPlace` and `getPlaceReviews` are
// the two functions to reimplement on top of them.

import { EXPLORE_PLACES, ITINERARY, MAP_PLACES, MAP_RECOMMENDED, POSTS } from './mockData'

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const img = (seed, w = 1100, h = 700) => `https://picsum.photos/seed/${seed}/${w}/${h}`

/* Mock contact/address details for well-known places (visual prototype data). */
const EXTRA_DETAILS = {
  'gyeongbokgung-palace': { address: '161 Sajik-ro, Jongno-gu, Seoul', phone: '+82 2-3700-3900' },
  'gwangjang-market': { address: '88 Changgyeonggung-ro, Jongno-gu, Seoul', phone: '+82 2-2267-0291' },
  'ikseon-dong-hanok-village': { address: 'Ikseon-dong, Jongno-gu, Seoul' },
  'hongdae-street': { address: 'Eoulmadang-ro, Mapo-gu, Seoul' },
  'mangwon-market': { address: '27 Poeun-ro 8-gil, Mapo-gu, Seoul', phone: '+82 2-335-3591' },
  'seongsu-cafe-district': { address: 'Seongsui-ro, Seongdong-gu, Seoul' },
  'seongsu-cafes': { address: 'Seongsui-ro, Seongdong-gu, Seoul' },
  'n-seoul-tower': { address: '105 Namsangongwon-gil, Yongsan-gu, Seoul', phone: '+82 2-3455-9277' },
  myeongdong: { address: 'Myeongdong-gil, Jung-gu, Seoul' },
  'jagalchi-market': { address: '52 Jagalchihaean-ro, Jung-gu, Busan', phone: '+82 51-245-2594' },
  'gamcheon-culture-village': { address: '203 Gamnae 2-ro, Saha-gu, Busan', phone: '+82 51-204-1444' },
  'haeundae-beach': { address: 'Haeundaehaebyeon-ro, Haeundae-gu, Busan' },
  'seongsan-ilchulbong': { address: 'Seongsan-eup, Seogwipo-si, Jeju', phone: '+82 64-783-0959' },
  'dongmun-market': { address: '20 Gwandeok-ro 14-gil, Jeju-si, Jeju' },
  'bulguksa-temple': { address: '385 Bulguk-ro, Gyeongju', phone: '+82 54-746-9913' },
}

/* Build the index once, merging every mock source. Richer entries win. */
const buildIndex = () => {
  const index = new Map()

  const add = (entry) => {
    const slug = slugify(entry.name)
    const existing = index.get(slug) || {}
    index.set(slug, {
      slug,
      ...existing,
      ...Object.fromEntries(Object.entries(entry).filter(([, v]) => v != null)),
    })
  }

  // Map pins / recommendations first (least detail)…
  MAP_PLACES.forEach((p) =>
    add({ name: p.name, category: p.category, location: `${p.area}, Seoul` })
  )
  MAP_RECOMMENDED.forEach((p) => add({ name: p.name, category: p.category, image: p.image }))

  // …then itinerary stops…
  ITINERARY.forEach((day) =>
    day.places.forEach((p) =>
      add({ name: p.name, category: day.category, location: day.area, desc: p.note })
    )
  )

  // …then Explore places (richest: description, meta, large image).
  Object.entries(EXPLORE_PLACES).forEach(([category, places]) =>
    places.forEach((p) =>
      add({
        name: p.name,
        category,
        location: p.location,
        desc: p.desc,
        meta: p.meta,
        image: p.image,
      })
    )
  )

  // Attach mock address/phone and image fallbacks.
  for (const place of index.values()) {
    const extra = EXTRA_DETAILS[place.slug] || {}
    place.address = extra.address || `${place.location || 'Korea'}, South Korea`
    place.phone = extra.phone || null
    if (!place.image) place.image = img(`kplace-${place.slug}`)
  }

  return index
}

const PLACE_INDEX = buildIndex()

export const getPlace = (slug) => PLACE_INDEX.get(slug) || null

/* Reviews for a place — sourced from the Community's mock REVIEW posts. */
export const getPlaceReviews = (slug) =>
  POSTS.filter((p) => p.type === 'REVIEW' && p.place && slugify(p.place) === slug)

export const getAverageRating = (reviews) =>
  reviews.length ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : null
