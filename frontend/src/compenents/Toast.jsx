import { useEffect, useState } from 'react'

export default function Toast({ message, type='success', onClose}) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 300)
        }, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    const styles = { 
        success: 'border-emeerald-500/20 bg-emerald-500/10 text-emerald-400',
        error: 'border-rose-500-20 bg-rose-500/10 text-rose-400',
        info: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
    }

    return ( 
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all duration-300 ${styles[type]} ${visible ? 'opacity-100 transate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span>
                {type ==='success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            {message}
            <button onClick={ () => { setVisible(false); setTimeout(onClose, 300)}} className='ml-2 opacity-60 hover:opacity-100'></button>
        </div>
    )
}