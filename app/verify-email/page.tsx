'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle2, ShieldCheck, Copy, ArrowRight, ExternalLink } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your account email'
  const role = searchParams.get('role') || 'student'
  const linkParam = searchParams.get('link')

  const [copied, setCopied] = useState(false)
  const [verificationUrl, setVerificationUrl] = useState('')

  useEffect(() => {
    if (linkParam) {
      setVerificationUrl(linkParam)
    } else {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      setVerificationUrl(`${origin}/api/auth/verify?email=${encodeURIComponent(email)}`)
    }
  }, [linkParam, email])

  const copyToClipboard = () => {
    if (verificationUrl) {
      navigator.clipboard.writeText(verificationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl border border-border/60 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Account Verification Required
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent an authentication verification link for <span className="font-semibold text-foreground">{email}</span>.
          </p>
        </div>

        {role === 'employer' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-600 text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              Employer Request Sent to Admin
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your request to join MVGR JobMatch as a Campus Partner store has been submitted to MVGR Admin. Verify your email link below to activate your account and verify your shop location.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Student Registration Verified
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click the verification link below to verify your student account and access campus jobs & nearby shops.
            </p>
          </div>
        )}

        {/* Verification Link Card */}
        <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border/60 text-left">
          <label className="text-xs font-bold text-foreground block">
            Your Vercel Authentication Verification Link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={verificationUrl}
              className="flex-1 bg-background text-xs font-mono p-2.5 rounded-lg border border-border/60 truncate select-all"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0 gap-1 text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={verificationUrl}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm shadow-md"
          >
            <span>Verify Account Now</span>
            <ArrowRight className="w-4 h-4" />
          </a>
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
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading verification screen...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
