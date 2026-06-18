import bcrypt from 'bcryptjs'
import { db, connection } from '../config/database'
import { sectors, users } from './schema'
import { eq } from 'drizzle-orm'

async function main() {
  console.log('Seeding database...')

  const existingSectors = await db.select().from(sectors)
  const existingUsers = await db.select().from(users)

  if (existingSectors.length > 0 && existingUsers.length > 0) {
    console.log('Database already seeded. Skipping.')
    await connection.end()
    return
  }

  const sectorData = ['TI', 'Enfermagem', 'Medicina', 'Administrativo']
  const sectorMap: Record<string, number> = {}

  for (const name of existingSectors.length === 0 ? sectorData : []) {
    const [s] = await db.insert(sectors).values({ name }).returning()
    sectorMap[s.name] = s.id
  }

  if (existingSectors.length > 0) {
    for (const s of existingSectors) {
      sectorMap[s.name] = s.id
    }
  }

  if (existingUsers.length === 0) {
    const hash = await bcrypt.hash('admin123', 10)
    await db.insert(users).values({
      name: 'Administrador',
      email: 'admin@tidocs.com',
      passwordHash: hash,
      role: 'admin',
      sectorId: sectorMap['TI'],
    })
  }

  console.log('Seed complete.')
  await connection.end()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
