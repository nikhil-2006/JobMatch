const { auth } = require('./lib/auth')
const { db } = require('./lib/db')
const { userProfiles, jobs } = require('./lib/db/schema')
const { eq } = require('drizzle-orm')

async function runTest() {
  console.log('=== Starting Registration E2E Test ===')
  
  const studentEmail = `student_${Date.now()}@mvgr.ac.in`
  const password = 'StudentPassword123!'
  const name = 'Kiran Student'

  // 1. SignUp via Better Auth
  console.log('1. Signing up Student:', studentEmail)
  const signUpRes = await auth.api.signUpEmail({
    body: {
      email: studentEmail,
      password: password,
      name: name,
    }
  })

  if (!signUpRes || !signUpRes.user) {
    console.error('FAILED: SignUp failed', signUpRes)
    process.exit(1)
  }

  console.log('Student created with ID:', signUpRes.user.id)

  // 2. Insert User Profile
  const profileId = `profile_${Date.now()}`
  await db.insert(userProfiles).values({
    id: profileId,
    userId: signUpRes.user.id,
    role: 'student',
    firstName: 'Kiran',
    lastName: 'Student',
    phone: '+91 98765 43210',
    isVerified: true,
  })

  console.log('2. Created user profile successfully!')

  // 3. Verify profile from DB
  const fetched = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, signUpRes.user.id))

  console.log('3. Fetched Profile:', fetched[0])

  if (fetched.length > 0 && fetched[0].role === 'student') {
    console.log('=== REGISTRATION TEST PASSED SUCCESSFULLY! ===')
  } else {
    console.error('FAILED: Profile mismatch')
  }
}

runTest().catch(console.error)
