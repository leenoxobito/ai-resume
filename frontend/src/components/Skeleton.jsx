// function SkeletonBlock ({ width = 'w-full', height = 'h-4' }) {
//     return (
//         <div className={`${width} ${height} rounded-lg bg-white/5 relative overflow-hidden`}>
//             <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
//         </div>
//     )
// }

// export function FeedbackSkeleton() {
//     return (
//         <div className="space-y-3 animate-pulse">
//             <div className="flex items-center justify-between">
//                 <SkeletonBlock width="w-24" height="h-3" />
//                 <SkeletonBlock width="w-12" height="h-5" />
//             </div>
//             {[1, 2, 3].map (i => (
//                 <div key={i} className="border border-white/5 rounded-xl p-4 bg-white/[0.02] space-y-3">
//                     <SkeletonBlock width="w-32" height="h-3" />
//                     <SkeletonBlock width="w-full" height="h-3" />
//                     <SkeletonBlock width="w-4/5" height="h-3" />
//                     <SkeletonBlock width="w-3/5" height="h-3" />
//                 </div>
//             ))}
//         </div>
//     )
// }
export function SkeletonBlock({ className = '' }) {
  return <div className={`shimmer rounded-lg ${className}`} />
}

export function FeedbackSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        <SkeletonBlock className="h-[140px]" />
        <SkeletonBlock className="h-[140px]" />
        <SkeletonBlock className="h-[140px]" />
      </div>
      <SkeletonBlock className="h-28" />
    </div>
  )
}

