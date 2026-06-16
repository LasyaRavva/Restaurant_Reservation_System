import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReservations } from '../hooks/useReservations'

export default function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const { reservations, loading } = useReservations()

  const upcoming = reservations.filter(r =>
    r.status !== 'cancelled' && new Date(r.date) >= new Date()
  )

  return (
    <main className="dashboard-page">
      <div className="dashboard-welcome">
        <h1>Welcome back, {profile?.name?.split(' ')[0] || 'there'}</h1>
        <p>Here's an overview of your account.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-label">Upcoming bookings</span>
          <span className="stat-value">{loading ? '-' : upcoming.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total reservations</span>
          <span className="stat-value">{loading ? '-' : reservations.length}</span>
        </div>
      </div>

      <div className="dashboard-links">
        {isAdmin && (
          <Link to="/admin" className="dash-link-card">
            <span className="dash-link-icon">AD</span>
            <div>
              <strong>Restaurant admin</strong>
              <p>Add restaurants and edit the catalog</p>
            </div>
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/reservations/analytics" className="dash-link-card">
            <span className="dash-link-icon">RS</span>
            <div>
              <strong>My reservation analytics</strong>
              <p>Open booking trends, status totals, and table demand.</p>
            </div>
          </Link>
        )}
        <Link to="/dashboard/profile" className="dash-link-card">
          <span className="dash-link-icon">👤</span>
          <div>
            <strong>Profile settings</strong>
            <p>Update your name, phone, and preferences</p>
          </div>
        </Link>
        <Link to="/" className="dash-link-card">
          <span className="dash-link-icon">🍽</span>
          <div>
            <strong>Browse restaurants</strong>
            <p>Find and book a new table</p>
          </div>
        </Link>
      </div>
    </main>
  )
}
