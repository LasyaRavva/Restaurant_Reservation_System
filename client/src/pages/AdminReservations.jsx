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

export default function AdminReservations() {
  const { reservations, loading, error, actionLoading, updateReservationStatus } = useAdminConsole()

  if (loading) return <div className="loader">Loading reservation queue...</div>
  if (error) return <div className="error-msg">{error}</div>

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          {/* <p className="admin-kicker">Admin console</p> */}
          <h1>Reservation queue</h1>
          <p className="admin-sub">
            Review all bookings, confirm them, or cancel them from one central queue.
          </p>
        </div>
        {/* <div className="admin-hero-card">
          <span className="admin-hero-label">Page</span>
          <strong>Bookings overview</strong>
          <p>Operations only, no personal bookings view.</p>
        </div> */}
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>All reservations</h2>
            <p>Review live bookings as they come in.</p>
          </div>
        </div>

        <div className="admin-list">
          {reservations.map(reservation => (
            <article key={reservation.id} className="admin-row-card admin-reservation-card">
              <div className="admin-row-main">
                <div>
                  <h3>{reservation.restaurants?.name || 'Restaurant'}</h3>
                  <p>
                    {reservation.profiles?.name || 'Guest'} - {formatDate(reservation.date)} at {formatTime(reservation.time_slot)}
                  </p>
                </div>
                <span className={`status-badge status-${reservation.status}`}>
                  {reservation.status}
                </span>
              </div>
              <div className="admin-row-meta">
                <span>{reservation.party_size} guests</span>
                <span>{reservation.restaurants?.city}</span>
              </div>
              {reservation.special_requests && (
                <p className="admin-note">{reservation.special_requests}</p>
              )}
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                  disabled={actionLoading || reservation.status === 'confirmed'}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                  disabled={actionLoading || reservation.status === 'cancelled'}
                >
                  Cancel
                </button>
              </div>
            </article>
          ))}

          {reservations.length === 0 && (
            <p className="empty-state">No reservations found.</p>
          )}
        </div>
      </section>
    </main>
  )
}
