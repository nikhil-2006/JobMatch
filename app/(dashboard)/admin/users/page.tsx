'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RefreshCw,
  UserCheck,
  UserPlus,
  Trash2,
  X,
} from 'lucide-react'
import { getAllUsersAdmin, toggleVerifyUserAdmin, createUserAdmin, deleteUserAdmin } from '@/app/actions/admin'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'employer' | 'admin',
    phone: '',
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getAllUsersAdmin()
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching admin users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleVerification = async (profileId: string, currentVerified: boolean) => {
    setTogglingId(profileId)
    try {
      const res = await toggleVerifyUserAdmin(profileId, currentVerified)
      if (res.success) {
        await fetchUsers()
      }
    } catch (err) {
      console.error('Error toggling verification:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.firstName || !newUser.lastName) {
      alert('Please fill out first and last names.')
      return
    }

    setCreating(true)
    try {
      const res = await createUserAdmin(newUser)
      if (res.success) {
        setShowAddModal(false)
        setNewUser({ firstName: '', lastName: '', role: 'student', phone: '' })
        await fetchUsers()
      }
    } catch (err) {
      console.error('Error creating user:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return
    try {
      const res = await deleteUserAdmin(profileId)
      if (res.success) {
        await fetchUsers()
      }
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  const filtered = users.filter((u) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || (u.userId && u.userId.includes(searchQuery))
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500/15 text-purple-600 border border-purple-500/30">Admin</Badge>
      case 'employer':
        return <Badge className="bg-blue-500/15 text-blue-600 border border-blue-500/30">Employer</Badge>
      default:
        return <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">Student</Badge>
    }
  }

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === 'student').length,
    employers: users.filter((u) => u.role === 'employer').length,
    verified: users.filter((u) => u.isVerified).length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage, verify, create, and inspect all platform user accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2 text-xs">
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <Card className="relative w-full max-w-md p-6 bg-card text-card-foreground border border-border space-y-4 shadow-2xl z-[10000]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Register New User
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">First Name</label>
                  <Input
                    placeholder="Rahul"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Last Name</label>
                  <Input
                    placeholder="Sharma"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Role</label>
                <select
                  className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-medium"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                >
                  <option value="student">Student</option>
                  <option value="employer">Employer / Shop Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Pending Employer Join Requests Banner */}
      {users.filter((u) => u.role === 'employer' && !u.isVerified).length > 0 && (
        <Card className="p-5 border border-amber-500/40 bg-amber-500/10 space-y-3 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h2 className="font-bold text-sm text-foreground">
                Action Required: {users.filter((u) => u.role === 'employer' && !u.isVerified).length} Employer Join Request(s) Pending Admin Verification
              </h2>
            </div>
            <Badge className="bg-amber-500 text-black font-extrabold text-[10px] uppercase">
              Map &amp; Certificate Unlock Required
            </Badge>
          </div>

          <div className="space-y-2">
            {users
              .filter((u) => u.role === 'employer' && !u.isVerified)
              .map((emp) => (
                <div
                  key={emp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-background/80 border border-amber-500/30 gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-foreground">
                      {emp.companyName || `${emp.firstName || 'Employer'} Shop`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contact: <span className="font-semibold text-foreground">{[emp.firstName, emp.lastName].filter(Boolean).join(' ')}</span> ({emp.phone || '+91 98765 43210'})
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Location: {emp.companyAddress || 'MVGR Campus Main Arcade'}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shrink-0"
                    disabled={togglingId === emp.id}
                    onClick={() => handleToggleVerification(emp.id, false)}
                  >
                    {togglingId === emp.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                    Approve &amp; Issue Certificate
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? '...' : stats.total}</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Students</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{loading ? '...' : stats.students}</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Employers / Shops</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{loading ? '...' : stats.employers}</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Verified Accounts</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{loading ? '...' : stats.verified}</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name, user ID, or phone number..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
          {['all', 'student', 'employer', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                roleFilter === role
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading user database records...</span>
        </div>
      ) : filtered.length > 0 ? (
        <Card className="border border-border/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/40 text-xs font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3.5 text-left">User Name</th>
                  <th className="px-6 py-3.5 text-left">User ID</th>
                  <th className="px-6 py-3.5 text-left">Role</th>
                  <th className="px-6 py-3.5 text-left">Phone</th>
                  <th className="px-6 py-3.5 text-left">Verification</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-foreground">
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'User Profile'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{user.userId}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{user.phone || '+91 98765 43210'}</td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <ShieldAlert className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant={user.isVerified ? 'outline' : 'default'}
                        className="gap-1.5 text-xs"
                        disabled={togglingId === user.id}
                        onClick={() => handleToggleVerification(user.id, !!user.isVerified)}
                      >
                        {togglingId === user.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5" />
                        )}
                        {user.isVerified ? 'Unverify' : 'Verify'}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 text-xs px-2"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 border border-border/50 text-center text-muted-foreground">
          No users found matching query.
        </Card>
      )}
    </div>
  )
}
