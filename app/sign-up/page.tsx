import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('userId', session.user.id)
      .limit(1)

    const role = profile?.[0]?.role || 'student'
    if (role === 'admin') redirect('/admin/dashboard')
    if (role === 'employer') redirect('/employer/dashboard')
    redirect('/student/dashboard')
  }
  return <AuthForm mode="sign-up" />
}
