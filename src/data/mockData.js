// Mock data for the K TRIP visual prototype.

export const CATEGORIES = ['FOOD', 'CULTURE', 'HALLYU', 'SHOPPING', 'ATTRACTIONS']

export const DESTINATIONS = [
  'SEOUL',
  'INCHEON',
  'GANGNEUNG',
  'DAEJEON',
  'GYEONGJU',
  'BUSAN',
  'JEJU',
]

export const DURATIONS = ['1 DAY', '2 DAYS', '3 DAYS', '4 DAYS', '5 DAYS', '6 DAYS', '7 DAYS']

export const PACES = [
  { id: 'RELAXED', desc: 'Slow mornings, long meals, no rush.' },
  { id: 'BALANCED', desc: 'A steady mix of sights and downtime.' },
  { id: 'PACKED', desc: 'See as much as possible, every day.' },
]

const img = (seed, w = 900, h = 700) => `https://picsum.photos/seed/${seed}/${w}/${h}`

/* ---------------- Itinerary (YOUR TRIP) ---------------- */

export const ITINERARY = [
  {
    day: 1,
    title: 'Old Seoul, New Eyes',
    area: 'Jongno · Seoul',
    category: 'CULTURE',
    image: img('ktrip-day1'),
    summary:
      'Start in the historic heart of the city — palace courtyards in the morning light, then hanok alleys that turned into the city’s most loved cafe streets.',
    places: [
      {
        name: 'Gyeongbokgung Palace',
        time: '10:00',
        note: 'The largest of the Joseon palaces. Catch the royal guard change at the main gate.',
      },
      {
        name: 'Ikseon-dong Hanok Village',
        time: '13:30',
        note: 'A maze of 1920s hanok houses reborn as cafes, ateliers and tiny restaurants.',
      },
      {
        name: 'Gwangjang Market',
        time: '18:00',
        note: 'Bindaetteok and mayak gimbap at Korea’s oldest daily market.',
      },
    ],
    route: 'Palace → 15 min walk → Ikseon-dong → Line 1 → Gwangjang',
  },
  {
    day: 2,
    title: 'Seongsu to the River',
    area: 'Seongdong · Seoul',
    category: 'FOOD',
    image: img('ktrip-day2'),
    summary:
      'Seoul’s brooklyn-esque east side — warehouse cafes and small-batch bakeries, ending with sunset by the Han River.',
    places: [
      {
        name: 'Seongsu Cafe District',
        time: '11:00',
        note: 'Roasteries and concept stores inside converted shoe factories.',
      },
      {
        name: 'Ttukseom Hangang Park',
        time: '16:00',
        note: 'Rent a picnic mat, order fried chicken to the river bank. A local ritual.',
      },
      {
        name: 'Mangwon Market',
        time: '19:00',
        note: 'A neighborhood market loved for tteokbokki, kalguksu and honey hotteok.',
      },
    ],
    route: 'Seongsu → Line 2 → Ttukseom → Line 6 → Mangwon',
  },
  {
    day: 3,
    title: 'The Hallyu Loop',
    area: 'Mapo · Seoul',
    category: 'HALLYU',
    image: img('ktrip-day3'),
    summary:
      'A day in the neighborhoods that shaped K-culture — indie stages of Hongdae, K-pop landmarks, and a record shop crawl.',
    places: [
      {
        name: 'Hongdae Street',
        time: '12:00',
        note: 'Busking stages, vintage shops and the youngest energy in the city.',
      },
      {
        name: 'HYBE Insight Area',
        time: '15:00',
        note: 'The K-pop label district around Hangang — a pilgrimage for fans.',
      },
      {
        name: 'Gyeongui Line Book Street',
        time: '17:30',
        note: 'A rail line turned linear park, lined with book cafes and LP bars.',
      },
    ],
    route: 'Hongdae → walk → Book Street → Line 2 → Yongsan',
  },
]

/* ---------------- Explore ---------------- */

