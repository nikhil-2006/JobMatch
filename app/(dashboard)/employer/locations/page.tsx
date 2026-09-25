'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Users, Loader2 } from 'lucide-react'
import { getEmployerJobs } from '@/app/actions/employer'

const JobLocationsMap = dynamic(
  () => import('@/components/maps/nearby-jobs-map'),
  { ssr: false, loading: () => <MapLoading /> }
)

function MapLoading() {
  return (
    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading job location map...</p>
    </div>
  )
}

export default function LocationsPage() {
  const [radius, setRadius] = useState('25')
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await getEmployerJobs()
        setJobs(data || [])
      } catch (err) {
        console.error('Error loading locations:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [])

  const mapItems = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.location,
    lat: parseFloat(j.latitude) || 37.7749,
    lng: parseFloat(j.longitude) || -122.4194,
    hourlyRate: `$${j.hourlyRate}/hr`,
  }))

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Job & Applicant Coverage Map</h1>
        <p className="text-muted-foreground mt-2">
          View location distribution of your posted opportunities
        </p>
      </div>

      {/* Search Radius */}
      <Card className="p-4 border border-border/50">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Search Radius (km)</label>
          <div className="flex gap-4">
            <Input
              type="number"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline">Set Radius</Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Applicants</p>
          <p className="text-2xl font-bold text-foreground mt-1">{loading ? '...' : totalApplicants}</p>
        </Card>
        <Card className="p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">Active Locations</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {loading ? '...' : jobs.length}
          </p>
        </Card>
        <Card className="p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">Average Distance</p>
          <p className="text-2xl font-bold text-foreground mt-1">3.4 km</p>
        </Card>
      </div>

      {/* Map and List */}
      <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
        {/* Map */}
        <Card className="lg:col-span-2 p-0 border border-border/50 overflow-hidden">
          {loading ? (
            <MapLoading />
          ) : (
            <JobLocationsMap
              jobs={mapItems}
              userLat={37.7749}
              userLng={-122.4194}
            />
          )}
        </Card>

        {/* Locations List */}
        <div className="lg:col-span-1 space-y-3 overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading locations...</span>
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Card
                key={job.id}
                className="p-4 border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
                  <p className="text-xs text-muted-foreground">{job.location}</p>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Applicants
                      </span>
                      <span className="font-semibold text-foreground">{job.applicantCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4">No active locations found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
