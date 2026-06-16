import { useMemo, useState } from 'react'
import DropdownSelect from '../components/common/DropdownSelect'
import { useAdminConsole } from '../hooks/useAdminConsole'

const DEFAULT_MENU_ITEM = {
  restaurant_id: '',
  name: '',
  description: '',
  price: '',
  category: 'starters',
  image_url: '',
  is_available: true,
  is_vegetarian: false,
  is_vegan: false
}

const CATEGORY_OPTIONS = [
  'starters',
  'mains',
  'sides',
  'desserts',
  'drinks'
]

function truncateLabel(value, maxLength = 28) {
  if (!value || value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

export default function AdminMenuItems() {
  const {
    restaurants,
    menuItems,
    loading,
    error,
    actionLoading,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useAdminConsole()

  const [menuForm, setMenuForm] = useState(DEFAULT_MENU_ITEM)
  const [editingId, setEditingId] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitMessage, setSubmitMessage] = useState(null)
  const [restaurantFilter, setRestaurantFilter] = useState('all')

  const filteredMenuItems = useMemo(() => {
    if (restaurantFilter === 'all') return menuItems
    return menuItems.filter(item => String(item.restaurant_id) === String(restaurantFilter))
  }, [menuItems, restaurantFilter])

  function handleMenuChange(event) {
    const { name, value, type, checked } = event.target
    setMenuForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function resetForm() {
    setEditingId(null)
    setMenuForm(DEFAULT_MENU_ITEM)
    setSubmitError(null)
    setSubmitMessage(null)
  }

  function startEditMenuItem(menuItem) {
    setEditingId(menuItem.id)
    setMenuForm({
      restaurant_id: menuItem.restaurant_id || '',
      name: menuItem.name || '',
      description: menuItem.description || '',
      price: menuItem.price ?? '',
      category: menuItem.category || 'starters',
      image_url: menuItem.image_url || '',
      is_available: menuItem.is_available ?? true,
      is_vegetarian: menuItem.is_vegetarian ?? false,
      is_vegan: menuItem.is_vegan ?? false
    })
    setSubmitError(null)
    setSubmitMessage(null)
  }

  async function handleSaveMenuItem(event) {
    event.preventDefault()
    setSubmitError(null)
    setSubmitMessage(null)

    const payload = {
      restaurant_id: menuForm.restaurant_id,
      name: menuForm.name,
      description: menuForm.description,
      price: Number(menuForm.price),
      category: menuForm.category,
      image_url: menuForm.image_url,
      is_available: menuForm.is_available,
      is_vegetarian: menuForm.is_vegetarian,
      is_vegan: menuForm.is_vegan
    }

    const result = editingId
      ? await updateMenuItem(editingId, payload)
      : await createMenuItem(payload)

    if (result.error) {
      setSubmitError(result.error.message)
      return
    }

    setSubmitMessage(editingId ? 'Menu item updated successfully.' : 'Menu item added successfully.')
    resetForm()
  }

  async function handleDeleteMenuItem(menuItemId) {
    const confirmed = window.confirm('Delete this menu item?')
    if (!confirmed) return

    setSubmitError(null)
    setSubmitMessage(null)

    const { error: deleteError } = await deleteMenuItem(menuItemId)
    if (deleteError) {
      setSubmitError(deleteError.message)
      return
    }

    setSubmitMessage('Menu item deleted successfully.')
    if (editingId === menuItemId) {
      resetForm()
    }
  }

  if (loading) return <div className="loader">Loading menu items...</div>
  if (error) return <div className="error-msg">{error}</div>

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <h1>Menu items</h1>
          <p className="admin-sub">
            Add, edit, and delete menu items for each restaurant from one place.
          </p>
        </div>
        {/* <div className="admin-hero-card">
          <span className="admin-hero-label">Page</span>
          <strong>Menu management</strong>
          <p>Restaurant-linked items only.</p>
        </div> */}
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>{editingId ? 'Edit menu item' : 'Add menu item'}</h2>
            <p>{editingId ? 'Update the selected item.' : 'Create a new item for a restaurant.'}</p>
          </div>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>

        {submitError && <div className="error-msg">{submitError}</div>}
        {submitMessage && <div className="success-msg">{submitMessage}</div>}

        <form className="admin-form" onSubmit={handleSaveMenuItem}>
          <div className="form-row">
            <div className="form-group">
              <label>Restaurant</label>
              <DropdownSelect
                value={menuForm.restaurant_id}
                placeholder="Select restaurant"
                options={restaurants.map(restaurant => ({
                  value: restaurant.id,
                  label: truncateLabel(`${restaurant.name} - ${restaurant.city}`)
                }))}
                onChange={value => setMenuForm(prev => ({ ...prev, restaurant_id: value }))}
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={menuForm.name} onChange={handleMenuChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={menuForm.description} onChange={handleMenuChange} rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input name="price" type="number" step="0.01" min="0" value={menuForm.price} onChange={handleMenuChange} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <DropdownSelect
                value={menuForm.category}
                placeholder="Select category"
                options={CATEGORY_OPTIONS.map(category => ({ value: category, label: category }))}
                onChange={value => setMenuForm(prev => ({ ...prev, category: value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input name="image_url" value={menuForm.image_url} onChange={handleMenuChange} />
          </div>

          <div className="form-row">
            <div className="form-group checkbox-field">
              <label>
                <input
                  name="is_available"
                  type="checkbox"
                  checked={menuForm.is_available}
                  onChange={handleMenuChange}
                />
                Available
              </label>
            </div>
            <div className="form-group checkbox-field">
              <label>
                <input
                  name="is_vegetarian"
                  type="checkbox"
                  checked={menuForm.is_vegetarian}
                  onChange={handleMenuChange}
                />
                Vegetarian
              </label>
            </div>
            <div className="form-group checkbox-field">
              <label>
                <input
                  name="is_vegan"
                  type="checkbox"
                  checked={menuForm.is_vegan}
                  onChange={handleMenuChange}
                />
                Vegan
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={actionLoading}>
            {actionLoading ? 'Saving...' : editingId ? 'Update menu item' : 'Add menu item'}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <div className="panel-header">
          <div>
            <h2>Saved menu items</h2>
            <p>Use edit or delete on any item below.</p>
          </div>
          <div className="form-group menu-filter-select">
            <DropdownSelect
              value={restaurantFilter}
              placeholder="All restaurants"
              options={[
                { value: 'all', label: 'All restaurants' },
                ...restaurants.map(restaurant => ({
                  value: restaurant.id,
                  label: truncateLabel(restaurant.name)
                }))
              ]}
              onChange={value => setRestaurantFilter(value)}
            />
          </div>
        </div>

        <div className="admin-list">
          {filteredMenuItems.map(menuItem => (
            <article key={menuItem.id} className="admin-row-card">
              <div className="admin-row-main">
                <div>
                  <h3>{menuItem.name}</h3>
                  <p>
                    {menuItem.restaurants?.name || 'Restaurant'} - {menuItem.category}
                  </p>
                </div>
                <span className={`status-badge ${menuItem.is_available ? 'status-confirmed' : 'status-cancelled'}`}>
                  {menuItem.is_available ? 'available' : 'unavailable'}
                </span>
              </div>
              <div className="admin-row-meta">
                <span>Rs. {menuItem.price}</span>
                <span>
                  {menuItem.is_vegetarian ? 'veg' : 'non-veg'}
                  {menuItem.is_vegan ? ' / vegan' : ''}
                </span>
              </div>
              <div className="admin-row-actions">
                <button type="button" className="btn-outline" onClick={() => startEditMenuItem(menuItem)}>
                  Edit
                </button>
                <button type="button" className="btn-danger" onClick={() => handleDeleteMenuItem(menuItem.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}

          {filteredMenuItems.length === 0 && (
            <p className="empty-state">No menu items available yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}
