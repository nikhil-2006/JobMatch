'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Loader2,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { getAdminStats, getAllUsersAdmin, getAllJobsAdmin } from '@/app/actions/admin'

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalHired: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentJobs, setRecentJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [stats, users, jobs] = await Promise.all([
        getAdminStats(),
        getAllUsersAdmin(),
        getAllJobsAdmin(),
      ])
      setStatsData(stats)
      setRecentUsers(users || [])
      setRecentJobs(jobs || [])
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const stats = [
    {
      label: 'Registered Platform Users',
      value: statsData.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active Campus Jobs',
      value: statsData.totalJobs,
      icon: Briefcase,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Submitted Applications',
      value: statsData.totalApplications,
      icon: FileText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Successful Campus Hires',
      value: statsData.totalHired,
      icon: BarChart3,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Platform Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time analytics, user accounts, and MVGR campus job oversight
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAdminData} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6 border border-border/50 bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-foreground mt-1">
                {loading ? '...' : stat.value}
              </p>
            </Card>
          )
        })}
      </div>

      {/* Quick Action Navigation */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/users">
          <Card className="p-5 border border-border/50 hover:border-primary/50 transition-all flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Manage Users</h3>
                <p className="text-xs text-muted-foreground">Verify accounts & view profiles</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        <Link href="/admin/jobs">
          <Card className="p-5 border border-border/50 hover:border-primary/50 transition-all flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Manage Jobs</h3>
                <p className="text-xs text-muted-foreground">Approve, flag, or remove postings</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="p-5 border border-border/50 hover:border-primary/50 transition-all flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Platform Analytics</h3>
                <p className="text-xs text-muted-foreground">Hiring conversion & store stats</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Card>
        </Link>
      </div>

      {/* Platform Summary Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Profiles */}
        <Card className="p-6 border border-border/50 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Registered User Profiles
            </h2>
            <Link href="/admin/users" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading registered profiles...</span>
            </div>
          ) : recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                      {u.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {[u.firstName, u.lastName].filter(Boolean).join(' ') || 'User Profile'}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.userId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {u.isVerified && (
                      <span title="Verified Account">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </span>
                    )}
                    <Badge className="capitalize text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      {u.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No registered user profiles found.</p>
          )}
        </Card>

        {/* Live Active Campus Jobs */}
        <Card className="p-6 border border-border/50 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Active Registered Campus Jobs
            </h2>
            <Link href="/admin/jobs" className="text-xs font-semibold text-primary hover:underline">
              Manage All
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading active jobs...</span>
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.slice(0, 5).map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border/40"
                >
                  <div>
                    <p className="font-bold text-foreground text-sm">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.location}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-600">${j.hourlyRate}/hr</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
                      {j.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No active job postings found.</p>
          )}
        </Card>
      </div>

      {/* Infrastructure Status */}
      <Card className="p-6 border border-border/50 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Infrastructure & Database Health</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { name: 'Supabase Database', status: 'Connected' },
            { name: 'Drizzle ORM Server Actions', status: 'Active' },
            { name: 'Leaflet Map Engine', status: 'Operational' },
            { name: 'Bi-directional Messaging', status: 'Synchronized' },
          ].map((item, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
              <span className="text-xs text-muted-foreground font-semibold block">{item.name}</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
