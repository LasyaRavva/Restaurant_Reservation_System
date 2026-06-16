import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { patchJson } from '../lib/api'

export default function ReservationConfirmation() {
  const [searchParams] = useSearchParams()
  const reservationId = searchParams.get('reservation_id')
  const restaurantName = searchParams.get('restaurant_name') || 'Restaurant'
  const date = searchParams.get('date')
  const timeSlot = searchParams.get('time_slot')
  const partySize = searchParams.get('party_size')
  const amountParam = searchParams.get('amount')
  const provider = searchParams.get('provider') || 'stripe'
  const status = searchParams.get('status') || 'success'
  const stripeMinimum = 50

  const [syncState, setSyncState] = useState('idle')
  const [syncError, setSyncError] = useState(null)

  useEffect(() => {
    if (!reservationId) return
    if (status !== 'success') return

    let active = true

    async function confirmReservation() {
      setSyncState('syncing')
      setSyncError(null)

      try {
        await patchJson(`/reservations/${reservationId}/status`, { status: 'confirmed' })
        if (active) setSyncState('confirmed')
      } catch (error) {
        const { error: fallbackError } = await supabase
          .from('reservations')
          .update({ status: 'confirmed' })
          .eq('id', reservationId)

        if (active) {
          if (fallbackError) {
            setSyncState('error')
            setSyncError(error.message)
          } else {
            setSyncState('confirmed')
          }
        }
      }
    }

    confirmReservation()

    return () => {
      active = false
    }
  }, [reservationId, status])

  const isCancelled = status === 'cancelled'
  const isSuccess = status === 'success'
  const amount = amountParam
    ? Number(amountParam)
    : (partySize ? Math.max(Number(partySize) * 250, stripeMinimum) : null)

  return (
    <main className="confirmation-page">
      <section className="confirmation-card">
        <p className="confirmation-kicker">Reservation {isCancelled ? 'cancelled' : 'confirmed'}</p>
        <h1>
          {isCancelled
            ? 'Payment was cancelled'
            : 'Your reservation is confirmed'}
        </h1>
        <p className="confirmation-sub">
          {isCancelled
            ? 'The reservation was not completed. You can return to the restaurant and try again.'
            : 'Your table booking has been saved and the confirmation email will be sent shortly.'}
        </p>

        <div className="confirmation-grid">
          <div className="confirmation-item">
            <span className="confirmation-label">Restaurant</span>
            <strong>{restaurantName}</strong>
          </div>
          <div className="confirmation-item">
            <span className="confirmation-label">Date</span>
            <strong>{date || 'Not set'}</strong>
          </div>
          <div className="confirmation-item">
            <span className="confirmation-label">Time</span>
            <strong>{timeSlot || 'Not set'}</strong>
          </div>
          <div className="confirmation-item">
            <span className="confirmation-label">Guests</span>
            <strong>{partySize || '1'}</strong>
          </div>
          <div className="confirmation-item">
            <span className="confirmation-label">Payment</span>
            <strong>{provider.toUpperCase()}</strong>
          </div>
          <div className="confirmation-item">
            <span className="confirmation-label">Deposit</span>
            <strong>{amount ? `Rs. ${amount}` : 'N/A'}</strong>
          </div>
        </div>

        {isSuccess && (
          <div className="success-msg">
            {syncState === 'syncing' && 'Finalizing reservation...'}
            {syncState === 'confirmed' && 'Reservation status updated. Email notification triggered.'}
            {syncState === 'error' && `Payment succeeded, but status update failed: ${syncError}`}
            {syncState === 'idle' && 'Processing confirmation...'}
          </div>
        )}

        {isCancelled && (
          <div className="error-msg">
            Payment was cancelled before completion.
          </div>
        )}

        {!reservationId && (
          <div className="error-msg">
            Reservation information is missing from this page.
          </div>
        )}

        <div className="confirmation-actions">
          <Link to="/dashboard/reservations" className="btn-primary">
            View my reservations
          </Link>
          <Link to="/" className="btn-ghost">
            Browse restaurants
          </Link>
        </div>

        {isSuccess && (
          <p className="confirmation-note">
            Provider: {provider}. If the email service is configured, a confirmation email is sent after the reservation is marked confirmed.
          </p>
        )}
      </section>
    </main>
  )
}
