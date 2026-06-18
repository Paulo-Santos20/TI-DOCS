import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../config/database'
import { users } from '../db/schema'
import { env } from '../config/environment'
import { AppError } from '../middleware/error.middleware'
import { eq } from 'drizzle-orm'

export async function login(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user || !user.isActive) throw new AppError(401, 'Credenciais inválidas')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new AppError(401, 'Credenciais inválidas')

  const token = jwt.sign(
    { userId: user.id, role: user.role, sectorId: user.sectorId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  )

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, sectorId: user.sectorId },
  }
}

export async function getMe(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) throw new AppError(404, 'Usuário não encontrado')
  return { id: user.id, name: user.name, email: user.email, role: user.role, sectorId: user.sectorId }
}
