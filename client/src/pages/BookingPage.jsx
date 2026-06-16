import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRestaurant } from '../hooks/useRestaurants'
import { useReservations } from '../hooks/useReservations'
import { patchJson, postJson } from '../lib/api'

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
]

const RESERVATION_DEPOSIT_PER_GUEST = 250
const STRIPE_MINIMUM_TOTAL = 50

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { restaurant } = useRestaurant(id)
  const { createReservation } = useReservations()

  const [form, setForm] = useState({
    date: '',
    time_slot: '',
    party_size: 2,
    special_requests: '',
    payment_provider: 'stripe'
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      navigate(`/restaurants/${id}/menu`, { replace: true })
    }
  }, [isAdmin, id, navigate])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function buildConfirmationUrl(reservation, paymentProvider, extraParams = {}, status = 'success') {
    const params = new URLSearchParams({
      reservation_id: reservation.id,
      restaurant_id: id,
      restaurant_name: restaurant?.name || 'Restaurant',
      date: reservation.date,
      time_slot: reservation.time_slot,
      party_size: String(reservation.party_size),
      provider: paymentProvider,
      status,
      ...extraParams
    })

    return `/reservation-confirmation?${params.toString()}`
  }

  const estimatedAmount = Number(form.party_size) * RESERVATION_DEPOSIT_PER_GUEST
  const finalAmount =
    form.payment_provider === 'stripe'
      ? Math.max(estimatedAmount, STRIPE_MINIMUM_TOTAL)
      : estimatedAmount
  const isStripeAdjusted = form.payment_provider === 'stripe' && estimatedAmount < STRIPE_MINIMUM_TOTAL

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const reservationPayload = {
      restaurant_id: id,
      date: form.date,
      time_slot: form.time_slot,
      special_requests: form.special_requests,
      party_size: Number(form.party_size),
      status: 'pending'
    }

    const { data: reservation, error: reservationError } = await createReservation(reservationPayload)

    if (reservationError) {
      setLoading(false)
      setError(reservationError.message)
      return
    }

    try {
      const payment = await postJson('/payments/checkout', {
        amount: finalAmount,
        currency: 'inr',
        provider: form.payment_provider,
        metadata: {
          reservationId: reservation.id,
          restaurantId: id,
          restaurantName: restaurant?.name || 'Restaurant',
          date: reservation.date,
          timeSlot: reservation.time_slot,
          partySize: reservation.party_size,
          amount: finalAmount
        }
      })

      const paymentData = payment.data

      if (paymentData.provider === 'stripe' && paymentData.url) {
        window.location.href = paymentData.url
        return
      }

      if (paymentData.provider === 'razorpay') {
        const loaded = await loadRazorpayScript()
        if (!loaded) {
          throw new Error('Razorpay checkout could not be loaded.')
        }

        const options = {
          key: paymentData.keyId,
          amount: paymentData.order.amount,
          currency: paymentData.order.currency,
          name: 'TableBook',
          description: `Reservation at ${restaurant?.name || 'Restaurant'}`,
          order_id: paymentData.order.id,
          handler: async response => {
            try {
              await patchJson(`/reservations/${reservation.id}/status`, { status: 'confirmed' })
              navigate(buildConfirmationUrl(reservation, 'razorpay', {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                amount: String(finalAmount)
              }), {
                state: {
                  reservation,
                  payment: response
                }
              })
            } catch (confirmError) {
              setError(confirmError.message)
            }
          },
          modal: {
            ondismiss: async () => {
              try {
                await patchJson(`/reservations/${reservation.id}/status`, { status: 'cancelled' })
                navigate(buildConfirmationUrl(reservation, 'razorpay', {
                  amount: String(finalAmount)
                }, 'cancelled'), {
                  replace: true
                })
              } catch {
                // Keep the reservation pending if cancellation cleanup fails.
              }
            }
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
        setLoading(false)
        return
      }

      throw new Error('Payment provider response is invalid.')
    } catch (paymentError) {
      try {
        await patchJson(`/reservations/${reservation.id}/status`, { status: 'cancelled' })
      } catch {
        // Ignore cleanup failures here.
      }
      setError(paymentError.message)
    }

    setLoading(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="booking-page">
      <div className="booking-card">
        <h1>Reserve a table</h1>
        {restaurant && (
          <p className="booking-sub">at {restaurant.name}, {restaurant.city}</p>
        )}

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                min={today}
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Party size</label>
              <select name="party_size" value={form.party_size} onChange={handleChange}>
                {[1,2,3,4,5,6,7,8,10,12].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Time slot</label>
            <div className="time-grid">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, time_slot: slot }))}
                  className={`time-chip ${form.time_slot === slot ? 'active' : ''}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Special requests <span className="optional">(optional)</span></label>
            <textarea
              name="special_requests"
              placeholder="Dietary requirements, occasion, seating preference..."
              value={form.special_requests}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Payment method</label>
            <select name="payment_provider" value={form.payment_provider} onChange={handleChange}>
              <option value="stripe">Stripe</option>
              <option value="razorpay">Razorpay</option>
            </select>
            <p className="form-help">
              A deposit of {RESERVATION_DEPOSIT_PER_GUEST} per guest will be collected before confirmation.
            </p>
            <p className="form-help">
              Estimated total: Rs. {estimatedAmount}
            </p>
            <p className="form-help">
              Final charge: Rs. {finalAmount}
            </p>
            {isStripeAdjusted && (
              <p className="form-help">
                Stripe requires a minimum checkout amount, so small test bookings may be rounded up there.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary full-width"
            disabled={loading || !form.date || !form.time_slot}
          >
            {loading ? 'Processing...' : 'Confirm reservation'}
          </button>
        </form>
      </div>
    </main>
  )
}
