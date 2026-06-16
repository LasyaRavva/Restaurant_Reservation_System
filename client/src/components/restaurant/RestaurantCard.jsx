import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RestaurantCard({ restaurant }) {
  const { isAdmin } = useAuth()
  const { id, name, cuisine_type, description, image_url, city, capacity } = restaurant

  return (
    <div className="restaurant-card">
      <div className="card-image">
        <img src={image_url || '/placeholder.jpg'} alt={name} />
        <span className="cuisine-badge">{cuisine_type}</span>
      </div>
      <div className="card-body">
        <h3>{name}</h3>
        <p className="card-city">📍 {city}</p>
        <p className="card-desc">{description}</p>
        <div className="card-footer">
          <span className="capacity-tag">Up to {capacity} guests</span>
          <div className="card-actions">
            <Link to={`/restaurants/${id}/menu`} className="btn-ghost">View menu</Link>
            {!isAdmin && <Link to={`/restaurants/${id}/book`} className="btn-primary">Book table</Link>}
          </div>
        </div>
      </div>
    </div>
  )
}
