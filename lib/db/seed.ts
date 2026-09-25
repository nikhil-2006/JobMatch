import { db } from './index'
import { userProfiles } from './schema'
import { eq } from 'drizzle-orm'

/**
 * seedDatabaseIfEmpty is kept as a no-op to eliminate all static/mock data.
 * Database operates strictly on real user submissions.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  // No static/mock data — all data comes from real user registrations.
}

/**
 * Ensures the administrator profile exists in the database if an admin email is configured.
 */
export async function initAdminUser(adminUserId: string, email: string, name: string = 'MVGR Platform Admin') {
  try {
    const existing = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, adminUserId))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(userProfiles).values({
        id: `profile_admin_${Date.now()}`,
        userId: adminUserId,
        email,
        role: 'admin',
        firstName: name.split(' ')[0] || 'System',
        lastName: name.split(' ').slice(1).join(' ') || 'Admin',
        bio: 'MVGR JobMatch Platform Administrator.',
        phone: '+91 90000 00000',
        skills: '[]',
        isVerified: true,
      })
    }
  } catch (err) {
    console.error('Error initializing admin profile:', err)
  }
}
