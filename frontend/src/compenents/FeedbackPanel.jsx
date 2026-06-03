import ScoreBadge from './ScoreBadge'
import { FeedbackSkeleton } from './Skeleton'

function parseFeedback(text) {
    if (!text) return null
    const scoreMatch = text.match(/overall score[:\s]+(\d+)/i)
    const section = (label) => {
        const re = new RegExp(`${label}[:\\s\\*]+([\\ss\\S]*?)(?=\\n\n?\\d+\\.|\\n\\n?\\*\\*|$)`, 'i')
        const m = text.match(re)
        return m ? m[1].trim() : null
    }
    return { 
        score: scoreMatch ? scoreMatch[1]: null,
        strengths: section('strengths'),
        weaknesses: section('weaknesses'),
        improvements: section('improvements'),
        benchmark: section('benchmark'),
        priorities: section(' top 3 priority actions'),
        raw: text,
    }

    function Section({ title, icon, children }) {
        if (!children) return null
        return (
            <div className='border border-white/5 rounded-xl p-4 bg-white/[0.02] space-y-2'>
                <div className= 'flex items-center gap-2 text-sm font-medium text-white/70'>
                    <span>{icon}</span>
                    <span>{title}</span>
                </div>
                <p className='text-sm text-white/60 leading-relaxed whitespace-pre-wrap'>{children}</p>
            </div>
        )
    }

}

export default function FeedbackPanel({ feedback, loading }) {
    if (loading) return <FeedbackSkeleton />
    if (!feedback) return null

    const parsed = parseFeedback(feedback)
    if(!parsed) return null

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-white/60 uppercase tracking-widest">Feedback</h2>
                {parsed.score && <ScoreBadge score = {parsed.score} />}
            </div>
            <Section title="Strengths" icon="✦">{parsed.strengths}</Section>
            <Section title="Weaknesses" icon="△">{parsed.weaknesses}</Section>
            <Section title="Specific improvements" icon="→">{parsed.improvements}</Section>
            <Section title="Industry benchmark" icon="◎">{parsed.benchmark}</Section>
            <Section title="Top 3 priority actions" icon="★">{parsed.priorities}</Section>
            {!parsed.strengths && !parsed.weaknesses && (
            <Section title="Analysis" icon="✦">{parsed.raw}</Section>
            )}
        </div>
    )
}