import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useMenu(restaurantId, category = null) {
  const [menuItems, setMenuItems] = useState([])
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!restaurantId) return
    fetchMenu()
  }, [restaurantId, category])

  async function fetchMenu() {
    setLoading(true)
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('category')
      .order('name')

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) {
      setError(error.message)
    } else {
      setMenuItems(data)
      // Group by category for tabbed display
      const groups = data.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = []
        acc[item.category].push(item)
        return acc
      }, {})
      setGrouped(groups)
    }
    setLoading(false)
  }

  return { menuItems, grouped, loading, error }
}