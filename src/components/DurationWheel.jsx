import { useRef, useState } from 'react'

/**
 * Horizontal wheel/carousel picker. The selected option sits centered and
 * prominent; neighbors fade and shrink with distance. Change the value by
 * dragging (mouse or touch), clicking a visible value, or arrow keys.
 * Pointer events cover both mouse and touch dragging.
 */
export default function DurationWheel({ options, value, onChange }) {
  const selectedIndex = Math.max(0, options.indexOf(value))
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(null)
  const moved = useRef(false)
  const trackRef = useRef(null)

  const clampIndex = (i) => Math.min(options.length - 1, Math.max(0, i))
  const itemW = () =>
    trackRef.current?.querySelector('.wheel-item')?.offsetWidth || 132

  // Index the wheel would land on if released now (drives live styling too).
  const liveIndex = clampIndex(Math.round(selectedIndex - dragX / itemW()))

  const select = (i) => onChange(options[clampIndex(i)])

  const onPointerDown = (e) => {
    startX.current = e.clientX
    moved.current = false
    setDragging(true)
    setDragX(0)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (startX.current === null) return
    let dx = e.clientX - startX.current
    if (Math.abs(dx) > 5) moved.current = true
    // Hard-stop at both ends of the range.
    const w = itemW()
    const max = selectedIndex * w
    const min = -(options.length - 1 - selectedIndex) * w
    dx = Math.min(max, Math.max(min, dx))
    setDragX(dx)
  }

  const endDrag = () => {
    if (startX.current === null) return
    const landing = liveIndex
    startX.current = null
    setDragging(false)
    setDragX(0)
    if (landing !== selectedIndex) select(landing)
  }

  return (
    <div
      className={`wheel ${dragging ? 'is-dragging' : ''}`}
      role="radiogroup"
      aria-label="Duration"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') select(selectedIndex - 1)
        if (e.key === 'ArrowRight') select(selectedIndex + 1)
      }}
    >
      <div
        ref={trackRef}
        className="wheel-track"
        style={{
          transform: `translateX(calc(50% - var(--wheel-item-w) * ${selectedIndex + 0.5} + ${dragX}px))`,
          transition: dragging ? 'none' : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {options.map((opt, i) => {
          const dist = Math.min(Math.abs(i - liveIndex), 3)
          const [num, unit] = opt.split(' ')
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={i === selectedIndex}
              className={`wheel-item ${i === liveIndex ? 'is-selected' : ''}`}
              style={{ '--dist': dist }}
              onClick={() => {
                // A drag that ends on a button fires a click — ignore it.
                if (!moved.current) select(i)
              }}
              tabIndex={i === selectedIndex ? 0 : -1}
            >
              <span className="wheel-num">{num}</span>
              <span className="wheel-unit">{unit}</span>
            </button>
          )
        })}
      </div>
      <div className="wheel-hint t-caption t-faint">Drag or tap to change</div>
    </div>
  )
}
