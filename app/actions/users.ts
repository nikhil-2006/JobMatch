'use server'

import { auth, hashPassword, verifyPassword, getAuthVerificationLink, getAppBaseUrl } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession()
  return session?.user?.id || null
}

export async function signInUserAction(data: { email: string; password: string }) {
  try {
    const normalizedEmail = data.email.toLowerCase().trim()
    const cookieStore = await cookies()

    // 1. Search for user by email
    let { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .limit(1)

    profiles = profiles || []

    // Auto-provision Admin if signing in as admin for the first time
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mvgr.ac.in'
    if (profiles.length === 0 && normalizedEmail === adminEmail.toLowerCase().trim()) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!'
      const hashedPassword = hashPassword(adminPassword)
      const adminUserId = `admin_${Date.now()}`

      await supabaseAdmin.from('user_profiles').insert({
        id: `profile_${Date.now()}`,
        userId: adminUserId,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin',
        firstName: process.env.ADMIN_NAME?.split(' ')[0] || 'MVGR',
        lastName: process.env.ADMIN_NAME?.split(' ').slice(1).join(' ') || 'Admin',
        phone: '+91 90000 00000',
        isVerified: true,
      })

      const { data: refetched } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('userId', adminUserId)
        .limit(1)

      profiles = refetched || []
    }

    if (profiles.length === 0) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const user = profiles[0]

    // Verify password
    if (user.password) {
      const isValid = verifyPassword(data.password, user.password)
      if (!isValid) {
        return { success: false, error: 'Invalid email or password.' }
      }
    }

    // Set HTTP session cookie
    cookieStore.set('session_user_id', user.userId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.companyName ||
      'User'

    return {
      success: true,
      user: {
        id: user.userId,
        email: user.email || normalizedEmail,
        name,
        role: user.role,
      },
    }
  } catch (error) {
    console.error('Error in signInUserAction:', error)
    return { success: false, error: 'Sign in failed. Please try again.' }
  }
}

export async function signOutUserAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session_user_id')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    return { success: false }
  }
}

export async function createUserProfile(data: {
  role: 'student' | 'employer' | 'admin'
  firstName?: string
  lastName?: string
  bio?: string
  phone?: string
  companyName?: string
  companySize?: string
}) {
  const userId = await getUserId()
  if (!userId) return { success: false, error: 'Unauthorized' }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: `profile_${Date.now()}`,
        userId,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        phone: data.phone,
        companyName: data.companyName,
        companySize: data.companySize,
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/')
    return { success: true, profile }
  } catch (error) {
    console.error('Error creating profile:', error)
    return { success: false, error: 'Failed to create profile' }
  }
}

