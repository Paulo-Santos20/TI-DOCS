import { createReadStream, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { env } from '../config/environment'
import { AppError } from '../middleware/error.middleware'
import multer from 'multer'

const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']

if (!existsSync(env.UPLOAD_DIR)) {
  mkdirSync(env.UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true)
    } else {
      cb(new AppError(400, 'Tipo de arquivo não permitido') as any)
    }
  },
})

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (IMAGE_MIMES.includes(file.mimetype) && IMAGE_EXTENSIONS.includes(ext)) {
      cb(null, true)
    } else {
      cb(new AppError(400, 'Formato de imagem não permitido. Use JPEG, PNG ou WebP') as any)
    }
  },
})

export function streamFile(filename: string) {
  const safe = path.basename(filename)
  if (safe !== filename) throw new AppError(400, 'Nome de arquivo inválido')

  const filePath = path.join(env.UPLOAD_DIR, safe)
  if (!existsSync(filePath)) throw new AppError(404, 'Arquivo não encontrado')
  return createReadStream(filePath)
}

export function getFilePath(filename: string) {
  const safe = path.basename(filename)
  if (safe !== filename) throw new AppError(400, 'Nome de arquivo inválido')
  const filePath = path.join(env.UPLOAD_DIR, safe)
  if (!existsSync(filePath)) throw new AppError(404, 'Arquivo não encontrado')
  return filePath
}