export const EXPLORE_INTRO = {
  FOOD: {
    tagline: 'Eat like you live here',
    desc: 'From 4am fish markets to third-wave roasteries — Korea is best understood through what it eats.',
  },
  CULTURE: {
    tagline: 'Five centuries, one city block',
    desc: 'Palaces, hanok villages and contemporary art museums, often within a ten-minute walk of each other.',
  },
  HALLYU: {
    tagline: 'Where the wave begins',
    desc: 'K-pop, K-drama, K-film — visit the studios, stages and streets behind the culture you already know.',
  },
  SHOPPING: {
    tagline: 'From market stalls to flagships',
    desc: 'Underground arcades, beauty megastores and designer boutiques — every budget, every style.',
  },
  ATTRACTIONS: {
    tagline: 'The views worth the trip',
    desc: 'Volcanic peaks, night skylines and coastal villages painted in color.',
  },
}

export const EXPLORE_PLACES = {
  FOOD: [
    {
      name: 'Gwangjang Market',
      location: 'Jongno, Seoul',
      desc: 'Korea’s oldest daily market. Come hungry: bindaetteok, mayak gimbap, yukhoe.',
      meta: 'Street food · Open daily 09:00–23:00',
      image: img('kfood1'),
      featured: true,
    },
    {
      name: 'Jagalchi Market',
      location: 'Nampo, Busan',
      desc: 'The country’s largest seafood market. Pick your fish downstairs, eat it upstairs.',
      meta: 'Seafood · Best before noon',
      image: img('kfood2'),
    },
    {
      name: 'Seongsu Bakeries',
      location: 'Seongdong, Seoul',
      desc: 'Small-batch sourdough and salt bread in converted warehouses.',
      meta: 'Cafe · Weekday mornings are quietest',
      image: img('kfood3'),
    },
    {
      name: 'Dongmun Market',
      location: 'Jeju City, Jeju',
      desc: 'Night market skewers, hallabong juice and black pork bao.',
      meta: 'Night market · 18:00–24:00',
      image: img('kfood4'),
    },
    {
      name: 'Mangwon Market',
      location: 'Mapo, Seoul',
      desc: 'A local neighborhood market famous for tteokbokki and honey hotteok.',
      meta: 'Street food · Cash friendly',
      image: img('kfood5'),
    },
  ],
  CULTURE: [
    {
      name: 'Gyeongbokgung Palace',
      location: 'Jongno, Seoul',
      desc: 'The main royal palace of the Joseon dynasty. Rent a hanbok for free entry.',
      meta: 'Heritage · Closed Tuesdays',
      image: img('kcul1'),
      featured: true,
    },
    {
      name: 'Bulguksa Temple',
      location: 'Gyeongju',
      desc: 'A UNESCO-listed 8th-century temple in the old Silla capital.',
      meta: 'UNESCO · Early morning light is best',
      image: img('kcul2'),
    },
    {
      name: 'Leeum Museum of Art',
      location: 'Yongsan, Seoul',
      desc: 'Traditional Korean art beside Rothko and Koons, in buildings by Botta and Koolhaas.',
      meta: 'Museum · Free permanent collection',
      image: img('kcul3'),
    },
    {
      name: 'Gamcheon Culture Village',
      location: 'Saha, Busan',
      desc: 'A hillside village turned open-air gallery of murals and pastel houses.',
      meta: 'Village · Wear comfortable shoes',
      image: img('kcul4'),
    },
    {
      name: 'Ojukheon House',
      location: 'Gangneung',
      desc: 'One of Korea’s oldest wooden residences, framed by black bamboo.',
      meta: 'Heritage · Pairs well with Gyeongpo Beach',
      image: img('kcul5'),
    },
  ],
  HALLYU: [
    {
      name: 'Hongdae Street',
      location: 'Mapo, Seoul',
      desc: 'Busking stages and indie clubs — the proving ground of K-pop.',
      meta: 'Nightlife · Fridays are peak',
      image: img('khal1'),
      featured: true,
    },
    {
      name: 'HYBE / K-pop Label District',
      location: 'Yongsan, Seoul',
      desc: 'The headquarters mile of BTS, and the museums that come with it.',
      meta: 'Landmark · Book exhibitions ahead',
      image: img('khal2'),
    },
    {
      name: 'K-Star Road',
      location: 'Gangnam, Seoul',
      desc: 'Apgujeong’s celebrity mile — entertainment agencies and GangnamDol figures.',
      meta: 'Walk · 1.4 km, flat',
      image: img('khal3'),
    },
    {
      name: 'Drama Filming Sites Tour',
      location: 'Various, Seoul',
      desc: 'From Goblin’s bookstore to Itaewon Class alleys — a self-guided loop.',
      meta: 'Tour · Half day',
      image: img('khal4'),
    },
    {
      name: 'Gwangalli Beach',
      location: 'Suyeong, Busan',
      desc: 'The drone-show beach that headlines every K-drama set in Busan.',
      meta: 'Beach · Drone show Saturdays 20:00',
      image: img('khal5'),
    },
  ],
  SHOPPING: [
    {
      name: 'Seongsu Concept Stores',
      location: 'Seongdong, Seoul',
      desc: 'Pop-ups and flagship experiments from Korea’s biggest fashion and beauty brands.',
      meta: 'Fashion · New pop-ups weekly',
      image: img('kshp1'),
      featured: true,
    },
    {
      name: 'Myeongdong',
      location: 'Jung, Seoul',
      desc: 'The beauty megastore district — K-skincare at every price point.',
      meta: 'Beauty · Tax refund available',
      image: img('kshp2'),
    },
    {
      name: 'Goto Mall',
      location: 'Seocho, Seoul',
      desc: 'An 880-meter underground arcade of bargain fashion beneath the express bus terminal.',
      meta: 'Underground arcade · Cash gets discounts',
      image: img('kshp3'),
    },
    {
      name: 'Gukje Market',
      location: 'Jung, Busan',
      desc: 'A post-war market of vintage goods, fabrics and street snacks.',
      meta: 'Market · Haggling expected',
      image: img('kshp4'),
    },
    {
      name: 'Dongdaemun DDP Area',
      location: 'Jung, Seoul',
      desc: 'Wholesale fashion towers that stay open until dawn, beside Zaha Hadid’s DDP.',
      meta: 'Fashion · Open until 05:00',
      image: img('kshp5'),
    },
  ],
  ATTRACTIONS: [
    {
      name: 'Seongsan Ilchulbong',
      location: 'Seogwipo, Jeju',
      desc: 'A volcanic tuff cone rising from the sea — the sunrise hike of Korea.',
      meta: 'UNESCO · 50 min round trip',
      image: img('katt1'),
      featured: true,
    },
    {
      name: 'N Seoul Tower',
      location: 'Yongsan, Seoul',
      desc: 'The classic night view of the capital, reached by cable car over Namsan.',
      meta: 'Viewpoint · Clearest after rain',
      image: img('katt2'),
    },
    {
      name: 'Haeundae Beach',
      location: 'Haeundae, Busan',
      desc: 'Korea’s most famous beach, backed by the Marine City skyline.',
      meta: 'Beach · Blueline Park nearby',
      image: img('katt3'),
    },
    {
      name: 'Aewol Coastal Road',
      location: 'Aewol, Jeju',
      desc: 'Basalt cliffs, cafes over the water and the best sunsets on the island.',
      meta: 'Scenic drive · Rent a car',
      image: img('katt4'),
    },
    {
      name: 'Gyeongpo Beach',
      location: 'Gangneung',
      desc: 'Pine forests meeting the East Sea — an easy KTX day trip from Seoul.',
      meta: 'Beach · 2h from Seoul by KTX',
      image: img('katt5'),
    },
  ],
}

