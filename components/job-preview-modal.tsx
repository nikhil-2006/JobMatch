'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Users, Briefcase, X, Send, CheckCircle, Loader2 } from 'lucide-react'
import { applyToJob } from '@/app/actions/jobs'

export interface JobDetails {
  id: string
  title: string
  company: string
  location: string
  hourlyRate: string
  jobType: string
  skills?: string[]
  description: string
  distance?: string
  applicants?: number
}

interface JobPreviewModalProps {
  job: JobDetails | null
  onClose: () => void
  onApplied?: () => void
}

export default function JobPreviewModal({ job, onClose, onApplied }: JobPreviewModalProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [applied, setApplied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!job) return null

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await applyToJob(job.id, coverLetter)
      if (res.success) {
        setApplied(true)
        if (onApplied) onApplied()
      } else {
        setErrorMsg(res.message || 'Failed to submit application.')
      }
    } catch (err) {
      setErrorMsg('Application error or already submitted.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-card text-card-foreground border border-border space-y-6 shadow-2xl z-[10000]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Job & Shop Application Preview
            </span>
            <h2 className="text-2xl font-bold text-foreground mt-1">{job.title}</h2>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Highlights */}
        <div className="grid gap-4 md:grid-cols-4 bg-muted/40 p-4 rounded-xl border border-border/50">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Location</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{job.location}</span>
            </p>
            {job.distance && (
              <span className="text-xs text-primary font-bold block mt-0.5">({job.distance} away)</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Hourly Pay</p>
            <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              <DollarSign className="h-4 w-4 shrink-0" />
              {job.hourlyRate.startsWith('₹') ? job.hourlyRate : `₹${job.hourlyRate}/hr`}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Job Type</p>
            <p className="text-sm font-semibold text-foreground capitalize flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
              {job.jobType}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Applicants</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
              <Users className="h-4 w-4 text-purple-500 shrink-0" />
              {job.applicants || 0} applied
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">About the Opportunity</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="py-1 px-3 text-xs font-medium">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Application Form */}
        <div className="border-t border-border/60 pt-4 space-y-4">
          <h3 className="text-lg font-bold text-foreground">Apply for this Position</h3>

          {applied ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-semibold">Application Submitted!</p>
                <p className="text-xs opacity-90">
                  The employer has received your profile and note.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              {errorMsg && (
                <p className="text-xs text-red-500 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  {errorMsg}
                </p>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Note / Cover Letter to Employer (Optional)
                </label>
                <textarea
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                  rows={3}
                  placeholder="Introduce yourself, your availability, and relevant experience..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}
