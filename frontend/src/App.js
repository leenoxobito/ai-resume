import { useState, useEffect, useRef } from 'react'
import AuthScreen from "./AuthScreen.jsx"
import { FeedbackSkeleton } from "./Skeleton.jsx"

const STATUS = { IDLE: 'idle', LOADING: "loading", SUCCESS: " success", ERROR: "error" }
const MAX_CHARS = 5000

function ScoreBadge({ score }) {
  const num = parseInt(score)
  const color =
    num >=8 ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
    : num >=5 ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
    : "text-rose-400 border-rose-400/40 bg-rose-400/10"
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${color}`}>
        {num}/10
      </span>
    )
}

function FeedbackSection({ title, icon, children }) {
    return( 
      <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02] space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white/70">
        <span>{icon}</span><span>{title}</span>
        </div>
        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
          {children}
        </p>
      </div>
    )
}

function parseFeedback(text) {
  if(!text) return null
  const scoreMatch = text.match(/overall score[:\s]+(\d+)/i)
  const section = (label) => {
     const re = new RegExp(`${label}[:\\s\\*]+([\\s\\S]*?)(?=\\n\\n?\\d+\\.|\\n\\n?\\*\\*|$)`, "i")
    const m = text.match(re)
    return m ? m[1].trim() : null
  }
  return {
    score: scoreMatch ? scoreMatch[1]: null,
    strengths: section("strengths"),
    weaknesses: section("weaknesses"),
    improvements: section("specific improvements"),
    benchmark: section("industry benchmark"),
    priorities: section("top 3 priority actions"),
    raw: text,
  }
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("email") || "")
  const [resume, setResume] = useState("")
  const [status, setStatus] = useState(STATUS.IDLE)
  const [feedback, setFeedback] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const fileRef = useRef()

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}`}

  useEffect(() => { if (token) fetchHistory() }, [token])

  const fetchHistory = async() => {
    try { 
      const res = await fetch("http://localhost:5000/api/analyse", { headers: authHeaders })
      if(!res.ok) return
      const data = await res.json()
        setHistory(data.resumes || [])
    } catch {}
  }

  const handleAuth = (newToken, email) => {
    setToken(newToken)
    setUserEmail(email)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("email")
    setToken(null)
    setUserEmail("")
    setResume("")
    setFeedback(null)
    setHistory([])
  }

  const handlePdfUpload = async(e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadStatus("Extracting text from PDF..")
      const formData = new FormData()
      formData.append("resume", file)

      try { 
        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
          setResume(data.text.slice(0, MAX_CHARS))
          setUploadStatus(`✅ Extracted ${data.pages} page${data.pages > 1? "s" : ""}`)
      } catch (err) { 
          setUploadStatus(`❌ ${err.message}`)
      }
  }

  const handleSubmit = async () => {
    if (!resume.trim() || status === STATUS.LOADING) return
    setStatus(STATUS.LOADING)
    setFeedback(null)
    setErrorMsg("")

    try {
      const res = await fetch("http://localhost:5000/api/analyse", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ resumeText: resume }),
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || `Server error ${res.status}`)
        setFeedback(parseFeedback(data.feedback))
        setStatus(STATUS.SUCCESS)
        fetchHistory()
    } catch (err) {
      setErrorMsg(
        err.message.includes("fetch")
          ? "Cannot reach the server. Make sure your bacnkend is running on port 5000."
          : err.message
      )
      setStatus(STATUS.ERROR)
    }
  }
  const reset = () => {
    setResume("")
    setFeedback(null)
    setStatus(STATUS.IDLE)
    setErrorMsg("")
    setUploadStatus("")
  }

  if (!token) return <AuthScreen onAuth={handleAuth} />

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: "40px 40px",
        }}
        />
        {/* Header */}
        <header className="relative border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="font-semibold tracking-tight text-white/90">ResumeAI</span>
            </div>
            <div className="flex items-center gap-3"></div>
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="flex -items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
                >History
                 {history.length > 0 && (
                  <span className='bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full border border-indigo-500/20'>
                    {history.length}
                  </span>
                 )}
              </button>  
              <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <span className="text-xs text-white/30"> {userEmail}</span>
              <button
                onClick={handleLogout}
                className="text-s text-white/30 hover:text-rose-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
          </div>  
        </header>

        <main className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">

          {/*History pannel */}
          {historyOpen && (
            <div className="border border-white/5 rounded-2xl bg-white/[0.02] p-4 space-y-2">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Past resumes</p>
              {history.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">No resumes yet</p>
              ): history.map((r) => {
                const p = parseFeedback(r.feedback)
                const date = new Date(r.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: "short", year: "numeric"})
                  return (
                    <button
                      key={r.id}
                      onClick={() => { 
                        setResume(r.resume_text); 
                        setFeedback(parseFeedback(r.feedback)); 
                        setStatus(r.feedback ? STATUS.SUCCESS : STATUS.IDLE); 
                        setHistoryOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-white/60 truncate max-w-[200px]">{r.resume_text.slice(0, 50)}..</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {p?.score && <ScoreBadge score={p.score} />}
                          <span className="text-xs text-white/30">{date}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white/90">Analyse your resume</h1>
            <p className="text-sm text-white/40 mt-1">Paste text or upload a PDF to get AI feedback.</p>
          </div>

          {/*Input care */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <textarea
              value={resume}
              onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setResume(e.target.value) }}
              placeholder="Paste your resume text here.."
              disabled={status === STATUS.LOADING}
              className="w-full h-56 px-5 py-4 bg-transparent text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none disabled:opacity-50"
            />
            <div className ="flex items-center justify-betweenpx-5 py-3 border-t border-white/5 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {/*PDF upload */}
                <input ref={fileRef} type="file" accept=".pdf, .docx" onChange={handlePdfUpload} className="hidden" />
                <button
                    onClick={() => fileRef.current.click()}
                    className="flex items-center gap-1.5 text-s text-white/40 hover:text-white/70 transition-colors"
                    >
                      <span>⬆️</span>Upload PDF
                </button>
                {uploadStatus && (
                  <span className={`text-xs ${uploadStatus.startsWith("✅") ? "text-emerald-400": "text-white/25"}`}>
                    {uploadStatus}
                  </span>
                )}
                <span className={`text-xs ${resume.length > MAX_CHARS * 0.9 ? "text-amber-400": "text-white/25"}`}>
                  {resume.length}/{MAX_CHARS}
                </span>
                </div>
                <div className="flex gap-2">
                  {(status !==STATUS.IDLE || resume) && (
                    <button onClick={reset} className="px-3 oy-1.5 rounded-lg text-xs text-white/40 hover:text-white/7- transition-colors">
                      Clear
                    </button>
                  )}
                    <button
                      onClick={handleSubmit}
                      disabled={!resume.trim() || status === STATUS.LOADING}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-600 text-xs font-medium transition-all"
                      >
                        {status === STATUS.LOADING ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            Analysing..
                          </span>
                        ) : "Analyse"}
                      </button>                
                </div>
            </div>
           </div>

           {/*Error*/}
           {status === STATUS.ERROR && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 flex items-start gap-3">
              <span className="text-rose-400 text-sm mt-0.5">❌</span>
              <div>
                <p className="text-sm font-medium text-rose-400">Something went wrong</p>
                <p className="text-xs text-rose-400/70 mt-0.5">{errorMsg}</p>
              </div>
            </div>
           )}

           {/*Skeleton while loading */}
           {status === STATUS.LOADING && <FeedbackSkeleton />}

           {/* Feedback */}
        {status === STATUS.SUCCESS && feedback && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/60 uppercase tracking-widest">Feedback</h2>
              {feedback.score && <ScoreBadge score={feedback.score} />}
            </div>
            {feedback.strengths && <FeedbackSection title="Strengths" icon="✦">{feedback.strengths}</FeedbackSection>}
            {feedback.weaknesses && <FeedbackSection title="Weaknesses" icon="△">{feedback.weaknesses}</FeedbackSection>}
            {feedback.improvements && <FeedbackSection title="Specific improvements" icon="→">{feedback.improvements}</FeedbackSection>}
            {feedback.benchmark && <FeedbackSection title="Industry benchmark" icon="◎">{feedback.benchmark}</FeedbackSection>}
            {feedback.priorities && <FeedbackSection title="Top 3 priority actions" icon="★">{feedback.priorities}</FeedbackSection>}
            {!feedback.strengths && !feedback.weaknesses && <FeedbackSection title="Analysis" icon="✦">{feedback.raw}</FeedbackSection>}
          </div>
        )}
        </main>
    </div>
  ) 
}