import { Router } from 'express'
import reservationRoutes from './reservationRoutes.js'
import paymentRoutes from './paymentRoutes.js'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is healthy' })
})

router.use('/reservations', reservationRoutes)
router.use('/payments', paymentRoutes)

export default router