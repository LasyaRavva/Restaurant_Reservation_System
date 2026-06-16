import { Router } from 'express'
import { createCheckout } from '../controllers/paymentController.js'

const router = Router()

router.post('/checkout', createCheckout)

export default router
