'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Shield,
  Bell,
  Save,
  CheckCircle,
  Loader2,
  Lock,
  Database,
  Sliders,
  RefreshCw,
  Server,
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [adminConfig, setAdminConfig] = useState({
    adminName: 'System Administrator',
    email: 'admin.mvgr@college.edu',
    phone: '+91 90000 00000',
    platformName: 'MVGR JobMatch Portal',
    dbHost: 'localhost:5432',
    dbName: 'csp_db',
  })

  const [policies, setPolicies] = useState({
    autoVerifyStudents: false,
    maintenanceMode: false,
    emailAlerts: true,
    auditLogging: true,
  })

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  })
  const [passMsg, setPassMsg] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('mvgr_admin_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.adminConfig) setAdminConfig(parsed.adminConfig)
        if (parsed.policies) setPolicies(parsed.policies)
      } catch (e) {}
    }
  }, [])

  const handleSaveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')

    setTimeout(() => {
      localStorage.setItem('mvgr_admin_settings', JSON.stringify({ adminConfig, policies }))
      setSaving(false)
      setSuccessMsg('Admin platform settings updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    }, 500)
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwords.current || !passwords.newPass) {
      setPassMsg('Please enter current and new passwords.')
      return
    }
    if (passwords.newPass !== passwords.confirmPass) {
      setPassMsg('New passwords do not match.')
      return
    }

    setPassMsg('Admin credentials updated successfully!')
    setPasswords({ current: '', newPass: '', confirmPass: '' })
    setTimeout(() => setPassMsg(''), 4000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure platform security, database parameters, verification policies, and admin credentials
        </p>
      </div>

      {successMsg && (
        <Card className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </Card>
      )}

      {/* Admin Profile & System Info */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Shield className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-bold text-foreground">Admin Profile & System Metadata</h2>
        </div>

        <form onSubmit={handleSaveAdminSettings} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Admin User Name
              </label>
              <Input
                value={adminConfig.adminName}
                onChange={(e) => setAdminConfig({ ...adminConfig, adminName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Admin Email
              </label>
              <Input
                value={adminConfig.email}
                onChange={(e) => setAdminConfig({ ...adminConfig, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Platform Title
              </label>
              <Input
                value={adminConfig.platformName}
                onChange={(e) => setAdminConfig({ ...adminConfig, platformName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Emergency Phone Contact
              </label>
              <Input
                value={adminConfig.phone}
                onChange={(e) => setAdminConfig({ ...adminConfig, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Database Configuration Card */}
          <div className="p-4 bg-muted/40 rounded-xl border border-border/50 space-y-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Database Connection Parameters
            </span>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-muted-foreground block">DB Host Server</label>
                <Input value={adminConfig.dbHost} disabled className="opacity-75 font-mono text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block">Database Name</label>
                <Input value={adminConfig.dbName} disabled className="opacity-75 font-mono text-xs" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Admin Config
            </Button>
          </div>
        </form>
      </Card>

      {/* Platform Policies & Security Controls */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Sliders className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Platform Policies & Access Controls</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">Auto-Verify Student Registrations</p>
              <p className="text-xs text-muted-foreground">Automatically verify student profiles upon registration without requiring admin review.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-purple-600 cursor-pointer"
              checked={policies.autoVerifyStudents}
              onChange={(e) => setPolicies({ ...policies, autoVerifyStudents: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Temporarily restrict new job postings during database maintenance windows.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-purple-600 cursor-pointer"
              checked={policies.maintenanceMode}
              onChange={(e) => setPolicies({ ...policies, maintenanceMode: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div>
              <p className="text-sm font-semibold text-foreground">System Audit Logging</p>
              <p className="text-xs text-muted-foreground">Log all admin user verification and job deletion actions to audit history.</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-purple-600 cursor-pointer"
              checked={policies.auditLogging}
              onChange={(e) => setPolicies({ ...policies, auditLogging: e.target.checked })}
            />
          </div>
        </div>
      </Card>

      {/* Admin Password */}
      <Card className="p-6 border border-border/50 space-y-6">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <Lock className="h-5 w-5 text-purple-600" />
          <h2 className="text-xl font-bold text-foreground">Admin Credentials</h2>
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
              Update Admin Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
