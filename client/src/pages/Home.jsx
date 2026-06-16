import { useState } from 'react'
import { useRestaurants, useCuisines } from '../hooks/useRestaurants'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import CuisineFilter from '../components/restaurant/CuisineFilter'

export default function Home() {
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('')

  const cuisines = useCuisines()

  const { restaurants, loading, error } = useRestaurants({
    search: search || undefined,
    cuisine: cuisine || undefined
  })

  return (
    <main className="home-page">
      <section className="hero">
        <h1>Find your table</h1>
        <p>Browse menus and book at the best restaurants near you.</p>
        <input
          type="text"
          placeholder="Search restaurants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </section>

      <section className="browse-section">
        <CuisineFilter
          cuisines={cuisines}
          active={cuisine}
          onChange={c => setCuisine(c === 'All' ? '' : c)}
        />

        {loading && <div className="loader">Loading restaurants...</div>}
        {error && <div className="error-msg">{error}</div>}

        <div className="restaurant-grid">
          {restaurants.map(r => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>

        {!loading && restaurants.length === 0 && (
          <p className="empty-state">No restaurants found. Try a different search.</p>
        )}
      </section>
    </main>
  )
}
