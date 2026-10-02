'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ShieldCheck, CheckCircle2, RefreshCw, Send } from 'lucide-react'
import { resendVerificationEmailAction } from '@/app/actions/users'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your registered email'
  const role = searchParams.get('role') || 'student'

  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const handleResend = async () => {
    setResending(true)
    setResendStatus(null)
    try {
      const res = await resendVerificationEmailAction(email)
      if (res.success) {
        setResendStatus('Verification email sent to your inbox!')
      } else {
        setResendStatus(res.error || 'Failed to send email. Please try again.')
      }
    } catch (err) {
      setResendStatus('Failed to send verification email.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl border border-border/60 text-center">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-sm animate-pulse">
          <Mail className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Check Your Email Inbox
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a verification link to{' '}
            <span className="font-bold text-foreground underline underline-offset-4 decoration-primary">{email}</span>.
          </p>
        </div>

        {role === 'employer' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-600 text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              Employer Registration Submitted
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your campus partner join request was delivered to MVGR Admin. Open the email sent to your inbox and click the verification button to verify your ownership and activate your shop.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Verification Link Dispatched
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Open your email inbox and click the verification link inside to verify your account and log into your student candidate dashboard.
            </p>
          </div>
        )}

        {/* Action Panel */}
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or click below to resend.
          </p>

          <Button
            onClick={handleResend}
            disabled={resending}
            variant="outline"
            className="w-full font-bold gap-2 py-5 rounded-xl border-border/80"
          >
            {resending ? (
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Send className="w-4 h-4 text-primary" />
            )}
            {resending ? 'Sending Email...' : 'Resend Verification Email'}
          </Button>

          {resendStatus && (
            <p
              className={`text-xs p-2.5 rounded-lg font-semibold border ${
                resendStatus.includes('sent')
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
            >
              {resendStatus}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
          <Link href="/sign-in" className="hover:underline text-primary font-medium">
            Back to Sign In
          </Link>
          <Link href="/" className="hover:underline">
            Home Page
          </Link>
        </div>
      </Card>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading verification status...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