/* ---------------- Map ---------------- */

// `day` marks places that belong to the user's personalized itinerary (YOUR TRIP map view).
export const MAP_PLACES = [
  { id: 1, name: 'Gyeongbokgung Palace', category: 'CULTURE', x: 44, y: 26, area: 'Jongno', day: 1 },
  { id: 2, name: 'Ikseon-dong', category: 'CULTURE', x: 52, y: 32, area: 'Jongno', day: 1 },
  { id: 3, name: 'Gwangjang Market', category: 'FOOD', x: 58, y: 38, area: 'Jongno', day: 1 },
  { id: 4, name: 'Myeongdong', category: 'SHOPPING', x: 50, y: 46, area: 'Jung' },
  { id: 5, name: 'N Seoul Tower', category: 'ATTRACTIONS', x: 54, y: 56, area: 'Yongsan' },
  { id: 6, name: 'Hongdae Street', category: 'HALLYU', x: 18, y: 42, area: 'Mapo', day: 3 },
  { id: 7, name: 'Mangwon Market', category: 'FOOD', x: 12, y: 50, area: 'Mapo', day: 2 },
  { id: 8, name: 'HYBE District', category: 'HALLYU', x: 46, y: 66, area: 'Yongsan', day: 3 },
  { id: 9, name: 'Seongsu Cafes', category: 'FOOD', x: 76, y: 40, area: 'Seongdong', day: 2 },
  { id: 10, name: 'Dongdaemun DDP', category: 'SHOPPING', x: 64, y: 42, area: 'Jung' },
  { id: 11, name: 'Leeum Museum', category: 'CULTURE', x: 56, y: 62, area: 'Yongsan' },
  { id: 12, name: 'Ttukseom Park', category: 'ATTRACTIONS', x: 80, y: 52, area: 'Gwangjin', day: 2 },
]

