import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware'
import { asyncHandler } from '../lib/async-handler'
import { upload, streamFile } from '../services/file.service'
import { db } from '../config/database'
import { documents } from '../db/schema'
import { eq } from 'drizzle-orm'
import { AppError } from '../middleware/error.middleware'
import { extname } from 'path'

const router = Router()
router.use(authMiddleware)

router.post('/upload', requireRole('admin'), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'Nenhum arquivo enviado')
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: `/api/files/${req.file.filename}`,
  })
}))

router.get('/:filename', asyncHandler(async (req, res) => {
  const ext = extname(req.params.filename).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  }
  const mime = mimeMap[ext] || 'application/octet-stream'
  res.setHeader('Content-Type', mime)
  res.setHeader('Content-Disposition', `inline; filename="${req.params.filename}"`)
  streamFile(req.params.filename).pipe(res)
}))

export default router
