'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Briefcase, Building2, MapPin, Phone, User, Store, ShieldAlert } from 'lucide-react'
import { registerUserAction, signInUserAction } from '@/app/actions/users'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'employer'>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  
  // Employer / Shop Specific Fields
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('MVGR Main Gate Arcade, Vizianagaram')
  const [latitude, setLatitude] = useState('18.0603')
  const [longitude, setLongitude] = useState('83.4004')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        // Create Account & Profile in SQLite Database
        const regRes = await registerUserAction({
          email,
          password,
          name: name || companyName || 'MVGR User',
          role,
          phone,
          companyName: role === 'employer' ? companyName : undefined,
          companyAddress: role === 'employer' ? companyAddress : undefined,
          latitude: role === 'employer' ? parseFloat(latitude) || 18.0603 : undefined,
          longitude: role === 'employer' ? parseFloat(longitude) || 83.4004 : undefined,
        })

        if (!regRes.success) {
          setError(regRes.error || 'Failed to complete registration profile.')
          setLoading(false)
          return
        }

        setLoading(false)

        // Redirect to Check Email Inbox page without creating session/localStorage until verified
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}&role=${role}`
      } else {
        // Sign In Flow
        const signInRes = await signInUserAction({ email, password })

        if (!signInRes.success || !signInRes.user) {
          setLoading(false)
          if ((signInRes as any).unverified) {
            window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
            return
          }
          setError(signInRes.error ?? 'Invalid email or password.')
          return
        }

        const userData = {
          id: signInRes.user.id,
          name: signInRes.user.name,
          email: signInRes.user.email,
          role: signInRes.user.role,
        }
        localStorage.setItem('currentUser', JSON.stringify(userData))

        setLoading(false)
        const targetDashboard = signInRes.user.role === 'admin'
          ? '/admin/dashboard'
          : signInRes.user.role === 'employer'
          ? '/employer/dashboard'
          : '/student/dashboard'
        window.location.href = targetDashboard
      }
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Something went wrong during request processing.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-xl border border-border/60">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isSignUp ? 'MVGR JobMatch Register' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isSignUp
              ? 'Connect with campus part-time jobs & verified shop partners'
              : 'Sign in to access your student or employer portal'}
          </p>
        </div>

        {/* Role Selector Tabs (Only on Sign Up) */}
        {isSignUp && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all ${
                role === 'student'
                  ? 'bg-background text-primary shadow-sm border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Student Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all ${
                role === 'employer'
                  ? 'bg-background text-emerald-500 shadow-sm border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Campus Employer / Shop</span>
            </button>
          </div>
        )}

        {isSignUp && role === 'employer' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              Employer Verification Process
            </p>
            <p className="text-[11px] opacity-90">
              When you register as an Employer, your join request is submitted to MVGR Admin. Upon Admin approval, your shop will pop up on student interactive maps and your certificate will unlock!
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Common / Role Fields */}
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xs font-semibold">
                {role === 'employer' ? 'Contact / Manager Name' : 'Student Full Name'} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-10"
                  placeholder={role === 'employer' ? 'Rajesh Varma' : 'Kiran Kumar'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Employer Specific Fields */}
          {isSignUp && role === 'employer' && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="companyName" className="text-xs font-semibold">
                  Shop / Company Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    className="pl-10"
                    placeholder="e.g. MVGR Tech Xerox & Printing Arcade"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="companyAddress" className="text-xs font-semibold">Campus Location Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyAddress"
                    className="pl-10"
                    placeholder="MVGR Campus Main Arcade, Vizianagaram"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 space-y-2">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Map Pin Placement (MVGR Campus Coordinates)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Latitude</span>
                    <Input
                      className="text-xs font-mono"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Longitude</span>
                    <Input
                      className="text-xs font-mono"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={role === 'employer' ? 'shop@mvgr.ac.in' : 'student@mvgr.ac.in'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Phone (Only for Sign Up) */}
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-medium" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full font-bold">
            {loading
              ? 'Processing Registration...'
              : isSignUp
                ? role === 'employer'
                  ? 'Submit Employer Request'
                  : 'Register Student Account'
                : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="text-primary font-bold underline-offset-4 hover:underline"
          >
            {isSignUp ? 'Sign in here' : 'Sign Up Page'}
          </Link>
        </p>
      </Card>
    </main>
  )
}
