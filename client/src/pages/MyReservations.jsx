import { useReservations } from '../hooks/useReservations'
import ReservationCard from '../components/dashboard/ReservationCard'

export default function MyReservations() {
  const { reservations, loading, error, cancelReservation } = useReservations()

  const upcoming = reservations.filter(r =>
    r.status !== 'cancelled' && new Date(r.date) >= new Date()
  )
  const past = reservations.filter(r =>
    r.status === 'cancelled' || new Date(r.date) < new Date()
  )

  if (loading) return <div className="loader">Loading reservations...</div>
  if (error) return <div className="error-msg">{error}</div>

  return (
    <main className="reservations-page">
      <h1>My reservations</h1>

      <section>
        <h2 className="section-heading">Upcoming</h2>
        {upcoming.length === 0
          ? <p className="empty-state">No upcoming reservations.</p>
          : upcoming.map(r => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onCancel={() => cancelReservation(r.id)}
            />
          ))
        }
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="section-heading">Past / Cancelled</h2>
          {past.map(r => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </section>
      )}
    </main>
  )
}