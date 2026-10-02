'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, DollarSign, Briefcase, Star } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className="p-6 border border-border/50 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer group rounded-2xl bg-card/70 backdrop-blur-md">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{company}</p>
            </div>
            {rating && (
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{rating}</span>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0 transition-transform group-hover:scale-110" />
              <span className="truncate">{location}</span>
              {distance && <span className="text-xs bg-muted/80 px-2 py-0.5 rounded font-mono shrink-0">({distance})</span>}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {hourlyRate.startsWith('₹') || hourlyRate.startsWith('$') ? hourlyRate : `₹${hourlyRate}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 text-primary shrink-0" />
              <span className="capitalize">{jobType}</span>
            </div>
          </div>

          {/* Description Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>

          {/* Skills */}
          <div className="flex gap-1.5 flex-wrap">
            {safeSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium border border-primary/20"
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
            <div className="text-xs text-muted-foreground font-medium">
              {applicants !== undefined && <span>{applicants} candidate applications</span>}
            </div>
            <Button
              size="sm"
              disabled={isApplied}
              onClick={(e) => {
                e.stopPropagation()
                onApply?.()
              }}
              variant={isApplied ? 'outline' : 'default'}
              className="font-bold"
            >
              {isApplied ? 'Applied' : 'Apply Now'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
