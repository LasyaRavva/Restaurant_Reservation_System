import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRestaurant } from '../hooks/useRestaurants'
import { useMenu } from '../hooks/useMenu'
import MenuCard from '../components/menu/MenuCard'

const CATEGORY_LABELS = {
  starters: '🥗 Starters',
  mains: '🍽 Mains',
  sides: '🥘 Sides',
  desserts: '🍮 Desserts',
  drinks: '🥤 Drinks'
}

export default function MenuPage() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const { restaurant } = useRestaurant(id)
  const { grouped, loading, error } = useMenu(id)
  const categories = Object.keys(grouped)
  const [activeTab, setActiveTab] = useState(null)

  const displayCategory = activeTab || categories[0]

  if (loading) return <div className="loader">Loading menu...</div>
  if (error) return <div className="error-msg">{error}</div>

  return (
    <main className="menu-page">
      <div className="menu-header">
        <div>
          <h1>{restaurant?.name}</h1>
          <p className="menu-sub">{restaurant?.cuisine_type} · {restaurant?.city}</p>
        </div>
        {!isAdmin && <Link to={`/restaurants/${id}/book`} className="btn-primary">Book a table</Link>}
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`tab-btn ${displayCategory === cat ? 'active' : ''}`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Menu items grid */}
      <div className="menu-grid">
        {(grouped[displayCategory] || []).map(item => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>

      {categories.length === 0 && (
        <p className="empty-state">No menu items available right now.</p>
      )}
    </main>
  )
}
