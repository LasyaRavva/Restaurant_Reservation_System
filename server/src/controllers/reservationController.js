import { asyncHandler } from '../utils/asyncHandler.js'
import { createReservation, listReservations, updateReservationStatus } from '../services/reservationService.js'
import { sendReservationConfirmationEmail, sendReservationReceivedEmail } from '../services/emailService.js'

export const getReservations = asyncHandler(async (req, res) => {
  const reservations = await listReservations({
    status: req.query.status,
    restaurantId: req.query.restaurantId
  })

  res.json({
    success: true,
    data: reservations
  })
})

export const postReservation = asyncHandler(async (req, res) => {
  const reservation = await createReservation(req.body)

  if (reservation?.profiles?.name && reservation?.profiles?.email) {
    await sendReservationReceivedEmail({
      to: reservation.profiles.email,
      name: reservation.profiles.name,
      restaurantName: reservation.restaurants?.name || 'your restaurant',
      date: reservation.date,
      timeSlot: reservation.time_slot
    })
  }

  res.status(201).json({
    success: true,
    data: reservation
  })
})

export const patchReservationStatus = asyncHandler(async (req, res) => {
  const reservation = await updateReservationStatus(req.params.id, req.body.status)

  if (reservation?.notifyConfirmation && reservation?.profiles?.name && reservation?.profiles?.email) {
    await sendReservationConfirmationEmail({
      to: reservation.profiles.email,
      name: reservation.profiles.name,
      restaurantName: reservation.restaurants?.name || 'your restaurant',
      date: reservation.date,
      timeSlot: reservation.time_slot
    })
  }

  res.json({
    success: true,
    data: reservation
  })
})
