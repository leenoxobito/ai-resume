import { useState, useEffect } from 'react'
import ScoreRing from '../components/ScoreRing.jsx'

function parseFeedback(text) {
  if (!text) return null
  const scoreMatch = text.match(/overall score[:\s]+(\d+)/i)
  const section = (label) => {
    const re = new RegExp(`${label}[:\\s\\*]+([\\s\\S]*?)(?=\\n\\n?\\d+\\.|\\n\\n?\\*\\*|$)`, 'i')
    const m = text.match(re)
    return m ? m[1].trim() : null
  }
  return {
    score: scoreMatch ? scoreMatch[1] : null,
    strengths: section('strengths'),
    weaknesses: section('weaknesses'),
    improvements: section('specific improvements'),
    raw: text,
  }
}

function parseList(text) {
  if (!text) return []
  return text.split('\n').map(l => l.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean).slice(0, 4)
}

export default function History() {
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('http://localhost:5000/api/analyse', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setHistory(d.resumes || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:5000/api/analyse/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    setHistory(prev => prev.filter(r => r.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const feedback = selected ? parseFeedback(selected.feedback) : null

  return (
    <div className="fade-up">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">History</h1>
        <p className="text-muted text-sm mt-1">All your past resume submissions and their AI feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="h-20 shimmer rounded-2xl" />
            ))
          ) : history.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted font-medium">No resumes yet</p>
              <p className="text-muted/60 text-sm mt-1">Submit your first resume to get started</p>
            </div>
          ) : history.map(r => {
            const p = parseFeedback(r.feedback)
            const score = p?.score ? parseInt(p.score) : null
            const scoreColor = score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-rose-500'
            const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            const isSelected = selected?.id === r.id

            return (
              <div
                key={r.id}
                className={`bg-card rounded-2xl border transition-all cursor-pointer group ${isSelected ? 'border-accent/50 shadow-lg shadow-accent/10' : 'border-border hover:border-accent/30'}`}
              >
                <button
                  onClick={() => setSelected(r)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-9 h-9 rounded-xl ${isSelected ? 'bg-accent' : 'bg-surface border border-border'} flex items-center justify-center shrink-0 transition-all`}>
                    <span className={`text-sm ${isSelected ? 'text-white' : 'text-muted'}`}>◈</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.resume_text.slice(0, 35)}…</p>
                    <p className="text-xs text-muted mt-0.5">{date}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {score && (
                      <div className={`w-8 h-8 rounded-full ${scoreColor} flex items-center justify-center text-xs font-bold font-display text-white shadow-md`}>
                        {score}
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(r.id) }}
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-rose-400 text-xs transition-all px-1"
                    >
                      ✕
                    </button>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="h-full min-h-[300px] bg-card rounded-2xl border border-border flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                  <span className="text-muted text-2xl">◷</span>
                </div>
                <p className="text-muted font-medium">Select a resume</p>
                <p className="text-muted/60 text-sm mt-1">Click any item on the left to view its feedback</p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-6 fade-up">
              <div className="flex items-center gap-4 mb-6">
                <ScoreRing score={feedback?.score} />
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Resume Analysis</h3>
                  <p className="text-muted text-sm mt-1">
                    {new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {feedback?.strengths && (
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                    <p className="text-xs font-semibold font-display text-emerald-400 mb-2">Strengths</p>
                    <ul className="space-y-1">
                      {parseList(feedback.strengths).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                          <span className="text-emerald-400 shrink-0">✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback?.weaknesses && (
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                    <p className="text-xs font-semibold font-display text-amber-400 mb-2">Weaknesses</p>
                    <ul className="space-y-1">
                      {parseList(feedback.weaknesses).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                          <span className="text-amber-400 shrink-0">✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback?.improvements && (
                  <div className="bg-accent/5 border border-accent/15 rounded-xl p-4">
                    <p className="text-xs font-semibold font-display text-accent mb-2">Improvements</p>
                    <ul className="space-y-1">
                      {parseList(feedback.improvements).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                          <span className="text-accent shrink-0">✓</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!feedback?.strengths && !feedback?.weaknesses && (
                  <div className="bg-surface rounded-xl p-4 text-xs text-white/70 leading-relaxed whitespace-pre-wrap">
                    {feedback?.raw}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
