import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db, connection } from '../config/database'
import { sectors, users, systemConfigs } from './schema'
import { eq } from 'drizzle-orm'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tidocs.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function main() {
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
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await db.insert(users).values({
      name: 'Administrador',
      email: ADMIN_EMAIL,
      passwordHash: hash,
      role: 'admin',
      sectorId: sectorMap['TI'],
    })

    const userHash = await bcrypt.hash('user123', 10)
    await db.insert(users).values({
      name: 'Usuário',
      email: 'user@tidocs.com',
      passwordHash: userHash,
      role: 'user',
      sectorId: sectorMap['Enfermagem'],
    })

    await db.insert(systemConfigs).values([
      { key: 'app_name', value: 'TI Docs' },
      { key: 'maintenance_mode', value: 'false' },
    ])
  }

  console.log('Seed complete.')
  await connection.end()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
