import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import routes from './routes/index.js'
import reservationRoutes from './routes/reservationRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.clientOrigins.length > 1 ? env.clientOrigins : env.clientOrigin,
  credentials: true
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))

app.use('/api', routes)
app.use('/reservations', reservationRoutes)
app.use('/payments', paymentRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
