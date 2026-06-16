import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || ''
  })
  const [status, setStatus] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await updateProfile(form)
    setStatus(error ? 'error' : 'saved')
    setTimeout(() => setStatus(null), 3000)
  }

  return (
    <main className="profile-page">
      <h1>Profile settings</h1>

      <div className="profile-card">
        <div className="profile-email">
          <span className="profile-label">Email</span>
          <span>{user?.email}</span>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Full name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone <span className="optional">(optional)</span></label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>
          <button type="submit" className="btn-primary">Save changes</button>
          {status === 'saved' && <p className="success-msg">✅ Profile updated.</p>}
          {status === 'error' && <p className="error-msg">Something went wrong.</p>}
        </form>
      </div>
    </main>
  )
}