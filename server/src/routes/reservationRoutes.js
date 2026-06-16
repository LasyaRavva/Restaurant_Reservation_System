import { Router } from 'express'
import { getReservations, patchReservationStatus, postReservation } from '../controllers/reservationController.js'

const router = Router()

router.get('/', getReservations)
router.post('/', postReservation)
router.patch('/:id/status', patchReservationStatus)

export default router
