import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/utils/supabase/admin'
import crypto from 'crypto'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false
  const [salt, originalHash] = storedHash.split(':')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'))
}

export const auth = {
  api: {
    async getSession(_options?: { headers?: Headers }) {
      try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('session_user_id')?.value
        if (!userId) return null

        const { data: profiles } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('userId', userId)
          .limit(1)

        if (!profiles || profiles.length === 0) return null

        const u = profiles[0]
        const fullName =
          [u.firstName, u.lastName].filter(Boolean).join(' ') ||
          u.companyName ||
          'User'

        return {
          user: {
            id: u.userId as string,
            email: (u.email || '') as string,
            name: fullName as string,
            role: u.role as string,
          },
        }
      } catch (error) {
        return null
      }
    },
  },
}
