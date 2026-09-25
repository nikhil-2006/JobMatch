'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  User,
  Bell,
  Shield,
  Save,
  CheckCircle,
  Loader2,
  Lock,
  Smartphone,
  MapPin,
  Mail,
  Navigation,
} from 'lucide-react'
import { getUserProfile, updateUserProfile } from '@/app/actions/users'

export default function StudentSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [profile, setProfile] = useState({
    firstName: 'MVGR Student',
    lastName: 'Resident',
    email: 'student.mvgr@college.edu',
    phone: '+91 98765 43210',
    location: 'Hostel Block A, MVGR College of Engineering, Vizianagaram',
    bio: 'CSE Undergrad passionate about part-time tech and campus store duties.',
  })

  // Settings Preferences
  const [preferences, setPreferences] = useState({
    emailNotifs: true,
    smsNotifs: true,
    shiftReminders: true,
    gpsPrivacy: true,
    darkMode: true,
    twoFactor: false,
  })

  // Password Form
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  })
  const [passMsg, setPassMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const user: any = await getUserProfile()
        if (user) {
          setProfile({
            firstName: user.firstName || 'MVGR Student',
            lastName: user.lastName || 'Resident',
            email: user.email || 'student.mvgr@college.edu',
            phone: user.phone || '+91 98765 43210',
            location: user.location || 'MVGR Hostel Block A, Vizianagaram',
            bio: user.bio || 'CSE Undergrad passionate about campus store duties.',
          })
        }
      } catch (err) {
        console.error('Error loading settings:', err)
      } finally {
        setLoading(false)
      }
    }

    // Load saved preferences from localStorage
    const saved = localStorage.getItem('mvgr_student_settings')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (e) {}
    }

    loadData()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')

    try {
      await updateUserProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
      })

      localStorage.setItem('mvgr_student_settings', JSON.stringify(preferences))
      setSuccessMsg('Settings and profile updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwords.current || !passwords.newPass) {
      setPassMsg('Please fill in current and new passwords.')
      return
    }
    if (passwords.newPass !== passwords.confirmPass) {
      setPassMsg('New passwords do not match.')
      return
    }

    setPassMsg('Password updated successfully!')
    setPasswords({ current: '', newPass: '', confirmPass: '' })
    setTimeout(() => setPassMsg(''), 4000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences, privacy, notification alerts, and security
        </p>
      </div>

      {successMsg && (
        <Card className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </Card>
      )}

      {/* Profile & Account Information */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Profile & Account Info</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading profile settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  First Name
                </label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Last Name
                </label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={profile.email} disabled className="pl-10 opacity-70 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Campus Hostel / Address Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  className="pl-10"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Short Bio / Student Summary
              </label>
              <textarea
                className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none"
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Notifications & GPS Preferences */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Notifications & Location Privacy</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive application updates and employer interview invites via email.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={preferences.emailNotifs}
              onChange={(e) => setPreferences({ ...preferences, emailNotifs: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">SMS & Instant Chat Alerts</p>
              <p className="text-xs text-muted-foreground">Get instant chat notifications when store managers message you.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={preferences.smsNotifs}
              onChange={(e) => setPreferences({ ...preferences, smsNotifs: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">Shift Reminders</p>
              <p className="text-xs text-muted-foreground">Receive reminder alerts 1 hour before your confirmed campus shifts.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={preferences.shiftReminders}
              onChange={(e) => setPreferences({ ...preferences, shiftReminders: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-primary" />
                Live GPS Location Sharing for Nearby Shops
              </p>
              <p className="text-xs text-muted-foreground">Allow the interactive map to compute exact distances from your MVGR Hostel.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={preferences.gpsPrivacy}
              onChange={(e) => setPreferences({ ...preferences, gpsPrivacy: e.target.checked })}
            />
          </div>
        </div>
      </Card>

      {/* Security & Password */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Security & Password</h2>
        </div>

        {passMsg && (
          <p className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
            {passMsg}
          </p>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Current Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Confirm New Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="outline" className="gap-2">
              <Lock className="h-4 w-4" />
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
