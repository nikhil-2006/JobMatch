import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined
}

const client =
  global.__pgClient ||
  postgres(connectionString, {
    prepare: false,
  })

if (process.env.NODE_ENV !== 'production') {
  global.__pgClient = client
}

export const db = drizzle(client, { schema })
export { client }
