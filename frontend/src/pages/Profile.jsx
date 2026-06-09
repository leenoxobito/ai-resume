export default function Profile({ email }) {
  const initial = email ? email[0].toUpperCase() : 'U'
  const joinDate = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="fade-up max-w-xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Profile</h1>
        <p className="text-muted text-sm mt-1">Your account information</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border-2 border-accent/40 flex items-center justify-center shadow-lg shadow-accent/10">
            <span className="font-display font-bold text-2xl text-accent">{initial}</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">{email?.split('@')[0]}</h2>
            <p className="text-muted text-sm">{email}</p>
            <p className="text-muted/60 text-xs mt-1">Member since {joinDate}</p>
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Email address</label>
            <div className="px-4 py-3 rounded-xl bg-surface border border-border text-sm text-white/70">
              {email}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Account type</label>
            <div className="px-4 py-3 rounded-xl bg-surface border border-border text-sm text-white/70 flex items-center gap-2">
              <span className="text-amber-400">★</span> Free plan
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
