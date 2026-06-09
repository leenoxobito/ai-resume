// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import UploadForm from '../components/UploadForm.jsx'
// import FeedbackPanel from '../components/FeedbackPanel.jsx'
// import ScoreBadge from "../components/ScoreBadge.jsx"
// import Toast from '../components/Toast.jsx'
// import { useApi } from '../hooks/useApi.js'

// export default function Dashboard({ email, onLogout }) {
//   const navigate = useNavigate()
//   const { loading, error, post } = useApi()
//   const [feedback, setFeedback] = useState(null)
//   const [toast, setToast] = useState(null)
  
//   useEffect(() => {
//     if(!email) {
//       navigate('/')
//     }
//   }, [email, navigate])

//   const handleSubmit = async (resumeText) => {
//     setFeedback(null)
//     setToast(null)
//     const data = await post('/api/analyse', { resumeText })
//     if (data) {
//       setFeedback(data.feedback)
//       setToast({ message: 'Resume analysed and saved!', type: 'success' })
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0a0b] text-white font-sans">
//       <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
//         style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

//       <header className="relative border-b border-white/5 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
//             <span className="text-indigo-400 text-xs">✦</span>
//           </div>
//           <span className="font-semibold tracking-tight text-white/90">ResumeAI</span>
//         </div>
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate('/history')}
//             className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
//             History
//           </button>
//           <div className="flex items-center gap-2 pl-3 border-l border-white/10">
//             <span className="text-xs text-white/30">{email}</span>
//             <button onClick={onLogout} className="text-xs text-white/30 hover:text-rose-400 transition-colors">Sign out</button>
//           </div>
//         </div>
//       </header>

//       <main className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight text-white/90">Analyse your resume</h1>
//           <p className="text-sm text-white/40 mt-1">Paste text or upload a PDF to get AI-powered feedback.</p>
//         </div>

//         <UploadForm onSubmit={handleSubmit} loading={loading} />
//         {loading && ( 
//           <p className="text-sm text-white/40">Analysing resume...</p>
//         )}

//         {error && !loading && (
//           <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 flex items-start gap-3">
//             <span className="text-rose-400 text-sm">✕</span>
//             <div>
//               <p className="text-sm font-medium text-rose-400">Something went wrong</p>
//               <p className="text-xs text-rose-400/70 mt-0.5">{error}</p>
//             </div>
//           </div>
//         )}
//         {feedback && feedback.score && (
//           <ScoreBadge score={FeedbackPanel.score} />
//         )}

//         <FeedbackPanel feedback={feedback} loading={loading} />
//       </main>

//       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   )
// }
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreRing from '../components/ScoreRing.jsx'
import Toast from '../components/Toast.jsx'
import { FeedbackSkeleton } from '../components/Skeleton.jsx'
import { useApi } from '../hooks/useApi.js'

const MAX_CHARS = 5000

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
    benchmark: section('industry benchmark'),
    priorities: section('top 3 priority actions'),
    raw: text,
  }
}

function parseList(text) {
  if (!text) return []
  return text
    .split('\n')
    .map(l => l.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 4)
}

