import { useEffect, useRef } from 'react'

// Animated circular score ring
export default function ScoreRing({ score }) {
  const circleRef = useRef(null)
  const num = parseInt(score) || 0
  // Circumference of circle r=46 → 2πr ≈ 289
  const circumference = 289
  const offset = circumference - (num / 10) * circumference

  const color =
    num >= 8 ? '#22c55e'
    : num >= 5 ? '#f59e0b'
    : '#ef4444'

  useEffect(() => {
    if (!circleRef.current) return
    circleRef.current.style.setProperty('--target-offset', offset)
    circleRef.current.style.strokeDashoffset = circumference
    // Trigger reflow then animate
    void circleRef.current.getBoundingClientRect()
    circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)'
    circleRef.current.style.strokeDashoffset = offset
  }, [score])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        {/* Track */}
        <circle cx="70" cy="70" r="46" fill="none" stroke="#22222e" strokeWidth="10" />
        {/* Fill */}
        <circle
          ref={circleRef}
          cx="70" cy="70" r="46"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-4xl text-white leading-none">{num}</span>
        <span className="text-xs text-muted mt-0.5">/10</span>
      </div>
    </div>
  )
}
