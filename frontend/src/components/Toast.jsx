// import { useEffect, useState } from 'react'

// export default function Toast({ message, type = 'success', onClose }) {
//   const [visible, setVisible] = useState(true)

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setVisible(false)
//       setTimeout(onClose, 300)
//     }, 3000)
//     return () => clearTimeout(timer)
//   }, [onClose])

//   const styles = {
//     success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
//     error: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
//     info: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
//   }

//   const icons = { success: '✅', error: '❌', info: 'ℹ️' }

//   return (
//     <div
//       className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all duration-300 no-print ${styles[type] ?? styles.info} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
//     >
//       <span>{icons[type]}</span>
//       {message}
//       <button
//         onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
//         className="ml-2 opacity-60 hover:opacity-100 leading-none"
//       >
//         ✕
//       </button>
//     </div>
//   )
// }
import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300) }, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    error:   'border-rose-500/30 bg-rose-500/10 text-rose-400',
    info:    'border-accent/30 bg-accent/10 text-accent',
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl transition-all duration-300 ${styles[type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <span>{icons[type]}</span>
      {message}
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-2 opacity-50 hover:opacity-100 text-xs">✕</button>
    </div>
  )
}