export async function getUserProfile() {
  const userId = await getUserId()
  if (!userId) return null

  try {
    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .limit(1)

    return profiles?.[0] || null
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export async function updateUserProfile(data: Record<string, any> & { skills?: string[] | string }) {
  const userId = await getUserId()
  if (!userId) return { success: false, error: 'Unauthorized' }

  try {
    const formattedData = {
      ...data,
      skills: data.skills
        ? typeof data.skills === 'string'
          ? data.skills
          : JSON.stringify(data.skills)
        : undefined,
      updatedAt: new Date().toISOString(),
    }

    // Check if profile exists
    const { data: existing } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('userId', userId)
      .limit(1)

    if (!existing || existing.length === 0) {
      const { data: inserted, error } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: `profile_${Date.now()}`,
          userId,
          role: data.role || 'student',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          bio: data.bio || '',
          phone: data.phone || '',
          skills: formattedData.skills || '[]',
        })
        .select()
        .single()

      if (error) throw error
      revalidatePath('/')
      return { success: true, profile: inserted }
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .update(formattedData)
      .eq('userId', userId)
      .select()
      .single()

    if (error) throw error
    revalidatePath('/')
    return { success: true, profile }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

export async function registerUserAction(data: {
  email: string
  name: string
  password?: string
  userId?: string
  role: 'student' | 'employer' | 'admin'
  phone?: string
  companyName?: string
  companyAddress?: string
  latitude?: number
  longitude?: number
}) {
  try {
    const normalizedEmail = data.email.toLowerCase().trim()
    const cookieStore = await cookies()

    // Check if email already registered
    const { data: existing } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1)

    if (existing && existing.length > 0) {
      return { success: false, error: 'An account with this email address already exists.' }
    }

    const resolvedUserId =
      data.userId ||
      `${data.role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const profileId = `profile_${Date.now()}`
    const hashedPassword = data.password ? hashPassword(data.password) : undefined

    const isVerified = data.role === 'student'

    const nameParts = (data.name || 'User').trim().split(' ')
    const firstName = nameParts[0] || 'User'
    const lastName = nameParts.slice(1).join(' ') || ''

    const { error: insertError } = await supabaseAdmin.from('user_profiles').insert({
      id: profileId,
      userId: resolvedUserId,
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role,
      firstName,
      lastName,
      phone: data.phone || '+91 98765 43210',
      companyName:
        data.role === 'employer' ? data.companyName || `${firstName}'s Campus Shop` : undefined,
      companyAddress:
        data.role === 'employer'
          ? data.companyAddress || 'MVGR Campus Main Arcade'
          : undefined,
      latitude: data.role === 'employer' ? data.latitude || 18.0603 : undefined,
      longitude: data.role === 'employer' ? data.longitude || 83.4004 : undefined,
      isVerified,
    })

    if (insertError) throw insertError

    if (data.role === 'employer') {
      await supabaseAdmin.from('jobs').insert({
        id: `job_${Date.now()}`,
        userId: resolvedUserId,
        title: `${data.companyName || firstName + ' Shop'} - Assistant`,
        description: `Part-time assistant role at ${data.companyName || 'MVGR Campus Store'}.`,
        location: data.companyAddress || 'MVGR Main Gate Arcade, Vizianagaram',
        hourlyRate: '16.00',
        jobType: 'part-time',
        latitude: data.latitude || 18.0603,
        longitude: data.longitude || 83.4004,
        status: 'active',
      })

      const { data: adminProfiles } = await supabaseAdmin
        .from('user_profiles')
        .select('userId')
        .eq('role', 'admin')
        .limit(1)

      if (adminProfiles && adminProfiles.length > 0 && adminProfiles[0]?.userId) {
        await supabaseAdmin.from('notifications').insert({
          id: `notif_${Date.now()}`,
          userId: adminProfiles[0].userId,
          type: 'employer_registration',
          title: 'New Employer Registration Request',
          message: `${data.companyName || data.name} submitted a request to join MVGR JobMatch as a Campus Partner.`,
          isRead: false,
        })
      }
    }

    let verificationLink = getAuthVerificationLink(resolvedUserId, normalizedEmail)

    try {
      const { data: authLinkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: normalizedEmail,
        password: data.password || 'TempPassword123!',
        options: {
          redirectTo: `${getAppBaseUrl()}/api/auth/verify?userId=${resolvedUserId}`,
        },
      })
      if (authLinkData?.properties?.action_link) {
        verificationLink = authLinkData.properties.action_link
      }
    } catch (e) {
      console.log('Supabase Auth direct link notice (using app verification link):', e)
    }

    // Send verification link directly to user's email inbox
    await sendVerificationEmail({
      email: normalizedEmail,
      name: data.name || firstName,
      verificationLink,
      role: data.role,
    })

    // Set HTTP session cookie
    cookieStore.set('session_user_id', resolvedUserId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    })

    revalidatePath('/')
    return { success: true, userId: resolvedUserId, role: data.role }
  } catch (error) {
    console.error('Error in registerUserAction:', error)
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

export async function resendVerificationEmailAction(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    const { data: profiles } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .limit(1)

    if (!profiles || profiles.length === 0) {
      return { success: false, error: 'No user profile found with that email address.' }
    }

    const user = profiles[0]
    const verificationLink = getAuthVerificationLink(user.userId, user.email)
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User'

    await sendVerificationEmail({
      email: user.email,
      name,
      verificationLink,
      role: user.role,
    })

    return { success: true }
  } catch (error) {
    console.error('Error in resendVerificationEmailAction:', error)
    return { success: false, error: 'Failed to resend email. Please try again.' }
  }
}

