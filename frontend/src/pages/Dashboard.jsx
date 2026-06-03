import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadForm from '../components/UploadForm.jsx'
import FeedbackPanel from '../components/FeedbackPanel.jsx'
import Toast from '../components/Toast.jsx'
import { useApi } from '../hooks/useApi.js'

export default function Dashboard({ email, onLogout }) {
  const navigate = useNavigate()
  const { loading, error, post } = useApi()
  const [feedback, setFeedback] = useState(null)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (resumeText) => {
    const data = await post('/api/analyse', { resumeText })
    if (data) {
      setFeedback(data.feedback)
      setToast({ message: 'Resume analysed and saved!', type: 'success' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      <header className="relative border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-indigo-400 text-xs">✦</span>
          </div>
          <span className="font-semibold tracking-tight text-white/90">ResumeAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/history')}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
            History
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <span className="text-xs text-white/30">{email}</span>
            <button onClick={onLogout} className="text-xs text-white/30 hover:text-rose-400 transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white/90">Analyse your resume</h1>
          <p className="text-sm text-white/40 mt-1">Paste text or upload a PDF to get AI-powered feedback.</p>
        </div>

        <UploadForm onSubmit={handleSubmit} loading={loading} />

        {error && !loading && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 flex items-start gap-3">
            <span className="text-rose-400 text-sm">✕</span>
            <div>
              <p className="text-sm font-medium text-rose-400">Something went wrong</p>
              <p className="text-xs text-rose-400/70 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <FeedbackPanel feedback={feedback} loading={loading} />
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
