import 'server-only'
import { Pool, type PoolClient } from 'pg'
import { AuthError } from './registration'

const state = globalThis as unknown as { deploymentPool?: Pool }
export function database() {
  if (!process.env.DATABASE_URL) throw new AuthError('The database connection is not configured.', 503)
  // TLS configuration comes from the connection URL; do not disable certificate verification.
  return state.deploymentPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000 })
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await database().connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}
