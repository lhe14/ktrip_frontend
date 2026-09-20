import { createContext, useContext, useEffect, useState } from 'react'

const TripContext = createContext(null)

const DEFAULTS = {
  // First-time visitors start with nothing selected; saved selections are
  // restored from localStorage below.
  interests: [],
  destination: 'SEOUL',
  duration: '3 DAYS',
  pace: 'BALANCED',
  completed: false,
}

export function TripProvider({ children }) {
  const [trip, setTrip] = useState(() => {
    try {
      const saved = localStorage.getItem('ktrip-preferences')
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('ktrip-preferences', JSON.stringify(trip))
    } catch {
      /* storage unavailable — prototype still works in memory */
    }
  }, [trip])

  // Accepts a patch object, or a function of the current trip returning one.
  const update = (patch) =>
    setTrip((t) => ({ ...t, ...(typeof patch === 'function' ? patch(t) : patch) }))

  return <TripContext.Provider value={{ trip, update }}>{children}</TripContext.Provider>
}

export const useTrip = () => useContext(TripContext)
