import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { getAppBaseUrl } from '@/lib/utils'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const baseUrl = getAppBaseUrl()
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!userId && !email) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=Invalid+verification+link`)
  }

  try {
    // 1. Fetch user profile by userId or email
    let query = supabaseAdmin.from('user_profiles').select('*')
    if (userId) {
      query = query.eq('userId', userId)
    } else if (email) {
      query = query.eq('email', email.toLowerCase().trim())
    }

    const { data: profiles, error } = await query.limit(1)

    if (error || !profiles || profiles.length === 0) {
      return NextResponse.redirect(`${baseUrl}/sign-in?error=User+not+found`)
    }

    const user = profiles[0]

    // 2. Mark user as verified in database
    await supabaseAdmin
      .from('user_profiles')
      .update({ isVerified: true, updatedAt: new Date().toISOString() })
      .eq('userId', userId)

    // 3. Set session cookie for seamless sign in
    const cookieStore = await cookies()
    cookieStore.set('session_user_id', user.userId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // 4. Redirect based on role
    let redirectPath = '/student/dashboard'
    if (user.role === 'employer') redirectPath = '/employer/dashboard'
    if (user.role === 'admin') redirectPath = '/admin/dashboard'

    return NextResponse.redirect(`${baseUrl}${redirectPath}?verified=true`)
  } catch (err) {
    console.error('Error verifying user authentication link:', err)
    return NextResponse.redirect(`${baseUrl}/sign-in?error=Verification+failed`)
  }
}
