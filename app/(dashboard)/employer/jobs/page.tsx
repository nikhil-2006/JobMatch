'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Trash2,
  Users,
  Plus,
  Loader2,
  X,
  MapPin,
  Store,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { getEmployerJobs, createJob, deleteJob, updateJobStatus } from '@/app/actions/employer'
import JobPreviewModal, { JobDetails } from '@/components/job-preview-modal'

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [selectedInspectJob, setSelectedInspectJob] = useState<JobDetails | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'MVGR Main Gate Arcade, Vizianagaram',
    latitude: '18.0601',
    longitude: '83.4005',
    hourlyRate: '18.00',
    jobType: 'part-time',
  })

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const data = await getEmployerJobs()
      setJobs(data || [])
    } catch (err) {
      console.error('Error loading employer jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.location) {
      alert('Please fill out all required shop & job fields.')
      return
    }

    setCreating(true)
    try {
      const res = await createJob({
        ...formData,
        skills: ['Customer Service', 'Cashier', 'Inventory'],
      })
      if (res.success) {
        setShowCreateModal(false)
        setFormData({
          title: '',
          description: '',
          location: 'MVGR Main Gate Arcade, Vizianagaram',
          latitude: '18.0601',
          longitude: '83.4005',
          hourlyRate: '18.00',
          jobType: 'part-time',
        })
        await fetchJobs()
      } else {
        alert('Failed to register shop job.')
      }
    } catch (err) {
      console.error('Error posting job:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'closed' : 'active'
    setActionId(jobId)
    try {
      const res = await updateJobStatus(jobId, nextStatus)
      if (res.success) {
        await fetchJobs()
      }
    } catch (err) {
      console.error('Error toggling job status:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this registered shop job?')) return
    setActionId(jobId)
    try {
      const res = await deleteJob(jobId)
      if (res.success) {
        await fetchJobs()
      }
    } catch (err) {
      console.error('Error deleting job:', err)
    } finally {
      setActionId(null)
    }
  }

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registered Shops & Job Postings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your store map locations, active job vacancies, and view student applicant responses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2 text-xs">
            <Plus className="h-4 w-4" />
            Register Shop & Job
          </Button>
        </div>
      </div>

      {/* Create Job / Register Shop Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <Card className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 bg-card text-card-foreground border border-border space-y-4 shadow-2xl z-[10000]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Register Shop Location & Job</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Position / Job Title</label>
                <Input
                  placeholder="e.g. MVGR Canteen & Store Associate"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Shop / Business Address</label>
                <Input
                  placeholder="e.g. Near MVGR Hostel Road, Vizianagaram"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              {/* Coordinates for Map Registration */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 space-y-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Campus Map Coordinates Pin (MVGR Hostel Area)
                </p>
                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Latitude</label>
                    <Input
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Longitude</label>
                    <Input
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Hourly Pay (₹)</label>
                  <Input
                    type="number"
                    step="0.50"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Job Type</label>
                  <select
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-medium"
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  >
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Description & Duties</label>
                <textarea
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none"
                  rows={3}
                  placeholder="Job duties, working hours, skill expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="gap-2">
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Register Shop & Publish
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Active Map Listings</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {jobs.filter((j) => j.status === 'active').length}
          </p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Total Applicants Received</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0)}
          </p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Estimated Student Map Views</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {jobs.reduce((sum, j) => sum + (j.applicantCount || 0) * 14 + 18, 0)}
          </p>
        </Card>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your posted jobs by title, address, or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
          {['all', 'active', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs / Shops List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading database shop postings...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((job) => (
            <Card
              key={job.id}
              className="p-6 border border-border/50 hover:border-primary/50 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                    <Badge
                      className={`capitalize text-xs ${
                        job.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {job.status === 'active' ? 'Active on Map' : 'Closed'}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {job.location} • <span className="capitalize">{job.jobType || 'part-time'}</span>
                  </p>

                  <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="font-semibold text-emerald-600 flex items-center gap-0.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      ₹{job.hourlyRate}/hr
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {job.applicantCount || 0} applicants
                    </span>
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() =>
                      setSelectedInspectJob({
                        id: job.id,
                        title: job.title,
                        company: 'Your Registered Shop',
                        location: job.location,
                        hourlyRate: job.hourlyRate,
                        jobType: job.jobType || 'part-time',
                        description: job.description,
                        applicants: job.applicantCount || 0,
                      })
                    }
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspect
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    disabled={actionId === job.id}
                    onClick={() => handleToggleJobStatus(job.id, job.status)}
                  >
                    {job.status === 'active' ? (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-amber-600" /> Close Position
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Reopen Position
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                    disabled={actionId === job.id}
                    onClick={() => handleDeleteJob(job.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 border border-border/50 text-center space-y-4">
          <p className="text-muted-foreground">No registered shop postings found in database matching query.</p>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Register Your First Shop Job
          </Button>
        </Card>
      )}

      {/* Inspect Job Modal */}
      {selectedInspectJob && (
        <JobPreviewModal
          job={selectedInspectJob}
          onClose={() => setSelectedInspectJob(null)}
          onApplied={() => fetchJobs()}
        />
      )}
    </div>
  )
}
