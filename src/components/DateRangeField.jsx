import { useEffect, useRef, useState } from 'react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad2 = (n) => String(n).padStart(2, '0')

// 'YYYY-MM-DD' <-> local Date, built manually (not toISOString/Date.parse)
// so the picker never drifts a day from timezone/UTC conversion.
const toDateStr = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const parseDateStr = (str) => {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const formatDisplay = (date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const isSameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1)

// Fixed 6-week (42 cell) grid — outside-month cells render blank so the
// calendar height never jumps between months, and there's no ambiguity
// about which month a click on a leading/trailing day belongs to.
function buildGridDays(viewMonth) {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length < 42) cells.push(null)
  return cells
}

/**
 * Date range field matching K-TRIP's field/input styling — click the trigger
 * to open a single-month English calendar, click a start day then an end
 * day to select a connected range, click outside to close. Emits plain
 * 'YYYY-MM-DD' strings via onChange so the existing start_date/end_date
 * payload shape is untouched.
 */
export default function DateRangeField({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(parseDateStr(startDate) || new Date())
  )
  const [hoverDate, setHoverDate] = useState(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const start = parseDateStr(startDate)
  const end = parseDateStr(endDate)

  // While only the start is picked, preview the range up to the hovered day
  // so the user can see it grow before committing the end date.
  const previewEnd = !end && hoverDate ? hoverDate : end
  const rangeStart = previewEnd && previewEnd < start ? previewEnd : start
  const rangeEnd = previewEnd && previewEnd < start ? start : previewEnd

  const selectDay = (day) => {
    if (!start || end) {
      onChange({ startDate: toDateStr(day), endDate: '' })
      return
    }
    if (day < start) {
      onChange({ startDate: toDateStr(day), endDate: toDateStr(start) })
    } else {
      onChange({ startDate: toDateStr(start), endDate: toDateStr(day) })
    }
    setOpen(false)
  }

  const label =
    start && end
      ? `${formatDisplay(start)} – ${formatDisplay(end)}`
      : start
        ? `${formatDisplay(start)} – Select end date`
        : 'Select travel dates'

  const days = buildGridDays(viewMonth)

  return (
    <div className="date-range-field" ref={wrapRef}>
      <button
        type="button"
        className="field-input date-range-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={start ? '' : 't-faint'}>{label}</span>
      </button>

      {open && (
        <div className="date-range-popover">
          <div className="date-range-nav">
            <button
              type="button"
              className="date-range-nav-btn"
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="date-range-nav-label">
              {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              className="date-range-nav-btn"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="date-range-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="date-range-grid">
            {days.map((day, i) => {
              if (!day) return <div key={i} className="date-range-day-cell" />

              const isStart = isSameDay(day, rangeStart)
              const isEnd = isSameDay(day, rangeEnd)
              const inRange = rangeStart && rangeEnd && day > rangeStart && day < rangeEnd
              const highlighted = isStart || isEnd || inRange
              const col = i % 7
              const leftRounded = isStart || (highlighted && col === 0)
              const rightRounded = isEnd || (highlighted && col === 6)

              return (
                <div key={i} className="date-range-day-cell">
                  <div
                    className={`date-range-day-track ${highlighted ? 'is-in-range' : ''} ${
                      leftRounded ? 'is-left-rounded' : ''
                    } ${rightRounded ? 'is-right-rounded' : ''}`}
                  >
                    <button
                      type="button"
                      className={`date-range-day-btn ${isStart || isEnd ? 'is-endpoint' : ''}`}
                      onClick={() => selectDay(day)}
                      onMouseEnter={() => setHoverDate(day)}
                      aria-label={formatDisplay(day)}
                      aria-pressed={isStart || isEnd}
                    >
                      {day.getDate()}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
