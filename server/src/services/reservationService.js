import { supabaseAdmin } from '../config/supabase.js'
import { ApiError } from '../utils/apiError.js'

async function attachProfiles(reservations) {
  const userIds = [...new Set((reservations || [])
    .map(reservation => reservation.user_id)
    .filter(Boolean))]

  if (userIds.length === 0) return reservations || []

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds)

  if (error) throw new ApiError(500, error.message)

  const profileMap = new Map((profiles || []).map(profile => [profile.id, profile]))

  return (reservations || []).map(reservation => ({
    ...reservation,
    profiles: profileMap.get(reservation.user_id) || null
  }))
}

export async function listReservations(filters = {}) {
  let query = supabaseAdmin
    .from('reservations')
    .select(`
      *,
      restaurants (
        id, name, city, image_url
      )
    `)
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.restaurantId) {
    query = query.eq('restaurant_id', filters.restaurantId)
  }

  const { data, error } = await query

  if (error) throw new ApiError(500, error.message)
  return attachProfiles(data || [])
}

export async function createReservation(payload) {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .insert(payload)
    .select(`
      *,
      restaurants (
        id, name, city, image_url
      )
    `)
    .single()

  if (error) throw new ApiError(400, error.message)
  const [withProfile] = await attachProfiles([data])
  return withProfile
}

export async function updateReservationStatus(id, status) {
  const { data: currentReservation, error: currentError } = await supabaseAdmin
    .from('reservations')
    .select('status')
    .eq('id', id)
    .single()

  if (currentError) throw new ApiError(400, currentError.message)

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update({ status })
    .eq('id', id)
    .select(`
      *,
      restaurants (
        id, name, city, image_url
      )
    `)
    .single()

  if (error) throw new ApiError(400, error.message)
  const [withProfile] = await attachProfiles([data])
  return {
    ...withProfile,
    notifyConfirmation: currentReservation?.status !== 'confirmed' && status === 'confirmed'
  }
}
