import bcrypt from 'bcryptjs'
import { db } from '../config/database'
import { users, sectors } from '../db/schema'
import { AppError } from '../middleware/error.middleware'
import { eq } from 'drizzle-orm'

export async function listUsers(sectorId?: number) {
  const query = db.select({
    id: users.id, name: users.name, email: users.email,
    role: users.role, sectorId: users.sectorId, isActive: users.isActive,
    sectorName: sectors.name, createdAt: users.createdAt,
  }).from(users).leftJoin(sectors, eq(users.sectorId, sectors.id))

  if (sectorId) return await query.where(eq(users.sectorId, sectorId))
  return await query
}

export async function createUser(data: { name: string; email: string; password: string; role: string; sectorId: number }) {
  const exists = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
  if (exists.length) throw new AppError(409, 'Email já cadastrado')

  const hash = await bcrypt.hash(data.password, 10)
  const [user] = await db.insert(users).values({
    name: data.name, email: data.email, passwordHash: hash,
    role: data.role as any, sectorId: data.sectorId,
  }).returning()

  return { id: user.id, name: user.name, email: user.email, role: user.role, sectorId: user.sectorId }
}
