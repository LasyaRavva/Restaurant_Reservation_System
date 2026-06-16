import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  pending:   'status-pending',
  confirmed: 'status-confirmed',
  cancelled: 'status-cancelled'
}

export default function ReservationCard({ reservation, onCancel }) {
  const { restaurants: restaurant, date, time_slot, party_size, status, special_requests } = reservation
  const isPast = new Date(date) < new Date()

  return (
    <div className="reservation-card">
      <div className="res-card-left">
        {restaurant?.image_url && (
          <img src={restaurant.image_url} alt={restaurant.name} className="res-thumb" />
        )}
      </div>
      <div className="res-card-body">
        <div className="res-card-top">
          <h3>{restaurant?.name}</h3>
          <span className={`status-badge ${STATUS_STYLES[status]}`}>{status}</span>
        </div>
        <p className="res-meta">📅 {new Date(date).toDateString()} at {time_slot}</p>
        <p className="res-meta">👥 {party_size} {party_size === 1 ? 'person' : 'people'}</p>
        {special_requests && <p className="res-requests">"{special_requests}"</p>}
        <div className="res-actions">
          <Link to={`/restaurants/${restaurant?.id}/menu`} className="btn-ghost">View menu</Link>
          {!isPast && status !== 'cancelled' && onCancel && (
            <button onClick={onCancel} className="btn-danger">Cancel</button>
          )}
        </div>
      </div>
    </div>
  )
}