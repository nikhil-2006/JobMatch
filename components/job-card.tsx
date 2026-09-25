'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Clock, DollarSign, Briefcase, Star } from 'lucide-react'

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  distance?: string
  hourlyRate: string
  jobType: 'part-time' | 'full-time' | 'contract'
  skills: string[]
  description: string
  applicants?: number
  rating?: number
  onApply?: () => void
  isApplied?: boolean
}

export default function JobCard({
  id,
  title,
  company,
  location,
  distance,
  hourlyRate,
  jobType,
  skills,
  description,
  applicants,
  rating,
  onApply,
  isApplied,
}: JobCardProps) {
  let safeSkills: string[] = []
  if (Array.isArray(skills)) {
    safeSkills = skills
  } else if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills)
      if (Array.isArray(parsed)) safeSkills = parsed
    } catch {}
  }

  return (
    <Card className="p-6 border border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{company}</p>
          </div>
          {rating && (
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600">{rating}</span>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {location}
            {distance && <span className="text-xs bg-muted px-2 py-0.5 rounded">({distance})</span>}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">
              {hourlyRate.startsWith('₹') || hourlyRate.startsWith('$') ? hourlyRate : `₹${hourlyRate}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span className="capitalize">{jobType}</span>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        {/* Skills */}
        <div className="flex gap-2 flex-wrap">
          {safeSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
            >
              {skill}
            </span>
          ))}
          {safeSkills.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground font-medium">
              +{safeSkills.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {applicants !== undefined && <span>{applicants} applicants</span>}
          </div>
          <Button
            size="sm"
            disabled={isApplied}
            onClick={() => onApply?.()}
            variant={isApplied ? 'outline' : 'default'}
          >
            {isApplied ? 'Applied' : 'Apply Now'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
