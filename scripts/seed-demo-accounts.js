const { auth } = require('./lib/auth')
const { db } = require('./lib/db')
const { userProfiles, jobs } = require('./lib/db/schema')
const { eq } = require('drizzle-orm')

async function seedDemoAccounts() {
  console.log('Seeding demo accounts...')

  const accounts = [
    {
      email: 'admin@mvgr.ac.in',
      password: 'AdminPassword123!',
      name: 'MVGR Platform Admin',
      role: 'admin',
      firstName: 'MVGR',
      lastName: 'Admin',
      phone: '+91 90000 00000',
    },
    {
      email: 'student@mvgr.ac.in',
      password: 'StudentPassword123!',
      name: 'Kiran Kumar',
      role: 'student',
      firstName: 'Kiran',
      lastName: 'Kumar',
      phone: '+91 98765 43210',
    },
    {
      email: 'employer@mvgr.ac.in',
      password: 'EmployerPassword123!',
      name: 'Rajesh Varma',
      role: 'employer',
      firstName: 'Rajesh',
      lastName: 'Varma',
      phone: '+91 91234 56789',
      companyName: 'MVGR Tech Xerox & Printing Arcade',
      companyAddress: 'MVGR Main Gate Arcade, Vizianagaram',
    }
  ]

  for (const acc of accounts) {
    try {
      const signUpRes = await auth.api.signUpEmail({
        body: {
          email: acc.email,
          password: acc.password,
          name: acc.name,
        }
      })

      const userId = signUpRes?.user?.id
      if (userId) {
        // Check existing profile
        const existingProfile = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId))

        if (existingProfile.length === 0) {
          await db.insert(userProfiles).values({
            id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            role: acc.role,
            firstName: acc.firstName,
            lastName: acc.lastName,
            phone: acc.phone,
            companyName: acc.companyName,
            companyAddress: acc.companyAddress,
            latitude: acc.role === 'employer' ? 18.0603 : undefined,
            longitude: acc.role === 'employer' ? 83.4004 : undefined,
            isVerified: true,
          })
        }

        if (acc.role === 'employer') {
          await db.insert(jobs).values({
            id: `job_demo_${Date.now()}`,
            userId,
            title: 'MVGR Tech Xerox - Part-Time Assistant',
            description: 'Printing, Document Scanning, and Billing Assistant at MVGR Main Arcade.',
            location: 'MVGR Main Gate Arcade, Vizianagaram',
            hourlyRate: '16.00',
            jobType: 'part-time',
            latitude: 18.0603,
            longitude: 83.4004,
            status: 'active',
          })
        }
        console.log(`Successfully created demo account: ${acc.email} (${acc.role})`)
      }
    } catch (err) {
      console.log(`Account ${acc.email} might already exist or note:`, err.message)
    }
  }

  console.log('Demo account seeding complete!')
}

seedDemoAccounts().catch(console.error)
