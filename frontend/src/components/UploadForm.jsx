import { useRef, useState } from "react"

const MAX_CHARS = 5000

export default function UploadForm({ onSubmit, loading }) {
    const [resume, setResume] = useState('')
    const [uploadStatus, setUploadStatus] = useState('')
    const fileRef = useRef()

    const handlePdfUpload = async(e) => {
        const file = e.target.files[0]
        if(!file) return
        setUploadStatus('Extaracting text from file...')

        const formData = new FormData()
        formData.append('resume', file)
        const token = localStorage.getItem('token')

        try { 
            const res = await fetch('https://localhost:5000/api/upload', {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } :{},
                body: formData,
            })
            const data = await res.json()
            if(!res.ok) throw new Error(data.error)
                setResume(data.text.slice(0, MAX_CHARS))
                setUploadStatus(`✅ ${data.pages} pages${data.pages > 1 ? 's' : ''} extracted`)
        } catch (err) {
            setUploadStatus(`❌ ${err.message}`)
        }
    }

    const handleSubmit = () => {
        if(!resume.trim() || loading) return
        onSubmit(resume)
    }

    const clear = () => { 
        setResume('')
        setUploadStatus('')
    }

    return (
        <div className="rounded-2x; border border-white/5 bg-white/[0.02] overflow-hidden">
            <textarea
            value={resume}
            onChange={(e) => { if (e.target.value.length <=MAX_CHARS) setResume(e.target.value)}}
            placeholder='Paste your resume text here..'
            disabled={loading}
            className="W-full h-56 px-5 py-4 bg-transparent text-sm text-white/8- placeholder-white/20 resize-non focus:outline-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between px-5 py-3 border-t border0white/5 flex-wrap gap-2">
                <div className='flex items-center gap-3'>
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handlePdfUpload} className="hidden" />
                    <button
                    onClick={() => fileRef.current.click()}
                    className='flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors'
                    >
                        ⬆️Upload Resume
                    </button>
                    {uploadStatus && (
                        <span className={`text-xs ${uploadStatus.startsWith('✅') ?  'text-emerald-400' : uploadStatus.startsWith('❌') ? 'text-red-400' : 'text-white/40'}`}>
                            {uploadStatus}
                        </span>
                    )}
                    <span className={`text-xs ${resume.length > MAX_CHARS * 0.9 ? 'text-amber-400' : 'text-white/25'}`}>
                        {resume.length}/{MAX_CHARS}
                    </span>
                </div>
                <div className="flex gap-2">
                    {resume && (
                        <button onClick={clear} className='px-3 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors'>
                            Clear
                        </button>
                    )}
                    <button
                    onClick={handleSubmit}
                    disabled={!resume.trim() || loading}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900disabled:text-indigo-600 text-xs font-medium transition-all">
                        {loading ? (
                            <span className='flex items-center gap-2'>
                                <span className='w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin'/>
                                Analysing...
                            </span>
                        ) : 'Analyse Resume'}
                    </button>
                </div>
            </div>

        </div>
    )
}