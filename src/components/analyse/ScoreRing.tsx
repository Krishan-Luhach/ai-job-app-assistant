'use client'
// Circular progress ring for match score
export default function ScoreRing({ score }: { score: number }) {
  const radius      = 54
  const stroke      = 8
  const normalised  = radius - stroke / 2
  const circumference = 2 * Math.PI * normalised
  const offset      = circumference - (score / 100) * circumference
  const colour      = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'
 
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={120} height={120}>
        {/* Track */}
        <circle cx={60} cy={60} r={normalised} fill="none"
          stroke="#E2E8F0" strokeWidth={stroke} />
        {/* Progress */}
        <circle cx={60} cy={60} r={normalised} fill="none"
          stroke={colour} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x={60} y={60} textAnchor="middle" dy="0.35em"
          fontSize={22} fontWeight={700} fill={colour}>
          {score}
        </text>
      </svg>
      <p className="text-slate-500 text-sm">Match Score</p>
    </div>
  )
}