export default function Dashboard({ email }) {
  const navigate = useNavigate()
  const { loading, error, post, upload, clearError } = useApi()
  const [resume, setResume] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [toast, setToast] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [history, setHistory] = useState([])
  const fileRef = useRef()

  const greeting = email ? email.split('@')[0] : 'there'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('http://localhost:5000/api/analyse', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setHistory(d.resumes || []))
      .catch(() => {})
  }, [feedback])

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadStatus('Extracting…')
    const formData = new FormData()
    formData.append('resume', file)
    const data = await upload('/api/upload', formData)
    if (data) {
      setResume(data.text.slice(0, MAX_CHARS))
      setUploadStatus(`✓ ${data.pages} page${data.pages > 1 ? 's' : ''}`)
    } else {
      setUploadStatus('✕ Upload failed')
    }
  }

  const handleAnalyse = async () => {
    if (!resume.trim() || loading) return
    const data = await post('/api/analyse', { resumeText: resume })
    if (data) {
      setFeedback(parseFeedback(data.feedback))
      setToast({ message: 'Resume analysed and saved!', type: 'success' })
    }
  }

  const handleDownload = () => {
    if (!feedback) return
    const content = feedback.raw
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume-feedback.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const scoreLabel = (s) => {
    const n = parseInt(s)
    if (n >= 8) return { text: 'Excellent', color: 'text-emerald-400' }
    if (n >= 5) return { text: 'Good', color: 'text-amber-400' }
    return { text: 'Needs Work', color: 'text-rose-400' }
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            Hi, {greeting} 👋
          </h1>
          <p className="text-muted text-sm mt-1">Get AI-powered feedback and improve your resume</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm text-muted hover:text-white hover:border-white/20 transition-all"
          >
            <span className="text-base">◷</span>
            History
            {history.length > 0 && (
              <span className="bg-accent/20 text-accent text-xs px-1.5 py-0.5 rounded-full border border-accent/20">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — input */}
        <div className="lg:col-span-2 space-y-6">

          {/* Upload card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-accent text-sm">✦</span>
                </div>
                <div>
                  <h2 className="font-display font-semibold text-white">Analyse Your Resume</h2>
                  <p className="text-xs text-muted mt-0.5">Paste your resume and our AI will analyse it</p>
                </div>
              </div>
              <div className="text-xs text-muted">.pdf, .docx, .txt (Max 5MB)</div>
            </div>

            <textarea
              value={resume}
              onChange={e => { if (e.target.value.length <= MAX_CHARS) setResume(e.target.value) }}
              placeholder="Paste your resume content here..."
              disabled={loading}
              className="w-full h-48 bg-surface rounded-xl px-4 py-3 text-sm text-white/80 placeholder-muted/40 resize-none focus:outline-none focus:ring-1 focus:ring-accent/40 border border-border transition-all disabled:opacity-50"
            />

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                <button
                  onClick={() => fileRef.current.click()}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
                >
                  <span>⬆</span> Upload File
                </button>
                {uploadStatus && (
                  <span className={`text-xs ${uploadStatus.startsWith('✓') ? 'text-emerald-400' : uploadStatus.startsWith('✕') ? 'text-rose-400' : 'text-muted'}`}>
                    {uploadStatus}
                  </span>
                )}
                <span className={`text-xs ${resume.length > MAX_CHARS * 0.9 ? 'text-amber-400' : 'text-muted/50'}`}>
                  {resume.length} / {MAX_CHARS}
                </span>
              </div>
              <div className="flex gap-2">
                {resume && (
                  <button
                    onClick={() => { setResume(''); setFeedback(null); setUploadStatus('') }}
                    className="px-3 py-1.5 text-xs text-muted hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleAnalyse}
                  disabled={!resume.trim() || loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-40 text-white text-sm font-semibold font-display shadow-lg shadow-accent/20 transition-all"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analysing…
                    </>
                  ) : (
                    <><span>✦</span> Analyse Resume</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-rose-400/60 hover:text-rose-400 text-xs">✕</button>
            </div>
          )}

          {/* Skeleton */}
          {loading && <FeedbackSkeleton />}

          {/* Feedback */}
          {!loading && feedback && (
            <div className="space-y-4 fade-up">
              {/* Feedback header */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <span className="text-accent text-xs">✦</span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-white">AI Feedback</h3>
                      <p className="text-xs text-muted">Detailed analysis and suggestions</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-muted hover:text-white transition-all"
                  >
                    <span>⬇</span> Download Report
                  </button>
                </div>

                {/* Score + cards */}
                <div className="flex gap-6 items-center">
                  {/* Ring */}
                  <div className="shrink-0 text-center">
                    <ScoreRing score={feedback.score} />
                    <div className="mt-2">
                      <p className="text-xs text-muted">ATS Score</p>
                      {feedback.score && (
                        <p className={`text-xs font-semibold mt-0.5 ${scoreLabel(feedback.score).color}`}>
                          {scoreLabel(feedback.score).text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Strengths + Weaknesses */}
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {feedback.strengths && (
                      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-emerald-400">★</span>
                          <span className="text-sm font-semibold font-display text-emerald-400">Strengths</span>
                        </div>
                        <ul className="space-y-1.5">
                          {parseList(feedback.strengths).map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                              <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {feedback.weaknesses && (
                      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-amber-400">⚠</span>
                          <span className="text-sm font-semibold font-display text-amber-400">Weaknesses</span>
                        </div>
                        <ul className="space-y-1.5">
                          {parseList(feedback.weaknesses).map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                              <span className="text-amber-400 mt-0.5 shrink-0">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Improvements */}
                {feedback.improvements && (
                  <div className="mt-4 bg-accent/5 border border-accent/15 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-accent">↗</span>
                      <span className="text-sm font-semibold font-display text-accent">Improvements</span>
                    </div>
                    <ul className="space-y-1.5">
                      {parseList(feedback.improvements).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                          <span className="text-accent mt-0.5 shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Priorities */}
                {feedback.priorities && (
                  <div className="mt-4 bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-purple-400">★</span>
                      <span className="text-sm font-semibold font-display text-purple-400">Top 3 Priority Actions</span>
                    </div>
                    <ul className="space-y-1.5">
                      {parseList(feedback.priorities).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                          <span className="text-purple-400 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fallback raw */}
                {!feedback.strengths && !feedback.weaknesses && (
                  <div className="mt-4 bg-surface rounded-xl p-4 text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                    {feedback.raw}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right — history sidebar */}
        <div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-muted text-base">◷</span>
                <h3 className="font-display font-semibold text-white text-sm">History</h3>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-accent hover:text-accent/80 transition-colors"
              >
                View All
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
                  <span className="text-muted text-xl">◷</span>
                </div>
                <p className="text-sm text-muted font-medium">No more history</p>
                <p className="text-xs text-muted/60 mt-1">Your analysed resumes will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 6).map(r => {
                  const parsed = parseFeedback(r.feedback)
                  const score = parsed?.score ? parseInt(parsed.score) : null
                  const scoreColor = score >= 8 ? 'bg-emerald-500 text-white' : score >= 5 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                  const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  const time = new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  const preview = r.resume_text.slice(0, 28).trim()

                  return (
                    <button
                      key={r.id}
                      onClick={() => setFeedback(parseFeedback(r.feedback))}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-accent text-xs">◈</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{preview}…</p>
                        <p className="text-[11px] text-muted mt-0.5">{date} • {time}</p>
                      </div>
                      {score && (
                        <div className={`w-8 h-8 rounded-full ${scoreColor} flex items-center justify-center text-xs font-bold font-display shrink-0 shadow-md`}>
                          {score}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
