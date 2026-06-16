import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { postJson } from '../lib/api'

export function useReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchReservations()
  }, [user])

  async function fetchReservations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        restaurants (
          id, name, cuisine_type, image_url, address
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) setError(error.message)
    else setReservations(data)
    setLoading(false)
  }

  async function createReservation(payload) {
    try {
      const response = await postJson('/reservations', {
        ...payload,
        user_id: user.id
      })
      fetchReservations()
      return { data: response.data, error: null }
    } catch (error) {
      const { data, error: fallbackError } = await supabase
        .from('reservations')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()

      if (fallbackError) {
        return { data: null, error }
      }

      fetchReservations()
      return { data, error: null }
    }
  }

  async function cancelReservation(id) {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) fetchReservations()
    return { error }
  }

  return {
    reservations, loading, error,
    createReservation, cancelReservation,
    refetch: fetchReservations
  }
}
