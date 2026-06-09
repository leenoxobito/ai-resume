import { useState } from 'react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="fade-up max-w-xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider text-muted">Appearance</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Dark mode</p>
              <p className="text-xs text-muted mt-0.5">Use dark theme across the app</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 rounded-full transition-all relative ${darkMode ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider text-muted">Notifications</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Email notifications</p>
              <p className="text-xs text-muted mt-0.5">Get notified when analysis completes</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-all relative ${notifications ? 'bg-accent' : 'bg-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider text-muted mb-5">AI Model</h3>
          <div className="px-4 py-3 rounded-xl bg-surface border border-border text-sm text-white/70">
            mistralai/mistral-7b-instruct:free
          </div>
          <p className="text-xs text-muted mt-2">Change the AI model in your backend .env file</p>
        </div>
      </div>
    </div>
  )
}
