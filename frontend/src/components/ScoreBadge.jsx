export default function ScoreBadge({ score }) {
  const num = parseInt(score)
  if (isNaN(num)) return null

  const style =
    num >= 8
      ? 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/10'
      : num >= 5
      ? 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10'
      : 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-400/30 bg-rose-50 dark:bg-rose-400/10'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${style}`}>
      {num}/10
    </span>
  )
}
