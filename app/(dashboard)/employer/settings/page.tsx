'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Store,
  Bell,
  Shield,
  Save,
  CheckCircle,
  Loader2,
  Lock,
  Smartphone,
  MapPin,
  Mail,
  Building,
} from 'lucide-react'

export default function EmployerSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [business, setBusiness] = useState({
    storeName: 'MVGR Tech & Campus Stores',
    ownerName: 'Rajesh Varma',
    email: 'employer.mvgr@college.edu',
    phone: '+91 91234 56789',
    address: 'Main Gate Shopping Arcade, MVGR Campus, Vizianagaram',
    latitude: '18.0601',
    longitude: '83.4005',
    category: 'Retail & Campus Supplies',
  })

  const [preferences, setPreferences] = useState({
    newApplicantAlerts: true,
    instantChatNotifs: true,
    autoConfirmShifts: false,
    publicMapVisibility: true,
  })

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  })
  const [passMsg, setPassMsg] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('mvgr_employer_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.business) setBusiness(parsed.business)
        if (parsed.preferences) setPreferences(parsed.preferences)
      } catch (e) {}
    }
  }, [])

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')

    setTimeout(() => {
      localStorage.setItem(
        'mvgr_employer_settings',
        JSON.stringify({ business, preferences })
      )
      setSaving(false)
      setSuccessMsg('Employer shop settings and map location updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    }, 600)
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

    setPassMsg('Employer password updated successfully!')
    setPasswords({ current: '', newPass: '', confirmPass: '' })
    setTimeout(() => setPassMsg(''), 4000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Employer & Shop Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your registered business profile, map store coordinates, and hiring alerts
        </p>
      </div>

      {successMsg && (
        <Card className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </Card>
      )}

      {/* Business & Store Profile */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Business & Shop Registration Info</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Store / Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={business.storeName}
                  onChange={(e) => setBusiness({ ...business, storeName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Owner / Manager Name
              </label>
              <Input
                value={business.ownerName}
                onChange={(e) => setBusiness({ ...business, ownerName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={business.email} disabled className="pl-10 opacity-70 cursor-not-allowed" />
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
                  value={business.phone}
                  onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Registered Shop Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                className="pl-10"
                value={business.address}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Map Coordinates Registration */}
          <div className="p-4 bg-muted/40 rounded-xl border border-border/50 space-y-3">
            <span className="text-xs font-bold text-foreground block">
              Default Map Pin Coordinates (MVGR Campus Area)
            </span>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-muted-foreground block">Latitude</label>
                <Input
                  value={business.latitude}
                  onChange={(e) => setBusiness({ ...business, latitude: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block">Longitude</label>
                <Input
                  value={business.longitude}
                  onChange={(e) => setBusiness({ ...business, longitude: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Shop Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Hiring & Visibility Preferences */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Hiring Alerts & Map Visibility</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">New Student Applicant Email Alerts</p>
              <p className="text-xs text-muted-foreground">Receive instant notifications when students apply for your posted positions.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={preferences.newApplicantAlerts}
              onChange={(e) => setPreferences({ ...preferences, newApplicantAlerts: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">Instant Student Chat Notifications</p>
              <p className="text-xs text-muted-foreground">Notify when applicants send messages regarding shift availability.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={preferences.instantChatNotifs}
              onChange={(e) => setPreferences({ ...preferences, instantChatNotifs: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">Interactive Campus Map Pin Visibility</p>
              <p className="text-xs text-muted-foreground">Make registered shop location pin visible to students browsing nearby hostel jobs.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={preferences.publicMapVisibility}
              onChange={(e) => setPreferences({ ...preferences, publicMapVisibility: e.target.checked })}
            />
          </div>
        </div>
      </Card>

      {/* Security */}
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
              Update Employer Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
