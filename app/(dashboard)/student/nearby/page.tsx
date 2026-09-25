'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Users, AlertCircle, Loader2, Navigation } from 'lucide-react'
import { getAvailableJobs } from '@/app/actions/jobs'
import { calculateDistance } from '@/lib/utils'
import JobPreviewModal, { JobDetails } from '@/components/job-preview-modal'

const NearbyJobsMap = dynamic(
  () => import('@/components/maps/nearby-jobs-map'),
  { ssr: false, loading: () => <MapLoading /> }
)

function MapLoading() {
  return (
    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading MVGR campus map...</p>
    </div>
  )
}

export default function NearbyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [previewJob, setPreviewJob] = useState<JobDetails | null>(null)

  // MVGR Hostel coordinates default
  const [userLocation, setUserLocation] = useState({
    lat: 18.0601,
    lng: 83.4005,
  })
  const [geoActive, setGeoActive] = useState(false)

  const loadJobs = async () => {
    setLoading(true)
    try {
      const data = await getAvailableJobs()
      setJobs(data || [])
    } catch (err) {
      console.error('Error loading nearby jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setGeoActive(true)
        },
        () => {}
      )
    }
  }, [])

  const mapJobs = jobs.map((j) => {
    const lat = parseFloat(j.latitude) || 18.0601
    const lng = parseFloat(j.longitude) || 83.4005
    const distanceStr = calculateDistance(userLocation.lat, userLocation.lng, lat, lng)

    return {
      id: j.id,
      title: j.title,
      company: 'Employer Partner',
      location: j.location,
      lat,
      lng,
      hourlyRate: `$${j.hourlyRate}/hr`,
      jobType: j.jobType || 'part-time',
      applicants: j.applicantCount || 0,
      distance: distanceStr,
      description: j.description,
      skills: j.skills || [],
    }
  })

  const handleOpenPreview = (job: any) => {
    setPreviewJob({
      id: job.id,
      title: job.title,
      company: 'Employer Partner',
      location: job.location,
      hourlyRate: job.hourlyRate,
      jobType: job.jobType || 'part-time',
      skills: job.skills || [],
      description: job.description || 'Flexible student shift position near MVGR College.',
      distance: job.distance,
      applicants: job.applicants || job.applicantCount || 0,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nearby Shops around MVGR College</h1>
          <p className="text-muted-foreground mt-1">
            Discover opportunities on the interactive map sorted by distance from your MVGR Hostel
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
          <Navigation className="h-4 w-4 text-primary" />
          <span>
            {geoActive ? 'Using Current GPS Location' : 'MVGR Hostel Location (18.060, 83.400)'}
          </span>
        </div>
      </div>

      {/* Info Alert */}
      <Card className="p-4 border border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-700">MVGR Campus Map Pins Active</p>
          <p className="text-sm text-blue-600/80">
            Click any shop marker pin on the map or select a listing on the right to open the application preview.
          </p>
        </div>
      </Card>

      {/* Map and List Container */}
      <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
        {/* Map */}
        <Card className="lg:col-span-2 p-0 border border-border/50 overflow-hidden">
          {loading ? (
            <MapLoading />
          ) : (
            <NearbyJobsMap
              jobs={mapJobs}
              userLat={userLocation.lat}
              userLng={userLocation.lng}
              onSelectJob={(job) => handleOpenPreview(job)}
            />
          )}
        </Card>

        {/* Job Details Sidebar */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading nearby campus shops...</span>
            </div>
          ) : mapJobs.length > 0 ? (
            mapJobs.map((job) => (
              <Card
                key={job.id}
                className="p-4 border border-border/50 hover:border-primary/50 cursor-pointer transition-all hover:bg-muted/30 space-y-3"
                onClick={() => handleOpenPreview(job)}
              >
                <div>
                  <h3 className="font-bold text-foreground text-sm">{job.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{job.location}</p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary font-semibold">📍 {job.distance} away</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-semibold text-foreground">{job.hourlyRate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-purple-500" />
                    <span>{job.applicants} applicants</span>
                  </div>
                </div>

                <Button size="sm" className="w-full mt-2 gap-1 text-xs">
                  Preview & Apply
                </Button>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-sm py-4">No registered shops available nearby.</p>
          )}
        </div>
      </div>

      {/* Application Preview Modal */}
      {previewJob && (
        <JobPreviewModal
          job={previewJob}
          onClose={() => setPreviewJob(null)}
          onApplied={() => {
            loadJobs()
          }}
        />
      )}
    </div>
  )
}
