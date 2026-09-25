'use client'

import { useEffect, useState } from 'react'

export interface JobLocation {
  id: string
  title: string
  company: string
  lat: number
  lng: number
  hourlyRate?: string
  distance?: string
  description?: string
  jobType?: string
  skills?: string[]
  applicants?: number
}

interface NearbyJobsMapProps {
  jobs: JobLocation[]
  userLat?: number
  userLng?: number
  onSelectJob?: (job: JobLocation) => void
}

export default function NearbyJobsMap({
  jobs,
  userLat = 18.0601,
  userLng = 83.4005,
  onSelectJob,
}: NearbyJobsMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [ReactLeaflet, setReactLeaflet] = useState<any>(null)
  const [L, setL] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([rl, leaflet]) => {
      setReactLeaflet(rl)
      setL(leaflet.default || leaflet)
    })
  }, [])

  if (!isMounted || !ReactLeaflet || !L) {
    return (
      <div className="w-full h-full min-h-[380px] bg-muted/40 rounded-lg flex items-center justify-center border border-border/50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Initializing Interactive Campus Map...</p>
        </div>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup } = ReactLeaflet

  // Custom HTML DivIcon for student location
  const studentIcon = L.divIcon({
    className: 'custom-student-pin',
    html: `
      <div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; items-center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  })

  // Custom HTML DivIcon for registered shops
  const shopIcon = L.divIcon({
    className: 'custom-shop-pin',
    html: `
      <div style="background-color: #10b981; width: 38px; height: 38px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 14px rgba(16,185,129,0.4); display: flex; items-center; justify-content: center; color: white; cursor: pointer; transform: scale(1); transition: transform 0.2s;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M4 12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2"/></svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  })

  const center: [number, number] = [userLat, userLng]

  return (
    <div className="w-full h-full min-h-[380px] rounded-lg overflow-hidden border border-border/50 relative">
      <MapContainer center={center} zoom={16} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Student Location Marker */}
        <Marker position={center} icon={studentIcon}>
          <Popup>
            <div className="p-1 text-sm font-semibold text-primary">Your Location (MVGR Hostel)</div>
          </Popup>
        </Marker>

        {/* Shop / Job Markers */}
        {jobs.map((job) => (
          <Marker
            key={job.id}
            position={[job.lat, job.lng]}
            icon={shopIcon}
            eventHandlers={{
              click: () => {
                if (onSelectJob) onSelectJob(job)
              },
            }}
          >
            <Popup>
              <div className="space-y-2 p-1 text-sm min-w-[200px]">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Registered Shop
                  </span>
                  <p className="font-bold text-foreground text-sm mt-1">{job.title}</p>
                  <p className="text-muted-foreground text-xs">{job.company}</p>
                </div>
                {job.hourlyRate && (
                  <p className="text-emerald-600 font-bold text-xs">
                    {job.hourlyRate.startsWith('$') ? job.hourlyRate : `$${job.hourlyRate}/hr`}
                  </p>
                )}
                {job.distance && (
                  <p className="text-xs text-muted-foreground font-medium">📍 {job.distance} away</p>
                )}
                {onSelectJob && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectJob(job)
                    }}
                    className="w-full mt-2 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow transition-colors cursor-pointer"
                  >
                    Preview Shop & Apply
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
