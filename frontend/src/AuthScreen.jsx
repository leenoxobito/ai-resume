import { useState } from 'react'
import { useTheme } from './context/ThemeContext.jsx'

const MODE = { LOGIN: 'login', REGISTER: 'register' }

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState(MODE.LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { dark, toggleTheme } = useTheme()

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const endpoint =
      mode === MODE.LOGIN
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/register'

    try {
      const res = await fetch(endpoint, {
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] text-gray-900 dark:text-white flex items-center justify-center px-4 transition-colors duration-200">

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${dark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? '#fff' : '#000'} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed top-4 right-4 p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-all text-sm"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="relative w-full max-w-sm space-y-5">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">R</span>
          </div>
          <span className="font-semibold tracking-tight text-gray-900 dark:text-white/90">ResumeAI</span>
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white/90">
            {mode === MODE.LOGIN ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/40 mt-1">
            {mode === MODE.LOGIN
              ? 'Sign in to access your resumes'
              : 'Start analysing your resume today'}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/40 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-white/40 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === MODE.REGISTER ? 'At least 8 characters' : '••••••••'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              {mode === MODE.LOGIN ? 'Signing in…' : 'Creating account…'}
            </span>
          ) : mode === MODE.LOGIN ? 'Sign in' : 'Create account'}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-white/30">
          {mode === MODE.LOGIN ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === MODE.LOGIN ? MODE.REGISTER : MODE.LOGIN); setError('') }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            {mode === MODE.LOGIN ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