export const MAP_RECOMMENDED = [
  {
    name: 'Gyeongbokgung Palace',
    category: 'CULTURE',
    note: 'On your Day 1 route',
    distance: '1.2 km',
    image: img('kmap1', 640, 400),
  },
  {
    name: 'Gwangjang Market',
    category: 'FOOD',
    note: 'On your Day 1 route',
    distance: '2.0 km',
    image: img('kmap2b', 640, 400),
  },
  {
    name: 'Hongdae Street',
    category: 'HALLYU',
    note: 'On your Day 3 route',
    distance: '5.4 km',
    image: img('kmap3', 640, 400),
  },
  {
    name: 'Seongsu Cafes',
    category: 'FOOD',
    note: 'On your Day 2 route',
    distance: '6.1 km',
    image: img('kmap4', 640, 400),
  },
  {
    name: 'Myeongdong',
    category: 'SHOPPING',
    note: 'Near your hotel',
    distance: '0.8 km',
    image: img('kmap5', 640, 400),
  },
  {
    name: 'N Seoul Tower',
    category: 'ATTRACTIONS',
    note: 'Best at night',
    distance: '2.6 km',
    image: img('kmap6', 640, 400),
  },
]

/* ---------------- Community ---------------- */

export const POSTS = [
  {
    id: 1,
    type: 'REVIEW',
    title: 'Three mornings at Gwangjang Market — what to actually order',
    region: 'Seoul',
    author: 'Mia T.',
    date: '2026-09-14',
    likes: 128,
    comments: 24,
    rating: 5,
    place: 'Gwangjang Market',
    image: img('kpost1', 800, 500),
    content:
      'I went three mornings in a row and tried something different each time. The bindaetteok (mung bean pancake) at the corner stall near the east gate is the one — crispy edges, huge portion, ₩5,000. Mayak gimbap lives up to the hype, and don’t skip the yukhoe alley if you’re okay with raw beef. Go before 11am on weekdays; by noon on Saturday you cannot move.\n\nTips: bring cash, share portions so you can try more, and the ladies will wave you over — just sit wherever there’s a stool.',
  },
  {
    id: 2,
    type: 'Q&A',
    title: 'Is Busan worth visiting in winter?',
    region: 'Busan',
    author: 'Jonas K.',
    date: '2026-09-13',
    likes: 45,
    comments: 18,
    content:
      'I have 5 days in Korea in late January. Everyone talks about Busan in summer — is it still worth the KTX trip in winter, or should I stay in Seoul?',
  },
  {
    id: 3,
    type: 'TIPS',
    title: 'How I did 7 days in Korea on $60/day (including hotels)',
    region: 'Seoul · Busan',
    author: 'Priya S.',
    date: '2026-09-12',
    likes: 231,
    comments: 41,
    image: img('kpost3', 800, 500),
    content:
      'Full budget breakdown: guesthouses in Hongdae and Nampo-dong, T-money for everything, market food for most meals, and free walking days. The biggest saver was skipping taxis entirely — the subway is genuinely better.',
  },
  {
    id: 4,
    type: 'COMPANION',
    title: 'Looking for 1–2 people: Jeju road trip, Oct 24–27',
    region: 'Jeju',
    author: 'Dana L.',
    date: '2026-09-12',
    likes: 12,
    comments: 9,
    companion: { destination: 'Jeju', dates: 'Oct 24 – 27', travelers: '2 of 4 filled' },
    content:
      'Renting a car for a 4-day loop around the island — Aewol, Seongsan sunrise hike, Udo island day trip. Splitting car + fuel + stays. I’m 28F, easygoing, planning relaxed mornings. DM if interested!',
  },
  {
    id: 5,
    type: 'Q&A',
    title: 'Where can I buy a T-money card?',
    region: 'Seoul',
    author: 'Tom W.',
    date: '2026-09-11',
    likes: 33,
    comments: 12,
    content: 'Landing at Incheon next week — can I get a T-money card at the airport, or should I wait for a convenience store in the city?',
  },
  {
    id: 6,
    type: 'REVIEW',
    title: 'Seongsan Ilchulbong at sunrise — worth the 5am alarm',
    region: 'Jeju',
    author: 'Elena R.',
    date: '2026-09-10',
    likes: 187,
    comments: 29,
    rating: 5,
    place: 'Seongsan Ilchulbong',
    image: img('kpost6', 800, 500),
    content:
      'We hiked up in the dark with maybe forty other people and watched the sun come up over the crater rim. 50 minutes round trip, well-maintained stairs. Bring a windbreaker even in summer — it is seriously windy at the top.',
  },
  {
    id: 7,
    type: 'TIPS',
    title: 'Best way to get from Seoul to Incheon Airport?',
    region: 'Seoul · Incheon',
    author: 'Kenji M.',
    date: '2026-09-09',
    likes: 58,
    comments: 15,
    content:
      'AREX Express vs All-Stop vs airport limousine bus — I’ve tried all three. Short version: Express from Seoul Station if you have luggage, limousine bus if your hotel is in Gangnam.',
  },
  {
    id: 8,
    type: 'COMPANION',
    title: 'Seoul food crawl buddy, any weekend in October',
    region: 'Seoul',
    author: 'Marco B.',
    date: '2026-09-08',
    likes: 21,
    comments: 11,
    companion: { destination: 'Seoul', dates: 'Weekends in Oct', travelers: '1 of 2 filled' },
    content:
      'Solo traveler, want a partner for a proper market crawl — Gwangjang, Mangwon, Tongin. I eat everything. Split everything, walk everywhere.',
  },
  {
    id: 9,
    type: 'REVIEW',
    title: 'Gamcheon Culture Village — go early, skip the crowds',
    region: 'Busan',
    author: 'Sofia G.',
    date: '2026-09-07',
    likes: 96,
    comments: 17,
    rating: 4,
    place: 'Gamcheon Culture Village',
    image: img('kpost9', 800, 500),
    content:
      'Beautiful, photogenic, and genuinely fun to get lost in — but by 11am the main alley is a queue. We arrived at 8:30 and had the murals to ourselves. The stamp tour map (₩2,000) is a nice way to structure the visit.',
  },
  {
    id: 10,
    type: 'Q&A',
    title: 'Do I need to book Gyeongbokgung hanbok rental ahead?',
    region: 'Seoul',
    author: 'Amelie F.',
    date: '2026-09-06',
    likes: 27,
    comments: 8,
    content: 'Visiting in early November — do the hanbok rental shops near Gyeongbokgung take walk-ins, or should I reserve online?',
  },
]

