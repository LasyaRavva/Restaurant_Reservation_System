import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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

export default function AdminRestaurantEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { restaurants, loading, error, actionLoading, updateRestaurant } = useAdminConsole()
  const [restaurantForm, setRestaurantForm] = useState(DEFAULT_RESTAURANT)
  const [submitError, setSubmitError] = useState(null)
  const [submitMessage, setSubmitMessage] = useState(null)

  const restaurant = restaurants.find(item => String(item.id) === String(id))

  useEffect(() => {
    if (!restaurant) return

    setRestaurantForm({
      name: restaurant.name || '',
      cuisine_type: restaurant.cuisine_type || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      city: restaurant.city || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      image_url: restaurant.image_url || '',
      capacity: restaurant.capacity || 50,
      is_active: restaurant.is_active ?? true
    })
  }, [restaurant])

  function handleRestaurantChange(event) {
    const { name, value, type, checked } = event.target
    setRestaurantForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleUpdateRestaurant(event) {
    event.preventDefault()
    setSubmitError(null)
    setSubmitMessage(null)

    if (!id) {
      setSubmitError('Restaurant id is missing.')
      return
    }

    const payload = {
      ...restaurantForm,
      capacity: Number(restaurantForm.capacity)
    }

    const { error: updateError } = await updateRestaurant(id, payload)
    if (updateError) {
      setSubmitError(updateError.message)
      return
    }

    setSubmitMessage('Restaurant updated successfully.')
    navigate('/admin/restaurants')
  }

  if (loading) return <div className="loader">Loading restaurant editor...</div>
  if (error) return <div className="error-msg">{error}</div>
  if (!restaurant) return <div className="error-msg">Restaurant not found.</div>

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          {/* <p className="admin-kicker">Admin console</p> */}
          <h1>Edit restaurant</h1>
          <p className="admin-sub">
            Update the selected restaurant and save the changes back to the list.
          </p>
        </div>
        {/* <div className="admin-hero-card">
          <span className="admin-hero-label">Page</span>
          <strong>Restaurant editor</strong>
          <p>Changes are applied directly to the saved record.</p>
        </div> */}
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>Edit restaurant</h2>
            <p>{restaurant.name} - {restaurant.city}</p>
          </div>
          <Link to="/admin/restaurants" className="btn-ghost">Back to list</Link>
        </div>

        {submitError && <div className="error-msg">{submitError}</div>}
        {submitMessage && <div className="success-msg">{submitMessage}</div>}

        <form className="admin-form" onSubmit={handleUpdateRestaurant}>
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

          <button type="submit" className="btn-primary" disabled={actionLoading}>
            {actionLoading ? 'Saving...' : 'Update restaurant'}
          </button>
        </form>
      </section>
    </main>
  )
}
