import { Link } from 'react-router-dom'
import { useAdminConsole } from '../hooks/useAdminConsole'

export default function AdminRestaurants() {
  const { restaurants, loading, error } = useAdminConsole()

  if (loading) return <div className="loader">Loading restaurants...</div>
  if (error) return <div className="error-msg">{error}</div>

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          {/* <p className="admin-kicker">Admin console</p> */}
          <h1>Saved restaurants</h1>
          <p className="admin-sub">
            This page shows the restaurant list that has already been added from the dashboard.
          </p>
        </div>
        {/* <div className="admin-hero-card">
          <span className="admin-hero-label">Page</span>
          <strong>Restaurant list</strong>
          <p>Edit any saved restaurant from here.</p>
        </div> */}
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>Added restaurants</h2>
            <p>Preview and edit the saved records.</p>
          </div>
        </div>

        <div className="admin-list">
          {restaurants.map(restaurant => (
            <article key={restaurant.id} className="admin-row-card">
              <div className="admin-row-main">
                <div>
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.cuisine_type} - {restaurant.city}</p>
                </div>
                <span className={`status-badge ${restaurant.is_active ? 'status-confirmed' : 'status-cancelled'}`}>
                  {restaurant.is_active ? 'active' : 'inactive'}
                </span>
              </div>
              <div className="admin-row-meta">
                <span>{restaurant.capacity} seats</span>
                <span>{restaurant.address}</span>
              </div>
              <div className="admin-row-actions">
                <Link to={`/admin/restaurants/${restaurant.id}`} className="btn-outline">
                  Edit
                </Link>
              </div>
            </article>
          ))}

          {restaurants.length === 0 && (
            <p className="empty-state">No restaurants available yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}
