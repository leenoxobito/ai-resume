import { useState } from 'react'

const MODE = { LOGIN: 'login', REGISTER: 'register' }

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState(MODE.LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const url = mode === MODE.LOGIN
      ? 'http://localhost:5000/api/auth/login'
      : 'http://localhost:5000/api/auth/register'
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      onAuth(data.token, data.email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <span className="font-display font-bold text-white text-sm">R</span>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">ResumeAI</span>
        </div>

        <h1 className="font-display font-bold text-3xl text-white mb-1">
          {mode === MODE.LOGIN ? 'Welcome back' : 'Get started'}
        </h1>
        <p className="text-muted text-sm mb-8">
          {mode === MODE.LOGIN ? 'Sign in to your account' : 'Create your free account today'}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-white placeholder-muted/50 focus:outline-none focus:border-accent/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={mode === MODE.REGISTER ? 'At least 8 characters' : '••••••••'}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-white placeholder-muted/50 focus:outline-none focus:border-accent/60 transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="mt-6 w-full py-3 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-40 text-white text-sm font-semibold font-display tracking-wide transition-all shadow-lg shadow-accent/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {mode === MODE.LOGIN ? 'Signing in…' : 'Creating account…'}
            </span>
          ) : mode === MODE.LOGIN ? 'Sign in' : 'Create account'}
        </button>

        <p className="text-center text-sm text-muted mt-6">
          {mode === MODE.LOGIN ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === MODE.LOGIN ? MODE.REGISTER : MODE.LOGIN); setError('') }}
            className="text-accent hover:text-accent/80 font-medium transition-colors"
          >
            {mode === MODE.LOGIN ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
