import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useRestaurants(filters = {}) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRestaurants()
  }, [filters.cuisine, filters.search])

  async function fetchRestaurants() {
    setLoading(true)
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (filters.cuisine) {
      query = query.eq('cuisine_type', filters.cuisine)
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) setError(error.message)
    else setRestaurants(data)
    setLoading(false)
  }

  return { restaurants, loading, error, refetch: fetchRestaurants }
}

export function useRestaurant(id) {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    async function fetch() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()
      if (error) setError(error.message)
      else setRestaurant(data)
      setLoading(false)
    }
    fetch()
  }, [id])

  return { restaurant, loading, error }
}

export function useCuisines() {
  const [cuisines, setCuisines] = useState(['All'])

  useEffect(() => {
    async function fetchCuisines() {
      const { data, error } = await supabase
        .from('restaurants')
        .select('cuisine_type')
        .eq('is_active', true)

      if (error || !data) return

      const uniqueCuisines = ['All', ...new Set(
        data
          .map(({ cuisine_type }) => cuisine_type)
          .filter(Boolean)
          .sort()
      )]

      setCuisines(uniqueCuisines)
    }

    fetchCuisines()
  }, [])

  return cuisines
}
