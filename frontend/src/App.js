import { useState, useEffect, useRef } from 'react'
import AuthScreen from './AuthScreen.jsx'
import { FeedbackSkeleton } from './Skeleton.jsx'
import HistoryPanel from './compenents/HistoryPanel.jsx'
import Toast from './compenents/Toast.jsx'
import ScoreBadge from './compenents/ScoreBadge.jsx'
import { useTheme } from './context/ThemeContext.jsx'
import { useAuth } from './hooks/useAuth.js'

const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' }
const MAX_CHARS = 5000
const API = 'http://localhost:5000'

function parseFeedback(text) {
  if (!text) return null
  const scoreMatch = text.match(/overall score[:\s*]+(\d+)/i)
  const atsMatch = text.match(/ats score[:\s*]+(\d+)/i)
  const section = (label) => {
    const re = new RegExp(`${label}[:\\s\\*]+([\\s\\S]*?)(?=\\n\\n?\\d+\\.|\\n\\n?\\*\\*|$)`, 'i')
    const m = text.match(re)
    return m ? m[1].trim() : null
  }
  return {
    score: scoreMatch ? scoreMatch[1] : null,
    atsScore: atsMatch ? atsMatch[1] : null,
    strengths: section('strengths'),
    weaknesses: section('weaknesses'),
    improvements: section('specific improvements'),
    benchmark: section('industry benchmark'),
    priorities: section('top 3 priority actions'),
    ats: section('ats score'),
    raw: text,
  }
}

function FeedbackSection({ title, icon, children }) {
  if (!children) return null
  return (
    <div className="border border-gray-200 dark:border-white/5 rounded-xl p-4 bg-gray-50 dark:bg-white/[0.02] space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-white/70">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed whitespace-pre-wrap">
        {children}
      </p>
    </div>
  )
}

function ATSBadge({ score }) {
  const num = parseInt(score)
  if (isNaN(num)) return null
  const color =
    num >= 8
      ? 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/10'
      : num >= 5
      ? 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10'
      : 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-400/30 bg-rose-50 dark:bg-rose-400/10'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${color}`}>
      ATS {num}/10
    </span>
  )
}

