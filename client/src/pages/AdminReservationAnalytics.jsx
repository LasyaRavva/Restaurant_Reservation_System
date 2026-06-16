import { Link } from 'react-router-dom'
import { useAdminConsole } from '../hooks/useAdminConsole'

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(timeValue) {
  return new Date(`1970-01-01T${timeValue}`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card admin-stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <p className="stat-hint">{hint}</p>
    </article>
  )
}

export default function AdminReservationAnalytics() {
  const { reservations, loading, error } = useAdminConsole()

  if (loading) return <div className="loader">Loading reservation analytics...</div>
  if (error) return <div className="error-msg">{error}</div>

  const totalReservations = reservations.length
  const confirmed = reservations.filter(r => r.status === 'confirmed').length
  const pending = reservations.filter(r => r.status === 'pending').length
  const cancelled = reservations.filter(r => r.status === 'cancelled').length
  const totalGuests = reservations.reduce((sum, reservation) => sum + Number(reservation.party_size || 0), 0)
  const upcoming = reservations.filter(r => r.status !== 'cancelled' && new Date(`${r.date}T23:59:59`) >= new Date()).length

  const restaurantBreakdown = reservations.reduce((acc, reservation) => {
    const name = reservation.restaurants?.name || 'Unknown restaurant'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const topRestaurants = Object.entries(restaurantBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6)

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Admin analytics</p>
          <h1>Reservation analytics</h1>
          <p className="admin-sub">
            View booking volume, reservation status, and restaurant demand in one place.
          </p>
        </div>
        <div className="admin-hero-card">
          <span className="admin-hero-label">Coverage</span>
          <strong>{totalReservations} reservations</strong>
          <p>{totalGuests} total guests tracked across the system.</p>
        </div>
      </section>

      <section className="dashboard-stats">
        <StatCard label="Total reservations" value={totalReservations} hint="All recorded bookings" />
        <StatCard label="Confirmed" value={confirmed} hint="Successfully approved reservations" />
        <StatCard label="Pending" value={pending} hint="Waiting for payment or review" />
        <StatCard label="Cancelled" value={cancelled} hint="Cancelled before completion" />
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>Operational summary</h2>
            <p>Quick signals from reservation traffic.</p>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard label="Upcoming bookings" value={upcoming} hint="Reservations dated today or later" />
          <StatCard label="Guests tracked" value={totalGuests} hint="Total party size across reservations" />
          <StatCard label="Active rate" value={totalReservations ? `${Math.round(((confirmed + pending) / totalReservations) * 100)}%` : '0%'} hint="Non-cancelled reservations" />
          <StatCard label="Status split" value={`${confirmed}/${pending}/${cancelled}`} hint="Confirmed / pending / cancelled" />
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>Top restaurants by reservations</h2>
            <p>Restaurants with the most bookings.</p>
          </div>
        </div>

        <div className="admin-list">
          {topRestaurants.map(([name, count]) => (
            <article key={name} className="admin-row-card">
              <div className="admin-row-main">
                <div>
                  <h3>{name}</h3>
                  <p>{count} reservation{count === 1 ? '' : 's'}</p>
                </div>
                <span className="status-badge status-confirmed">{Math.round((count / totalReservations) * 100) || 0}%</span>
              </div>
            </article>
          ))}
          {topRestaurants.length === 0 && <p className="empty-state">No reservation analytics available yet.</p>}
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>Recent reservations</h2>
            <p>Latest booking activity.</p>
          </div>
        </div>

        <div className="admin-list">
          {recentReservations.map(reservation => (
            <article key={reservation.id} className="admin-row-card admin-reservation-card">
              <div className="admin-row-main">
                <div>
                  <h3>{reservation.restaurants?.name || 'Restaurant'}</h3>
                  <p>
                    {reservation.profiles?.name || 'Guest'} - {formatDate(reservation.date)} at {formatTime(reservation.time_slot)}
                  </p>
                </div>
                <span className={`status-badge status-${reservation.status}`}>{reservation.status}</span>
              </div>
              <div className="admin-row-meta">
                <span>{reservation.party_size} guests</span>
                <span>{reservation.restaurants?.city}</span>
              </div>
            </article>
          ))}
          {recentReservations.length === 0 && <p className="empty-state">No reservations found.</p>}
        </div>
      </section>

      <div className="admin-row-actions">
        <Link to="/admin/reservations" className="btn-primary">Open reservation queue</Link>
      </div>
    </main>
  )
}
