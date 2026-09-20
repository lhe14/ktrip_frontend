export default function Rating({ value = 0, size = 16, interactive = false, onChange }) {
  return (
    <div className="rating" role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`rating-star ${n <= value ? 'is-filled' : ''} ${interactive ? 'is-interactive' : ''}`}
          onClick={interactive ? () => onChange?.(n) : undefined}
          tabIndex={interactive ? 0 : -1}
          aria-hidden={!interactive}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