export default function App() {
  const { token, email: userEmail, login, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const [resume, setResume] = useState('')
  const [status, setStatus] = useState(STATUS.IDLE)
  const [feedback, setFeedback] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [toast, setToast] = useState(null)
  const fileRef = useRef()

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const showToast = (message, type = 'success') => setToast({ message, type })

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`${API}/api/analyse`, { headers: authHeaders })
      if (!res.ok) return
      const data = await res.json()
      setHistory(data.resumes || [])
    } catch {}
    finally { setHistoryLoading(false) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (token) fetchHistory() }, [token])

  const handleLogout = () => {
    logout()
    setResume('')
    setFeedback(null)
    setHistory([])
    setStatus(STATUS.IDLE)
    setErrorMsg('')
    setUploadStatus('')
  }

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadStatus('Extracting text from file…')
    const formData = new FormData()
    formData.append('resume', file)
    try {
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResume(data.text.slice(0, MAX_CHARS))
      setUploadStatus(`✅ Extracted ${data.pages} page${data.pages > 1 ? 's' : ''}`)
    } catch (err) {
      setUploadStatus(`❌ ${err.message}`)
    }
  }

  const handleSubmit = async () => {
    if (!resume.trim() || status === STATUS.LOADING) return
    setStatus(STATUS.LOADING)
    setFeedback(null)
    setErrorMsg('')
    try {
      const res = await fetch(`${API}/api/analyse`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ resumeText: resume }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`)
      setFeedback(parseFeedback(data.feedback))
      setStatus(STATUS.SUCCESS)
      fetchHistory()
      showToast('Analysis complete! See your feedback below.', 'success')
    } catch (err) {
      setErrorMsg(
        err.message.includes('fetch')
          ? 'Cannot reach the server. Make sure the backend is running on port 5000.'
          : err.message
      )
      setStatus(STATUS.ERROR)
    }
  }

  const handleSelect = (r) => {
    setResume(r.resume_text)
    setFeedback(parseFeedback(r.feedback))
    setStatus(r.feedback ? STATUS.SUCCESS : STATUS.IDLE)
    setHistoryOpen(false)
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/analyse/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (!res.ok) throw new Error()
      setHistory(prev => prev.filter(r => r.id !== id))
      showToast('Resume removed from history', 'info')
    } catch {
      showToast('Could not delete resume', 'error')
    }
  }

  const reset = () => {
    setResume('')
    setFeedback(null)
    setStatus(STATUS.IDLE)
    setErrorMsg('')
    setUploadStatus('')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (!token) return <AuthScreen onAuth={login} />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] text-gray-900 dark:text-white font-sans transition-colors duration-200">

      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] no-print"
        style={{
          backgroundImage: `linear-gradient(${dark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? '#fff' : '#000'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-sm px-4 sm:px-6 py-3.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">R</span>
          </div>
          <span className="font-semibold tracking-tight text-gray-900 dark:text-white/90">ResumeAI</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History */}
          <button
            onClick={() => setHistoryOpen(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/80 hover:border-gray-300 dark:hover:border-white/20 transition-all"
          >
            History
            {history.length > 0 && (
              <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/80 transition-all text-sm"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {/* User + sign out (hidden on small screens) */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10">
            <span className="text-xs text-gray-400 dark:text-white/30 truncate max-w-[130px]">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 dark:text-white/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Mobile sign out */}
          <button
            onClick={handleLogout}
            className="sm:hidden text-xs text-gray-400 dark:text-white/30 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-4 py-8 sm:py-10 space-y-6">

        {/* History drawer */}
        {historyOpen && (
          <div className="border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.02] p-4 no-print">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 dark:text-white/30 uppercase tracking-widest font-medium">
                Past resumes
              </p>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <HistoryPanel
              history={history}
              loading={historyLoading}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* Page heading */}
        <div className="no-print">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white/90">
            Analyse your resume
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/40 mt-1">
            Paste your resume or upload a PDF — get an AI score, detailed feedback, and ATS compatibility check.
          </p>
        </div>

        {/* Input card */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02] overflow-hidden no-print">
          <textarea
            value={resume}
            onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setResume(e.target.value) }}
            placeholder="Paste your resume text here…"
            disabled={status === STATUS.LOADING}
            className="w-full h-52 sm:h-56 px-5 py-4 bg-transparent text-sm text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 resize-none focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-white/5 flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handlePdfUpload} className="hidden" />
              <button
                onClick={() => fileRef.current.click()}
                className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors"
              >
                ⬆ Upload PDF
              </button>
              {uploadStatus && (
                <span className={`text-xs ${uploadStatus.startsWith('✅') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-white/40'}`}>
                  {uploadStatus}
                </span>
              )}
              <span className={`text-xs ${resume.length > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-300 dark:text-white/25'}`}>
                {resume.length}/{MAX_CHARS}
              </span>
            </div>
            <div className="flex gap-2">
              {(status !== STATUS.IDLE || resume) && (
                <button
                  onClick={reset}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!resume.trim() || status === STATUS.LOADING}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-all"
              >
                {status === STATUS.LOADING ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Analysing…
                  </span>
                ) : 'Analyse'}
              </button>
            </div>
          </div>
        </div>

        {/* Error state */}
        {status === STATUS.ERROR && (
          <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 px-4 py-3 flex items-start gap-3 no-print">
            <span className="text-rose-500 text-sm mt-0.5">❌</span>
            <div>
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Something went wrong</p>
              <p className="text-xs text-rose-500 dark:text-rose-400/70 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {status === STATUS.LOADING && <FeedbackSkeleton />}

        {/* Feedback results */}
        {status === STATUS.SUCCESS && feedback && (
          <div className="space-y-3">
            {/* Feedback header */}
            <div className="flex items-center justify-between flex-wrap gap-2 no-print">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-white/50 uppercase tracking-widest">
                AI Feedback
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {feedback.score && <ScoreBadge score={feedback.score} />}
                {feedback.atsScore && <ATSBadge score={feedback.atsScore} />}
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70 hover:border-gray-300 dark:hover:border-white/20 transition-all"
                  title="Save as PDF"
                >
                  ↓ Export PDF
                </button>
              </div>
            </div>

            {/* Print-only title (hidden in browser) */}
            <div className="print-title">
              Resume Analysis — Score: {feedback.score ?? '?'}/10
              {feedback.atsScore ? ` | ATS: ${feedback.atsScore}/10` : ''}
            </div>

            <FeedbackSection title="Strengths" icon="✦">{feedback.strengths}</FeedbackSection>
            <FeedbackSection title="Weaknesses" icon="△">{feedback.weaknesses}</FeedbackSection>
            <FeedbackSection title="Specific Improvements" icon="→">{feedback.improvements}</FeedbackSection>
            <FeedbackSection title="ATS Compatibility" icon="◉">{feedback.ats}</FeedbackSection>
            <FeedbackSection title="Industry Benchmark" icon="◎">{feedback.benchmark}</FeedbackSection>
            <FeedbackSection title="Top 3 Priority Actions" icon="★">{feedback.priorities}</FeedbackSection>
            {!feedback.strengths && !feedback.weaknesses && (
              <FeedbackSection title="Analysis" icon="✦">{feedback.raw}</FeedbackSection>
            )}
          </div>
        )}
      </main>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
