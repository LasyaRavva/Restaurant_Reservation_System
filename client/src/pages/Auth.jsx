import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || authLoading) return
    navigate(profile?.is_admin ? '/admin' : '/dashboard', { replace: true })
  }, [user, profile, authLoading, navigate])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(form.email, form.password)
      setLoading(false)
      if (error) {
        setError(
          error.code === 'invalid_credentials'
            ? 'Invalid email or password.'
            : error.message
        )
        return
      }
      return
    }

    const { data, error } = await signUp(form.email, form.password, form.name)
    setLoading(false)
    if (error) {
      setError(
        error.code === 'email_exists'
          ? 'An account with this email already exists. Sign in instead.'
          : error.code === 'email_not_confirmed'
            ? 'Signup successful. Check your email to confirm your account before signing in.'
            : error.message
      )
      return
    }

    if (!data?.session) {
      setError('Signup successful. Check your email to confirm your account before logging in.')
      return
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-sub">
          {isLogin ? 'Sign in to manage your reservations.' : 'Join to start booking tables.'}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full name</label>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? ' Sign up' : ' Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
