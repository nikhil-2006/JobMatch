'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Search,
  Loader2,
  RefreshCw,
  Eye,
  X,
  UserCheck,
  Building,
  Mail,
  Calendar,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getEmployerApplicants, updateApplicationStatus } from '@/app/actions/employer'
import { startConversation } from '@/app/actions/messaging'

export default function EmployerApplicantsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [applicants, setApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null)

  const handleStartChat = async (studentId: string) => {
    if (!studentId) return
    try {
      await startConversation(studentId)
      router.push('/employer/messages')
    } catch (err) {
      console.error('Error starting chat:', err)
      router.push('/employer/messages')
    }
  }

  const fetchApplicants = async () => {
    setLoading(true)
    try {
      const data = await getEmployerApplicants()
      setApplicants(data || [])
    } catch (err) {
      console.error('Error fetching applicants:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplicants()
  }, [])

  const handleStatusChange = async (appId: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    setActionId(appId)
    try {
      const res = await updateApplicationStatus(appId, status)
      if (res.success) {
        await fetchApplicants()
        if (selectedApplicant && selectedApplicant.id === appId) {
          setSelectedApplicant((prev: any) => ({ ...prev, status }))
        }
      } else {
        alert('Failed to update application status.')
      }
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setActionId(null)
    }
  }

  const filtered = applicants.filter((app) => {
    const matchesSearch =
      (app.studentName && app.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.jobTitle && app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">Accepted / Hired</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/15 text-red-600 border border-red-500/30">Declined</Badge>
      case 'reviewed':
        return <Badge className="bg-blue-500/15 text-blue-600 border border-blue-500/30">Under Review</Badge>
      default:
        return <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30">Pending Review</Badge>
    }
  }

  const stats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === 'pending').length,
    accepted: applicants.filter((a) => a.status === 'accepted').length,
    rejected: applicants.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Applicants</h1>
          <p className="text-muted-foreground mt-1">
            Review student cover letters, inspect profile details, and respond to applications
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchApplicants} className="gap-2 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Applicants
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Total Received</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? '...' : stats.total}</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Pending Action</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{loading ? '...' : stats.pending}</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Hired Candidates</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{loading ? '...' : stats.accepted}</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-card/60">
          <p className="text-xs font-semibold text-muted-foreground">Declined</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{loading ? '...' : stats.rejected}</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search applicants by student name or job title..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
          {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map((status) => (
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

      {/* Applicants List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Fetching database candidate records...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((applicant) => (
            <Card
              key={applicant.id}
              className="p-6 border border-border/50 hover:border-primary/50 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                      {applicant.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{applicant.studentName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Applied for: <span className="font-semibold text-foreground">{applicant.jobTitle}</span>
                      </p>
                    </div>
                    {getStatusBadge(applicant.status)}
                  </div>

                  {applicant.coverLetter && (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/40 text-xs text-foreground leading-relaxed mt-2">
                      <span className="font-semibold text-muted-foreground block mb-0.5">Cover Note / Shift Availability:</span>
                      &quot;{applicant.coverLetter}&quot;
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Applied {new Date(applicant.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => setSelectedApplicant(applicant)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Review Application
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => handleStartChat(applicant.studentId)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-primary" /> Chat Student
                  </Button>

                  {applicant.status !== 'accepted' && (
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={actionId === applicant.id}
                      onClick={() => handleStatusChange(applicant.id, 'accepted')}
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Hire
                    </Button>
                  )}

                  {applicant.status !== 'rejected' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                      disabled={actionId === applicant.id}
                      onClick={() => handleStatusChange(applicant.id, 'rejected')}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Decline
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 border border-border/50 text-center text-muted-foreground">
          No student applicants match your criteria.
        </Card>
      )}

      {/* Candidate Review Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <Card className="relative w-full max-w-lg p-6 bg-card text-card-foreground border border-border space-y-5 shadow-2xl z-[10000]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Candidate Application Details</h2>
              </div>
              <button onClick={() => setSelectedApplicant(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Applicant Name</p>
                <p className="text-base font-bold text-foreground">{selectedApplicant.studentName}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Target Position</p>
                <p className="font-semibold text-primary">{selectedApplicant.jobTitle}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Cover Note & Availability</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedApplicant.coverLetter || 'No additional note provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">Application Status</span>
                {getStatusBadge(selectedApplicant.status)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end pt-3 border-t border-border/50">
              <Button size="sm" variant="outline" onClick={() => setSelectedApplicant(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => handleStartChat(selectedApplicant.studentId)}
              >
                <MessageSquare className="h-4 w-4 text-primary" /> Direct Chat
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => handleStatusChange(selectedApplicant.id, 'accepted')}
              >
                <CheckCircle className="h-4 w-4" /> Accept Candidate
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
