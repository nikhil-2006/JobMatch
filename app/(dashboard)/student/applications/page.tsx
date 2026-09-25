'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Calendar,
  Loader2,
  Search,
  MapPin,
  DollarSign,
  FileText,
  X,
  Send,
  Building2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { getMyApplications, withdrawApplication } from '@/app/actions/jobs'

interface Application {
  id: string
  jobTitle: string
  company: string
  appliedDate: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn'
  salary: string
  location: string
  coverLetter?: string
}

export default function StudentApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const fetchApps = async () => {
    setLoading(true)
    try {
      const data = await getMyApplications()
      setApplications(data || [])
    } catch (err) {
      console.error('Error fetching student applications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this job application?')) return
    setWithdrawingId(appId)
    try {
      const res = await withdrawApplication(appId)
      if (res.success) {
        if (selectedApp?.id === appId) setSelectedApp(null)
        await fetchApps()
      }
    } catch (err) {
      console.error('Withdraw error:', err)
    } finally {
      setWithdrawingId(null)
    }
  }

  const filtered = applications.filter((app) => {
    const matchesFilter = activeFilter === 'all' || app.status === activeFilter
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = [
    { label: 'Total Submitted', value: applications.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Under Review', value: applications.filter((a) => a.status === 'pending' || a.status === 'reviewed').length, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Accepted Offers', value: applications.filter((a) => a.status === 'accepted').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Withdrawn / Closed', value: applications.filter((a) => a.status === 'rejected' || a.status === 'withdrawn').length, color: 'text-red-500', bg: 'bg-red-500/10' },
  ]

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case 'rejected':
      case 'withdrawn':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'reviewed':
        return <Clock className="h-5 w-5 text-amber-500" />
      default:
        return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">Accepted</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/15 text-red-600 border border-red-500/30">Not Selected</Badge>
      case 'withdrawn':
        return <Badge className="bg-muted text-muted-foreground border border-border">Withdrawn</Badge>
      case 'reviewed':
        return <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30">Under Review</Badge>
      default:
        return <Badge className="bg-blue-500/15 text-blue-600 border border-blue-500/30">Submitted</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track, inspect, and manage your campus job & shop applications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchApps} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/student/jobs">
            <Button size="sm" className="gap-2">
              Browse More Jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 border border-border/50 bg-card/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{stat.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stat.bg} ${stat.color}`}>
                Live
              </span>
            </div>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{loading ? '...' : stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search submitted applications by job title, store name, or location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 overflow-x-auto">
          {(['all', 'pending', 'reviewed', 'accepted', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="font-medium">Loading your job applications...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((app) => (
            <Card
              key={app.id}
              className="p-6 border border-border/50 hover:border-primary/50 transition-all space-y-4 hover:shadow-md cursor-pointer"
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted/50 rounded-xl border border-border/50 shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground">{app.jobTitle}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{app.company}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        {app.location}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        {app.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        Applied {app.appliedDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedApp(app)
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Inspect Application
                  </Button>

                  {app.status !== 'rejected' && app.status !== 'withdrawn' && (
                    <div className="flex items-center gap-2">
                      <Link href="/student/messages" onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-primary">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Chat
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={withdrawingId === app.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWithdraw(app.id)
                        }}
                      >
                        {withdrawingId === app.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Withdraw'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 border border-border/50 text-center space-y-4">
          <p className="text-muted-foreground">
            No applications match your query. Browse available campus jobs to apply!
          </p>
          <Link href="/student/jobs">
            <Button className="gap-2">
              Browse Available Jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Interactive Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <Card className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-card text-card-foreground border border-border space-y-6 shadow-2xl z-[10000]">
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Application Details & Status
                </span>
                <h2 className="text-xl font-bold text-foreground mt-1">{selectedApp.jobTitle}</h2>
                <p className="text-sm text-muted-foreground">{selectedApp.company}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Timeline */}
            <div className="p-4 bg-muted/40 rounded-xl border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Application Process Status</span>
                {getStatusBadge(selectedApp.status)}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 font-semibold">
                  1. Submitted
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${
                  selectedApp.status === 'reviewed' || selectedApp.status === 'accepted'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                    : 'bg-muted/50 border-border text-muted-foreground'
                }`}>
                  2. Under Review
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${
                  selectedApp.status === 'accepted'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    : 'bg-muted/50 border-border text-muted-foreground'
                }`}>
                  3. Decision
                </div>
              </div>
            </div>

            {/* Key Information */}
            <div className="grid gap-4 grid-cols-2 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Location</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  {selectedApp.location}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Pay Rate</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  {selectedApp.salary}
                </span>
              </div>
            </div>

            {/* Cover Letter Note */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Cover Letter / Note to Employer
              </h3>
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-sm text-foreground leading-relaxed">
                {selectedApp.coverLetter || 'No additional note submitted.'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-end pt-2 border-t border-border/60">
              <Button type="button" variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
              <Link href="/student/messages">
                <Button variant="default" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat with Employer
                </Button>
              </Link>
              {selectedApp.status !== 'rejected' && selectedApp.status !== 'withdrawn' && (
                <Button
                  variant="destructive"
                  size="default"
                  disabled={withdrawingId === selectedApp.id}
                  onClick={() => handleWithdraw(selectedApp.id)}
                >
                  Withdraw Application
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
