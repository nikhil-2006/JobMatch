'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BriefcaseIcon, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { getUserProfile } from '@/app/actions/users'
import { getMyApplications } from '@/app/actions/jobs'

export default function StudentDashboard() {
  const [userName, setUserName] = useState('Student')
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, userApps] = await Promise.all([
          getUserProfile(),
          getMyApplications(),
        ])

        if (profile?.firstName) {
          setUserName(profile.firstName)
        }
        setApplications(userApps || [])
      } catch (err) {
        console.error('Error loading student dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const totalApps = applications.length
  const acceptedApps = applications.filter((a) => a.status === 'accepted').length
  const pendingApps = applications.filter((a) => a.status === 'pending' || a.status === 'reviewed').length

  const stats = [
    {
      label: 'Total Applications',
      value: totalApps,
      icon: BriefcaseIcon,
      color: 'text-blue-500',
    },
    {
      label: 'Accepted Offers',
      value: acceptedApps,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      label: 'Pending Review',
      value: pendingApps,
      icon: Clock,
      color: 'text-yellow-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your job search
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6 border border-border/50 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color} opacity-50`} />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-8 border border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Ready to apply?</h2>
            <p className="text-muted-foreground">
              Browse available part-time job opportunities and find your perfect match.
            </p>
            <Link href="/student/jobs">
              <Button>Browse Available Jobs</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-8 border border-border/50 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Manage your schedule</h2>
            <p className="text-muted-foreground">
              Set your availability and let employers know when you can work.
            </p>
            <Link href="/student/schedule">
              <Button variant="outline">Update Availability</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="p-6 border border-border/50">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Applications</h2>
            <Link href="/student/applications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm py-4">Loading applications...</p>
          ) : applications.length > 0 ? (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        app.status === 'accepted'
                          ? 'bg-green-500'
                          : app.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-foreground">{app.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">{app.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium capitalize text-foreground">{app.status}</p>
                    <p className="text-xs text-muted-foreground">{app.appliedDate}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4">
              No recent applications found. Start browsing jobs to apply!
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
