import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { db } from '../config/database'
import { users, refreshTokens, sectors } from '../db/schema'
import { env } from '../config/environment'
import { AppError } from '../middleware/error.middleware'
import { eq, and, isNull, sql } from 'drizzle-orm'

function generateAccessToken(user: { id: number; role: string; sectorId: number }) {
  return jwt.sign(
    { userId: user.id, role: user.role, sectorId: user.sectorId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  )
}

function parseDays(value: string): number {
  const match = value.match(/^(\d+)(d)?$/)
  if (match) return parseInt(match[1])
  return 7
}

async function generateRefreshToken(userId: number) {
  const token = crypto.randomBytes(40).toString('hex')
  const days = parseDays(env.JWT_REFRESH_EXPIRES_IN)
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  await db.insert(refreshTokens).values({
    userId,
    token,
    expiresAt,
  })

  return { token, expiresAt }
}

export async function login(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!user || !user.isActive) throw new AppError(401, 'Credenciais inválidas')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new AppError(401, 'Credenciais inválidas')

  const accessToken = generateAccessToken(user)
  const refresh = await generateRefreshToken(user.id)

  return {
    token: accessToken,
    refreshToken: refresh.token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, sectorId: user.sectorId },
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const [stored] = await db.select()
    .from(refreshTokens)
    .where(and(
      eq(refreshTokens.token, refreshToken),
      isNull(refreshTokens.revokedAt),
      sql`${refreshTokens.expiresAt} > NOW()`,
    ))
    .limit(1)

  if (!stored) throw new AppError(401, 'Refresh token inválido ou expirado')

  await db.update(refreshTokens)
    .set({ revokedAt: sql`NOW()` })
    .where(eq(refreshTokens.id, stored.id))

  const [user] = await db.select().from(users).where(eq(users.id, stored.userId)).limit(1)
  if (!user || !user.isActive) throw new AppError(401, 'Usuário não encontrado ou inativo')

  const accessToken = generateAccessToken(user)
  const refresh = await generateRefreshToken(user.id)

  return {
    token: accessToken,
    refreshToken: refresh.token,
  }
}

export async function getMe(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user) throw new AppError(404, 'Usuário não encontrado')
  return { id: user.id, name: user.name, email: user.email, role: user.role, sectorId: user.sectorId }
}
