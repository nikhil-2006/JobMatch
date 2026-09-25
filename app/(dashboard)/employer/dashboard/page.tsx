'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BarChart3,
  Users,
  BriefcaseIcon,
  Plus,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  Store,
  CheckCircle,
  ShieldCheck,
  Award,
  FileText,
  Clock,
} from 'lucide-react'
import {
  getEmployerDashboardData,
  createJob,
  updateApplicationStatus,
  getEmployerProfileStatus,
} from '@/app/actions/employer'
import EmployerCertificateModal from '@/components/employer-certificate-modal'
import EmployerRegistrationModal from '@/components/employer-registration-modal'

export default function EmployerDashboardPage() {
  const [data, setData] = useState<{
    jobs: any[]
    applicants: any[]
    stats: { activeJobs: number; totalApplicants: number; hired: number; pendingReview: number }
  }>({
    jobs: [],
    applicants: [],
    stats: { activeJobs: 0, totalApplicants: 0, hired: 0, pendingReview: 0 },
  })

  const [loading, setLoading] = useState(true)
  const [showJobModal, setShowJobModal] = useState(false)
  const [showRegModal, setShowRegModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [profileStatus, setProfileStatus] = useState<any>({ isVerified: false, hasProfile: false })
  const [creating, setCreating] = useState(false)
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null)

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: 'MVGR Campus Main Arcade, Vizianagaram',
    hourlyRate: '16.50',
    jobType: 'part-time',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getEmployerDashboardData()
      setData(res)
      const status = await getEmployerProfileStatus()
      setProfileStatus(status)
    } catch (err) {
      console.error('Error fetching employer dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJob.title || !newJob.description) return

    setCreating(true)
    try {
      const res = await createJob(newJob)
      if (res.success) {
        setShowJobModal(false)
        setNewJob({
          title: '',
          description: '',
          location: 'MVGR Campus Main Arcade, Vizianagaram',
          hourlyRate: '16.50',
          jobType: 'part-time',
        })
        await fetchData()
      }
    } catch (err) {
      console.error('Error posting job:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateAppStatus = async (appId: string, status: 'accepted' | 'rejected') => {
    setUpdatingAppId(appId)
    try {
      await updateApplicationStatus(appId, status)
      await fetchData()
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdatingAppId(null)
    }
  }

  const stats = [
    { label: 'Active Posted Jobs', value: data.stats.activeJobs, icon: BriefcaseIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Applicants', value: data.stats.totalApplicants, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Pending Candidate Reviews', value: data.stats.pendingReview, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Hired Student Matches', value: data.stats.hired, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ]

  const pendingApps = data.applicants.filter((a) => a.status === 'pending')

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employer Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time store management, job postings, and student applicants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button size="sm" onClick={() => setShowJobModal(true)} className="gap-2 text-xs">
            <Plus className="h-4 w-4" />
            Post Campus Job
          </Button>
        </div>
      </div>

      {/* Verification Status & Certificate Banner */}
      {profileStatus.isVerified ? (
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-600 rounded-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-foreground">Verified MVGR Campus Recruiter & Shop Partner</p>
                <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase">Live on Map</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your shop is live on student campus maps and your job postings are visible to all students.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setShowCertificateModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-md"
            >
              <Award className="h-4 w-4" /> View Verification Certificate
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-600 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-foreground">Employer Join Request: Pending Admin Approval</p>
                <Badge className="bg-amber-500/20 text-amber-600 border border-amber-500/40 text-[10px] font-bold">
                  Under Review
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your registration request has been sent to MVGR Admin. Once accepted, your shop location will pop up on student maps &amp; your certificate will unlock!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setShowRegModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5"
            >
              <Store className="h-4 w-4" /> Register / Edit Shop Details
            </Button>
          </div>
        </Card>
      )}

      {/* Post Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <Card className="relative w-full max-w-md p-6 bg-card text-card-foreground border border-border space-y-4 shadow-2xl z-[10000]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Register New Shop Job
              </h2>
              <button onClick={() => setShowJobModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Job Title</label>
                <Input
                  placeholder="e.g. MVGR Campus Canteen Assistant"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Shop Address / Campus Location</label>
                <Input
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Hourly Pay ($)</label>
                  <Input
                    type="number"
                    step="0.50"
                    value={newJob.hourlyRate}
                    onChange={(e) => setNewJob({ ...newJob, hourlyRate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Shift Type</label>
                  <select
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-medium"
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                  >
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Job Description</label>
                <textarea
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none"
                  rows={3}
                  placeholder="Duties, timings, and expectations..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowJobModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish Post
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6 border border-border/50 bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</span>
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

      {/* Action Notification Alert */}
      {pendingApps.length > 0 && (
        <Card className="p-4 border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 text-amber-600 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Action Required: {pendingApps.length} New Candidate Applications</p>
              <p className="text-xs opacity-90">Review student cover letters and confirm shift availability.</p>
            </div>
          </div>
          <Link href="/employer/applicants">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              Review Applications
            </Button>
          </Link>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Student Applicants */}
        <Card className="lg:col-span-2 p-6 border border-border/50 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Live Student Applications
            </h2>
            <Link href="/employer/applicants" className="text-xs font-semibold text-primary hover:underline">
              View All ({data.applicants.length})
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Fetching applications from database...</span>
            </div>
          ) : data.applicants.length > 0 ? (
            <div className="space-y-3">
              {data.applicants.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border/50 bg-muted/20 gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground text-sm">{app.studentName}</p>
                      <Badge
                        className={`capitalize text-xs ${
                          app.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                            : app.status === 'accepted'
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{app.jobTitle}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          disabled={updatingAppId === app.id}
                          onClick={() => handleUpdateAppStatus(app.id, 'accepted')}
                        >
                          <CheckCircle className="h-3 w-3" /> Hire
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          disabled={updatingAppId === app.id}
                          onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6">No applications received in database yet.</p>
          )}
        </Card>

        {/* Quick Action Tools */}
        <Card className="p-6 border border-border/50 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Shop Quick Actions</h2>

          <div className="space-y-3">
            <Button onClick={() => setShowJobModal(true)} className="w-full gap-2 text-xs">
              <Plus className="h-4 w-4" />
              Post New Campus Position
            </Button>

            <Link href="/employer/applicants" className="block">
              <Button variant="outline" className="w-full justify-between text-xs">
                <span>Manage All Applicants</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <Link href="/employer/jobs" className="block">
              <Button variant="outline" className="w-full justify-between text-xs">
                <span>Manage Posted Jobs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <Link href="/employer/messages" className="block">
              <Button variant="outline" className="w-full justify-between text-xs">
                <span>Student Chat Messaging</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Employer Active Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <h2 className="text-lg font-bold text-foreground">Your Posted Campus Jobs</h2>
          <Link href="/employer/jobs" className="text-xs font-semibold text-primary hover:underline">
            View All ({data.jobs.length})
          </Link>
        </div>

        {data.jobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {data.jobs.slice(0, 3).map((job) => (
              <Card key={job.id} className="p-4 border border-border/50 space-y-3 bg-card/60">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground text-sm">{job.title}</h3>
                    <span className="text-xs font-bold text-emerald-600">${job.hourlyRate}/hr</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{job.location}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2">
                  <span>{job.applicantCount || 0} applicants</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
                    {job.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground border border-border/50">
            No jobs posted yet. Click &quot;Post Campus Job&quot; to publish your first position.
          </Card>
        )}
      </div>

      {/* Certificate and Registration Modals */}
      <EmployerCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        employerData={profileStatus}
      />
      <EmployerRegistrationModal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  )
}
