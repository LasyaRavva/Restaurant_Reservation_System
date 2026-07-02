import { Router } from 'express'
import reservationRoutes from './reservationRoutes.js'
import paymentRoutes from './paymentRoutes.js'

const router = Router()
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "https://restaurant-reservation-system-fw3s.vercel.app",
      "http://localhost:5173",
    ];
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Strip trailing slash for comparison
    if (allowed.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy'
  })
})

router.use('/reservations', reservationRoutes)
router.use('/payments', paymentRoutes)

export default router
