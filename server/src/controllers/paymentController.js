import { asyncHandler } from '../utils/asyncHandler.js'
import { createPaymentSession } from '../services/paymentService.js'

export const createCheckout = asyncHandler(async (req, res) => {
  const session = await createPaymentSession(req.body)

  res.status(201).json({
    success: true,
    data: session
  })
})
