import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from './environment'
import * as schema from '../db/schema'

const client = postgres(env.DATABASE_URL, { max: env.DB_POOL_MAX })
export const db = drizzle(client, { schema })
export const connection = client
