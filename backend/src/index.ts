import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/environment'
import logger from './config/logger'
import { errorHandler } from './middleware/error.middleware'
import { authLimiter, apiLimiter, aiLimiter, searchLimiter, uploadLimiter } from './middleware/rate-limit.middleware'
import { doubleCsrfProtection, csrfTokenHandler, csrfErrorHandler } from './middleware/csrf.middleware'
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
import seedRoutes from './routes/seed.routes'
import reportRoutes from './routes/reports.routes'
import healthRoutes from './routes/health.routes'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { setupSocket } from './socket'

const app = express()

app.set('trust proxy', 1)
app.set('etag', false)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

const morganStream = { write: (message: string) => logger.info(message.trim()) }
app.use(morgan('combined', { stream: morganStream }))

app.get('/api/csrf-token', csrfTokenHandler)

const csrfExcluded = express.Router()
csrfExcluded.use('/health', healthRoutes)
csrfExcluded.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
csrfExcluded.use('/docs.json', (_req, res) => res.json(swaggerSpec))
csrfExcluded.use('/files', uploadLimiter, fileRoutes)

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api', csrfExcluded)

app.use('/api', doubleCsrfProtection)
app.use('/api', apiLimiter)

app.use('/api/users', userRoutes)
app.use('/api/sectors', sectorRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/ai', aiLimiter, aiRoutes)
app.use('/api/treinamentos', trainingRoutes)
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
app.use('/api/search', searchLimiter, searchRoutes)
app.use('/api/seed', seedRoutes)
app.use('/api/reports', reportRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

app.use(csrfErrorHandler)
app.use(errorHandler)

const server = app.listen(env.PORT, () => {
  logger.info(`TI DOCS backend running on port ${env.PORT}`)
  setupSocket(server)

  fetch(`${env.OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) })
    .then(res => {
      if (!res.ok) logger.warn(`IA retornou status ${res.status}`)
      else logger.info(`IA conectada em ${env.OLLAMA_URL}`)
    })
    .catch(() => logger.warn(`IA não disponível em ${env.OLLAMA_URL}`))
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...')
  server.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...')
  server.close(() => process.exit(0))
})

export default app
