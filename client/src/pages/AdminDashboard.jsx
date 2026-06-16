import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAdminConsole } from '../hooks/useAdminConsole'

const DEFAULT_RESTAURANT = {
  name: '',
  cuisine_type: '',
  description: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  image_url: '',
  capacity: 50,
  is_active: true
}

export default function AdminDashboard() {
  const { loading, error, actionLoading, createRestaurant } = useAdminConsole()
  const [restaurantForm, setRestaurantForm] = useState(DEFAULT_RESTAURANT)
  const [submitError, setSubmitError] = useState(null)
  const [submitMessage, setSubmitMessage] = useState(null)

  function handleRestaurantChange(event) {
    const { name, value, type, checked } = event.target
    setRestaurantForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function resetForm() {
    setRestaurantForm(DEFAULT_RESTAURANT)
    setSubmitError(null)
    setSubmitMessage(null)
  }

  async function handleSaveRestaurant(event) {
    event.preventDefault()
    setSubmitError(null)
    setSubmitMessage(null)

    const payload = {
      ...restaurantForm,
      capacity: Number(restaurantForm.capacity)
    }

    const result = await createRestaurant(payload)

    if (result.error) {
      setSubmitError(result.error.message)
      return
    }

    setSubmitMessage('Restaurant added successfully.')
    resetForm()
  }

  if (loading) return <div className="loader">Loading admin console...</div>
  if (error) return <div className="error-msg">{error}</div>

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          {/* <p className="admin-kicker">Admin console</p> */}
          <h1>Restaurant management</h1>
          <p className="admin-sub">
            Add new restaurants from this form. The saved restaurant list is shown on the Restaurants page.
          </p>
        </div>
        {/* <div className="admin-hero-card">
          <span className="admin-hero-label">Mode</span>
          <strong>Restaurant CRUD</strong>
          <p>Reservation queue is kept separate.</p>
        </div> */}
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>Add restaurant</h2>
            <p>Create a new restaurant entry.</p>
          </div>
        </div>

        {submitError && <div className="error-msg">{submitError}</div>}
        {submitMessage && <div className="success-msg">{submitMessage}</div>}

        <form className="admin-form" onSubmit={handleSaveRestaurant}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={restaurantForm.name} onChange={handleRestaurantChange} required />
            </div>
            <div className="form-group">
              <label>Cuisine type</label>
              <input name="cuisine_type" value={restaurantForm.cuisine_type} onChange={handleRestaurantChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={restaurantForm.description} onChange={handleRestaurantChange} rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Address</label>
              <input name="address" value={restaurantForm.address} onChange={handleRestaurantChange} required />
            </div>
            <div className="form-group">
              <label>City</label>
              <input name="city" value={restaurantForm.city} onChange={handleRestaurantChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={restaurantForm.phone} onChange={handleRestaurantChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={restaurantForm.email} onChange={handleRestaurantChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input name="image_url" value={restaurantForm.image_url} onChange={handleRestaurantChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Capacity</label>
              <input
                name="capacity"
                type="number"
                min="1"
                value={restaurantForm.capacity}
                onChange={handleRestaurantChange}
              />
            </div>
            <div className="form-group checkbox-field">
              <label>
                <input
                  name="is_active"
                  type="checkbox"
                  checked={restaurantForm.is_active}
                  onChange={handleRestaurantChange}
                />
                Active restaurant
              </label>
            </div>
          </div>

          <div className="admin-row-actions">
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Add restaurant'}
            </button>
          </div>
        </form>
      </section>

      <section className="dashboard-links admin-quick-links">
        {/* <Link to="/admin/reservations/analytics" className="dash-link-card">
          <span className="dash-link-icon">RS</span>
          <div>
            <strong>My reservation analytics</strong>
            <p>Open booking trends, status totals, and table demand.</p>
          </div>
        </Link> */}
      </section>
    </main>
  )
}
