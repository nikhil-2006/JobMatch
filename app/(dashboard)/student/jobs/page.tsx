'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Loader2, Navigation, MapPin } from 'lucide-react'
import JobCard from '@/components/job-card'
import NearbyJobsMap from '@/components/maps/nearby-jobs-map'
import JobPreviewModal, { JobDetails } from '@/components/job-preview-modal'
import { getAvailableJobs } from '@/app/actions/jobs'
import { calculateDistance } from '@/lib/utils'

export default function StudentJobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null)
  const [maxDistance, setMaxDistance] = useState('50')
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPreviewJob, setSelectedPreviewJob] = useState<JobDetails | null>(null)

  // MVGR College of Engineering Hostel coordinates default
  const [studentLocation, setStudentLocation] = useState<{ lat: number; lng: number }>({
    lat: 18.0601,
    lng: 83.4005,
  })
  const [geoEnabled, setGeoEnabled] = useState(false)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const data = await getAvailableJobs()
      setJobs(data || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStudentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGeoEnabled(true)
        },
        () => {
          // Default to MVGR Hostel
        }
      )
    }
  }, [])

  const processedJobs = jobs.map((j) => {
    const jobLat = parseFloat(j.latitude) || 18.0601
    const jobLng = parseFloat(j.longitude) || 83.4005
    const distStr = calculateDistance(studentLocation.lat, studentLocation.lng, jobLat, jobLng)
    
    // Parse distanceKm in kilometers (handle "m" vs "km")
    let distKm = 0.1
    if (distStr.includes('m') && !distStr.includes('km')) {
      const meters = parseFloat(distStr.replace(/[^\d.]/g, '')) || 100
      distKm = meters / 1000
    } else {
      distKm = parseFloat(distStr.replace(/[^\d.]/g, '')) || 0.1
    }

    return {
      ...j,
      lat: jobLat,
      lng: jobLng,
      distanceStr: distStr,
      distanceKm: distKm,
    }
  })

  const filteredJobs = processedJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.skills && job.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())))
    const matchesType = !selectedJobType || job.jobType === selectedJobType
    const matchesDistance = job.distanceKm <= parseFloat(maxDistance)

    return matchesSearch && matchesType && matchesDistance
  })

  const mapLocations = filteredJobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company || j.location || 'MVGR Store Partner',
    lat: j.lat,
    lng: j.lng,
    hourlyRate: `₹${j.hourlyRate}/hr`,
    distance: j.distanceStr,
    description: j.description,
    jobType: j.jobType,
    skills: j.skills,
    applicants: j.applicantCount,
  }))

  const openPreview = (job: any) => {
    setSelectedPreviewJob({
      id: job.id,
      title: job.title,
      company: job.company || 'Employer Partner',
      location: job.location,
      hourlyRate: job.hourlyRate,
      jobType: job.jobType || 'part-time',
      skills: job.skills || [],
      description: job.description,
      distance: job.distanceStr,
      applicants: job.applicantCount || 0,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Jobs & MVGR Campus Shops</h1>
          <p className="text-muted-foreground mt-1">
            {filteredJobs.length} active opportunities registered near MVGR Hostel
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
          <Navigation className="h-4 w-4 text-primary" />
          <span>
            {geoEnabled ? 'Using GPS location' : 'MVGR Campus Location (18.060, 83.400)'}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campus canteen, library, stationery, programming jobs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter Options
        </Button>
      </div>

      {/* Map & Distance Control Grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="p-1 border border-border/50 h-[380px]">
            <NearbyJobsMap
              jobs={mapLocations}
              userLat={studentLocation.lat}
              userLng={studentLocation.lng}
              onSelectJob={(mapJob) => {
                const fullJob = jobs.find((j) => j.id === mapJob.id) || mapJob
                openPreview(fullJob)
              }}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 border border-border/50 space-y-3">
            <h3 className="font-semibold text-foreground">Max Proximity Radius</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-primary w-12">{maxDistance} km</span>
              </div>
              <p className="text-xs text-muted-foreground">Showing shops within {maxDistance} km of MVGR Hostel.</p>
            </div>
          </Card>

          <Card className="p-4 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3">Job Type</h3>
            <div className="space-y-2">
              {['part-time', 'full-time', 'contract'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedJobType(selectedJobType === type ? null : type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedJobType === type
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Positions near MVGR Hostel</h2>
        {loading ? (
          <div className="flex items-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Fetching registered shops and vacancies...</span>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div key={job.id} onClick={() => openPreview(job)}>
                <JobCard
                  id={job.id}
                  title={job.title}
                  company={job.company || 'Employer Partner'}
                  location={job.location}
                  distance={job.distanceStr}
                  hourlyRate={`₹${job.hourlyRate}/hr`}
                  jobType={job.jobType || 'part-time'}
                  skills={job.skills || []}
                  description={job.description}
                  applicants={job.applicantCount || 0}
                  onApply={() => openPreview(job)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center text-muted-foreground border border-border/50">
            No registered shops or active jobs found matching your criteria.
          </Card>
        )}
      </div>

      {/* Application Preview Modal */}
      {selectedPreviewJob && (
        <JobPreviewModal
          job={selectedPreviewJob}
          onClose={() => setSelectedPreviewJob(null)}
          onApplied={() => {
            fetchJobs()
          }}
        />
      )}
    </div>
  )
}
