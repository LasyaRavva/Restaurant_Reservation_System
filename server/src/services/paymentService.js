import Stripe from 'stripe'
import Razorpay from 'razorpay'
import { env } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null
const razorpay = env.razorpayKeyId && env.razorpayKeySecret
  ? new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret
    })
  : null

const SUPPORTED_PROVIDERS = new Set(['stripe', 'razorpay'])
const STRIPE_MIN_AMOUNT_INR = 50

export async function createPaymentSession({
  amount,
  currency = 'inr',
  metadata = {},
  provider = env.paymentProvider
}) {
  const selectedProvider = provider || env.paymentProvider

  if (!SUPPORTED_PROVIDERS.has(selectedProvider)) {
    throw new ApiError(400, `Unsupported payment provider: ${selectedProvider}`)
  }

  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new ApiError(400, 'A valid payment amount is required')
  }

  const amountInSubunits = Math.round(numericAmount * 100)
  const stripeCurrency = String(currency || 'inr').toLowerCase()
  const razorpayCurrency = String(currency || 'INR').toUpperCase()
  const normalizedMetadata = Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  )

  if (selectedProvider === 'stripe') {
    if (!stripe) throw new ApiError(500, 'Stripe is not configured')

    const stripeMinimumInSubunits = STRIPE_MIN_AMOUNT_INR * 100
    const stripeChargeInSubunits = Math.max(amountInSubunits, stripeMinimumInSubunits)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${env.clientOrigin}/reservation-confirmation?reservation_id=${encodeURIComponent(metadata.reservationId || '')}&restaurant_id=${encodeURIComponent(metadata.restaurantId || '')}&restaurant_name=${encodeURIComponent(metadata.restaurantName || 'Restaurant')}&date=${encodeURIComponent(metadata.date || '')}&time_slot=${encodeURIComponent(metadata.timeSlot || '')}&party_size=${encodeURIComponent(metadata.partySize || '')}&amount=${encodeURIComponent(metadata.amount || '')}&provider=stripe&status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.clientOrigin}/reservation-confirmation?reservation_id=${encodeURIComponent(metadata.reservationId || '')}&restaurant_id=${encodeURIComponent(metadata.restaurantId || '')}&restaurant_name=${encodeURIComponent(metadata.restaurantName || 'Restaurant')}&date=${encodeURIComponent(metadata.date || '')}&time_slot=${encodeURIComponent(metadata.timeSlot || '')}&party_size=${encodeURIComponent(metadata.partySize || '')}&amount=${encodeURIComponent(metadata.amount || '')}&provider=stripe&status=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: stripeCurrency,
            unit_amount: stripeChargeInSubunits,
            product_data: {
              name: metadata.restaurantName ? `Reservation at ${metadata.restaurantName}` : 'Restaurant reservation'
            }
          }
        }
      ],
      metadata: normalizedMetadata
    })

    return {
      provider: 'stripe',
      id: session.id,
      url: session.url
    }
  }

  if (selectedProvider === 'razorpay') {
    if (!razorpay) throw new ApiError(500, 'Razorpay is not configured')

    const order = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: razorpayCurrency,
      receipt: metadata.reservationId || undefined,
      notes: normalizedMetadata
    })

    return {
      provider: 'razorpay',
      keyId: env.razorpayKeyId,
      order
    }
  }

  throw new ApiError(400, `Unsupported payment provider: ${selectedProvider}`)
}
