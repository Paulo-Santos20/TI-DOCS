import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/environment'
import { errorHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/users.routes'
import sectorRoutes from './routes/sectors.routes'
import documentRoutes from './routes/documents.routes'
import aiRoutes from './routes/ai.routes'
import trainingRoutes from './routes/training.routes'
import fileRoutes from './routes/files.routes'
import categoryRoutes from './routes/categories.routes'
import commentRoutes from './routes/comments.routes'
import templateRoutes from './routes/templates.routes'
import tagRoutes from './routes/tags.routes'
import assignmentRoutes from './routes/assignments.routes'
import notificationRoutes from './routes/notifications.routes'
import dashboardRoutes from './routes/dashboard.routes'
import profileRoutes from './routes/profile.routes'
import auditRoutes from './routes/audit.routes'
import settingsRoutes from './routes/settings.routes'
import searchRoutes from './routes/search.routes'

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '10mb' }))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
})

const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api', apiLimiter)

app.use('/api/users', userRoutes)
app.use('/api/sectors', sectorRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/treinamentos', trainingRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/search', searchRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

app.use(errorHandler)

const server = app.listen(env.PORT, () => {
  console.log(`TI DOCS backend running on port ${env.PORT}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  server.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  server.close(() => process.exit(0))
})

export default app
