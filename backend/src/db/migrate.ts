import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, connection } from '../config/database'

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  console.log('Migrations complete.')
  await connection.end()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
