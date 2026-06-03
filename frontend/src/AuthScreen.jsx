
//import { loginWithGoogle} from "./auth.login"
import { useState } from "react"

const MODE = { LOGIN: "login", REGISTER: "register" }

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState(MODE.LOGIN)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError("")

    const endpoint =
      mode === MODE.LOGIN
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register"

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Something went wrong")

      
      localStorage.setItem("token", data.token)
      localStorage.setItem("email", data.email)
      onAuth(data.token, data.email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-indigo-400 text-xs">✦</span>
          </div>
          <span className="font-semibold tracking-tight text-white/90">ResumeAI</span>
        </div>

        <div>
          <h1 className="text-xl font-semibold text-white/90">
            {mode === MODE.LOGIN ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {mode === MODE.LOGIN
              ? "Sign in to access your resumes"
              : "Start analysing your resume today"}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === MODE.REGISTER ? "At least 8 characters" : "••••••••"}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-600 text-sm font-medium transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              {mode === MODE.LOGIN ? "Signing in…" : "Creating account…"}
            </span>
          ) : mode === MODE.LOGIN ? "Sign in" : "Create account"}
        </button>

        <p className="text-center text-xs text-white/30">
          {mode === MODE.LOGIN ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === MODE.LOGIN ? MODE.REGISTER : MODE.LOGIN); setError("") }}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {mode === MODE.LOGIN ? "Sign up" : "Sign in"}
          </button>
        </p>
        {/* <button onClick={loginWithGoogle}>
        Login with Google
        </button> */}
      </div>
    </div>
  )
}
