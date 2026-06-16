import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRestaurant } from '../hooks/useRestaurants'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }

export default function RestaurantDetail() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const { restaurant, loading, error } = useRestaurant(id)

  if (loading) return <div className="loader">Loading...</div>
  if (error) return <div className="error-msg">{error}</div>
  if (!restaurant) return null

  const { name, cuisine_type, description, address, city, phone, image_url, capacity, opening_hours } = restaurant

  return (
    <main className="detail-page">
      <div className="detail-hero">
        <img src={image_url || '/placeholder.jpg'} alt={name} />
        <div className="detail-hero-overlay">
          <span className="cuisine-badge">{cuisine_type}</span>
          <h1>{name}</h1>
          <p>📍 {address}, {city}</p>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-main">
          <section className="detail-section">
            <h2>About</h2>
            <p>{description}</p>
          </section>

          <section className="detail-section">
            <h2>Contact</h2>
            {phone && <p>📞 {phone}</p>}
            <p>👥 Capacity: up to {capacity} guests</p>
          </section>

          <section className="detail-section">
            <h2>Opening hours</h2>
            <div className="hours-grid">
              {DAYS.map(day => (
                <div key={day} className="hours-row">
                  <span className="day-label">{DAY_LABELS[day]}</span>
                  <span>{opening_hours?.[day] || 'Closed'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Ready to visit?</h3>
            <Link to={`/restaurants/${id}/menu`} className="btn-outline full-width">Browse menu</Link>
            {!isAdmin && <Link to={`/restaurants/${id}/book`} className="btn-primary full-width">Reserve a table</Link>}
          </div>
        </div>
      </div>
    </main>
  )
}
