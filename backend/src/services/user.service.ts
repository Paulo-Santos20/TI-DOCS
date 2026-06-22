import bcrypt from 'bcryptjs'
import { db } from '../config/database'
import { users, sectors } from '../db/schema'
import { AppError } from '../middleware/error.middleware'
import { eq, sql, isNull, and } from 'drizzle-orm'

function notDeleted() { return isNull(users.deletedAt) }

export async function listUsers(sectorId?: number, page = 1, limit = 50, includeDeleted = false) {
  const offset = (page - 1) * limit
  const filters = []
  if (!includeDeleted) filters.push(notDeleted())
  if (sectorId) filters.push(eq(users.sectorId, sectorId))
  const conditions = filters.length > 0 ? and(...filters) : undefined

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(conditions)

  const data = await db.select({
    id: users.id, name: users.name, email: users.email,
    role: users.role, sectorId: users.sectorId, isActive: users.isActive,
    sectorName: sectors.name, createdAt: users.createdAt,
  }).from(users).leftJoin(sectors, eq(users.sectorId, sectors.id))
    .where(conditions || undefined)
    .limit(limit).offset(offset)

  return { data, total: countResult.count, page, limit }
}

export async function getUser(id: number) {
  const [user] = await db.select({
    id: users.id, name: users.name, email: users.email,
    role: users.role, sectorId: users.sectorId, isActive: users.isActive,
    sectorName: sectors.name, createdAt: users.createdAt,
  }).from(users).leftJoin(sectors, eq(users.sectorId, sectors.id))
    .where(and(eq(users.id, id), notDeleted())).limit(1)

  if (!user) throw new AppError(404, 'Usuário não encontrado')
  return user
}

export async function createUser(data: { name: string; email: string; password: string; role: string; sectorId: number }) {
  const exists = await db.select().from(users).where(and(eq(users.email, data.email), notDeleted())).limit(1)
  if (exists.length) throw new AppError(409, 'Email já cadastrado')

  const hash = await bcrypt.hash(data.password, 10)
  const [user] = await db.insert(users).values({
    name: data.name, email: data.email, passwordHash: hash,
    role: data.role as any, sectorId: data.sectorId,
  }).returning()

  return { id: user.id, name: user.name, email: user.email, role: user.role, sectorId: user.sectorId }
}

export async function updateUser(id: number, data: { name?: string; email?: string; role?: string; sectorId?: number; isActive?: boolean }, actingUserId?: number) {
  const [user] = await db.select().from(users).where(and(eq(users.id, id), notDeleted())).limit(1)
  if (!user) throw new AppError(404, 'Usuário não encontrado')

  const fields: Record<string, any> = {}

  if (data.email !== undefined) {
    if (id === actingUserId) {
      throw new AppError(403, 'Você não pode alterar seu próprio email')
    }
    if (data.email !== user.email) {
      const exists = await db.select().from(users).where(and(eq(users.email, data.email), notDeleted())).limit(1)
      if (exists.length) throw new AppError(409, 'Email já cadastrado')
    }
    fields.email = data.email
  }

  if (data.name !== undefined) fields.name = data.name
  if (data.role !== undefined) fields.role = data.role
  if (data.sectorId !== undefined) fields.sectorId = data.sectorId
  if (data.isActive !== undefined) fields.isActive = data.isActive

  const [updated] = await db.update(users).set(fields).where(eq(users.id, id)).returning()
  return { id: updated.id, name: updated.name, email: updated.email, role: updated.role, sectorId: updated.sectorId, isActive: updated.isActive }
}

export async function deleteUser(id: number) {
  const [user] = await db.select().from(users).where(and(eq(users.id, id), notDeleted())).limit(1)
  if (!user) throw new AppError(404, 'Usuário não encontrado')
  await db.update(users).set({ deletedAt: sql`NOW()` }).where(eq(users.id, id))
  return { deleted: true }
}

export async function restoreUser(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) throw new AppError(404, 'Usuário não encontrado')
  if (!user.deletedAt) throw new AppError(400, 'Usuário não está deletado')
  await db.update(users).set({ deletedAt: null }).where(eq(users.id, id))
  return { restored: true }
}