export const COMMENTS = {
  1: [
    {
      id: 1,
      author: 'Jinwoo P.',
      date: '2026-09-14',
      likes: 14,
      content: 'The east gate bindaetteok stall is exactly right. Locals queue there too.',
    },
    {
      id: 2,
      author: 'Hannah C.',
      date: '2026-09-14',
      likes: 8,
      content: 'Adding this to my Day 1! Is there anything vegetarian-friendly there?',
    },
    {
      id: 3,
      author: 'Mia T.',
      date: '2026-09-15',
      likes: 6,
      content: '@Hannah — the bindaetteok itself is vegetarian, and look for the japchae stalls near the center.',
    },
  ],
  2: [
    {
      id: 1,
      author: 'Busan local',
      date: '2026-09-13',
      likes: 22,
      content:
        'Winter Busan is underrated — clear skies, no humidity, hot eomuk soup at Jagalchi. The sea mist over Gwangalli in January is beautiful.',
    },
    {
      id: 2,
      author: 'Priya S.',
      date: '2026-09-13',
      likes: 9,
      content: 'Did it last February. Two days is perfect: one for Haeundae/Gwangalli, one for Gamcheon and the markets.',
    },
  ],
  4: [
    {
      id: 1,
      author: 'Chris O.',
      date: '2026-09-12',
      likes: 3,
      content: 'Interested! I’m in Seoul those exact dates. Sent you a DM.',
    },
  ],
}

export const AUTHOR_INITIALS = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
