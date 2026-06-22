import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, connection } from '../config/database'
import logger from '../config/logger'

async function main() {
  logger.info('Running migrations...')
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  logger.info('Migrations complete.')
  await connection.end()
}

main().catch((err) => {
  logger.error('Migration failed:', err)
  process.exit(1)
})
