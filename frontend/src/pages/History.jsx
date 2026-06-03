import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HistoryPanel from '../components/HistoryPanel.jsx'
import FeedbackPanel from '../components/FeedbackPanel.jsx'
import Toast from '../components/Toast.jsx'
import { useApi } from '../hooks/useApi.js'

export default function History() {
  const navigate = useNavigate()
  const { loading, get, del } = useApi()
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    const data = await get('/api/analyse')
    if (data) setHistory(data.resumes || [])
  }

  const handleDelete = async (id) => {
    const data = await del(`/api/analyse/${id}`)
    if (data) {
      setHistory(prev => prev.filter(r => r.id !== id))
      if (selected?.id === id) setSelected(null)
      setToast({ message: 'Resume deleted', type: 'info' })
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
        <button onClick={() => navigate('/')}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
          ← Analyse new resume
        </button>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white/90">Resume history</h1>
          <p className="text-sm text-white/40 mt-1">All your past submissions and their AI feedback.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Past resumes</p>
            <HistoryPanel
              history={history}
              onSelect={setSelected}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
              {selected ? 'Feedback' : 'Select a resume to view feedback'}
            </p>
            {selected ? (
              <FeedbackPanel feedback={selected.feedback} loading={false} />
            ) : (
              <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.02]">
                <p className="text-sm text-white/30">Click a resume on the left to view its feedback</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
