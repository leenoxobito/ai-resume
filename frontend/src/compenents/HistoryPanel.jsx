import ScoreBadge from './ScoreBadge.jsx'

function extractScore(feedback){
    if (!feedback) return null
    const m = feedback.match(/overall score[:\s]+(\d+)/i)
    return m ? m[1]: null 
}

function HistoryItem({ resume, onSelect, onDelete }) { 
    const date = new Date(resume.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
    const score = extractScore(resume.feedback)
    const preview = resume.resume_text.slice(0, 60) + '…'

    return (
        
        <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05 transition-colrs group">
            <button className="flex-1 text-left min-w-0" onClick={() => onSelect(resume)}>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white/60 truncate">{preview}</span>
                    {score && <ScoreBadge score={score} />}
                </div>
                <span className='text-xs text-white/30 mt-0.5 block'>{date}</span>
            </button>
            <button
                onClick={() => onDelete(resume.id)}
                className='opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-400 transition-all text-xs px-2 py-1 shrink-0'
                title="Delete"
            >
            ❌
            </button>
        </div>
    )
}

export default function HistoryPanel({ history, onSelect, onDelete, loading }) {
    if(loading) {
        return ( 
            <div className="space-y-2">
                {[1,2,3].map(i => (
                    <div key={i} className="h-14 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse" />
                ))}
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-10 border border-white/5 rounded-2xl bg-white/[0.02]">
                <div className="text-3xl mb-3">📄</div>
                <p className="text-sm font-medium text-white/50">NO resumes yet</p>
                <p className="text-xs text-white/3- mt-1"> Submit your first resume to get started</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {history.map((r) => (
                <HistoryItem key={r.id} resume={r} onSelect={onSelect} onDelete={onDelete} />
            ))}
        </div>
    )
}