import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const API_ROOT = API_BASE.replace(/\/+$/, '').endsWith('/api') ? API_BASE.replace(/\/+$/, '') : `${API_BASE.replace(/\/+$/, '')}/api`

export function useAdminConsole() {
  const { user, isAdmin } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [reservations, setReservations] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!user || !isAdmin) return
    fetchAdminData()
  }, [user, isAdmin])

  async function fetchAdminData() {
    setLoading(true)
    setError(null)

    const [restaurantsResult, reservationsResult, menuItemsResult] = await Promise.all([
      supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('reservations')
        .select(`
          *,
          restaurants (
            id, name, city, image_url
          )
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('menu_items')
        .select(`
          id,
          restaurant_id,
          name,
          description,
          price,
          category,
          image_url,
          is_available,
          is_vegetarian,
          is_vegan,
          restaurants (
            id, name, city
          )
        `)
        .order('created_at', { ascending: false })
    ])

    const combinedError =
      restaurantsResult.error ||
      reservationsResult.error ||
      menuItemsResult.error

    if (combinedError) {
      setError(combinedError.message)
      setLoading(false)
      return
    }

    const rawReservations = reservationsResult.data || []
    const reservationUserIds = [...new Set(rawReservations.map(reservation => reservation.user_id).filter(Boolean))]

    let profileMap = new Map()
    if (reservationUserIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', reservationUserIds)

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      profileMap = new Map((profiles || []).map(profile => [profile.id, profile]))
    }

    setRestaurants(restaurantsResult.data || [])
    setReservations(rawReservations.map(reservation => ({
      ...reservation,
      profiles: profileMap.get(reservation.user_id) || null
    })))
    setMenuItems(menuItemsResult.data || [])
    setLoading(false)
  }

  async function createRestaurant(payload) {
    setActionLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .insert(payload)

    setActionLoading(false)
    if (!error) await fetchAdminData()
    return { error }
  }

  async function updateRestaurant(id, updates) {
    setActionLoading(true)
    const { error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)

    setActionLoading(false)
    if (!error) await fetchAdminData()
    return { error }
  }

  async function createMenuItem(payload) {
    setActionLoading(true)
    const { error } = await supabase
      .from('menu_items')
      .insert(payload)

    setActionLoading(false)
    if (!error) await fetchAdminData()
    return { error }
  }

  async function updateMenuItem(id, updates) {
    setActionLoading(true)
    const { error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)

    setActionLoading(false)
    if (!error) await fetchAdminData()
    return { error }
  }

  async function deleteMenuItem(id) {
    setActionLoading(true)
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    setActionLoading(false)
    if (!error) await fetchAdminData()
    return { error }
  }

  async function toggleRestaurantStatus(id, nextValue) {
    return updateRestaurant(id, { is_active: nextValue })
  }

  async function updateReservationStatus(id, status) {
    setActionLoading(true)
    let error = null

    try {
      const response = await fetch(`${API_ROOT}/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        error = new Error(payload?.error || payload?.message || 'Failed to update reservation')
      }
    } catch (err) {
      error = err
    }

    setActionLoading(false)
    if (!error) await fetchAdminData()
    return { error }
  }

  return {
    restaurants,
    reservations,
    menuItems,
    loading,
    error,
    actionLoading,
    refresh: fetchAdminData,
    createRestaurant,
    updateRestaurant,
    toggleRestaurantStatus,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateReservationStatus
  }
}
