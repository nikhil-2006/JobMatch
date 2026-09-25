'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Trash2,
  Clock,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle,
  MapPin,
  DollarSign,
  FileText,
  X,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react'
import {
  getUserAvailability,
  addAvailabilitySlot,
  deleteAvailabilitySlot,
  getUserSchedules,
} from '@/app/actions/schedule'

interface TimeSlot {
  id?: string
  day: string
  startTime: string
  endTime: string
  isRecurring: boolean
}

interface Shift {
  id: string
  jobTitle: string
  company: string
  location?: string
  date: string
  startTime: string
  endTime: string
  hourlyRate?: string
  status: string
  notes?: string
}

export default function StudentSchedulePage() {
  const [availability, setAvailability] = useState<TimeSlot[]>([])
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [urgentCoverActive, setUrgentCoverActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [newSlot, setNewSlot] = useState({
    day: 'Monday',
    startTime: '16:00',
    endTime: '21:00',
    isRecurring: true,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [avail, shifts] = await Promise.all([
        getUserAvailability(),
        getUserSchedules(),
      ])
      setAvailability(avail || [])
      setUpcomingShifts(shifts || [])
    } catch (err) {
      console.error('Error loading schedule data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddSlot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSubmitting(true)
    try {
      const res = await addAvailabilitySlot(newSlot)
      if (res.success) {
        setShowAddForm(false)
        await fetchData()
      }
    } catch (err) {
      console.error('Error adding slot:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const applyPreset = (day: string, start: string, end: string) => {
    setNewSlot({
      day,
      startTime: start,
      endTime: end,
      isRecurring: true,
    })
    setShowAddForm(true)
  }

  const handleDeleteSlot = async (slotId?: string) => {
    if (!slotId) return
    if (!confirm('Are you sure you want to remove this availability slot?')) return
    try {
      const res = await deleteAvailabilitySlot(slotId)
      if (res.success) {
        await fetchData()
      }
    } catch (err) {
      console.error('Error deleting slot:', err)
    }
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  // Calculate total weekly available hours
  const totalWeeklyHours = availability.reduce((acc, slot) => {
    const startH = parseInt(slot.startTime.split(':')[0], 10) || 0
    const endH = parseInt(slot.endTime.split(':')[0], 10) || 0
    const diff = Math.max(0, endH - startH)
    return acc + diff
  }, 0)

  const exportICS = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MVGR JobMatch//Student Schedule//EN
BEGIN:VEVENT
SUMMARY:${upcomingShifts[0]?.jobTitle || 'MVGR Student Shift'}
DESCRIPTION:Campus Shift Duty
LOCATION:${upcomingShifts[0]?.location || 'MVGR Campus'}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'MVGR_Shift_Schedule.ics'
    a.click()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Schedule & Availability</h1>
          <p className="text-muted-foreground mt-1">
            Manage your weekly MVGR campus work shifts and availability preferences
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportICS} className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export Calendar (.ics)
          </Button>

          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border border-border/50 bg-card/60 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Total Weekly Available Hours</span>
          <p className="text-3xl font-extrabold text-primary mt-1">{loading ? '...' : `${totalWeeklyHours} hrs/wk`}</p>
        </Card>

        <Card className="p-5 border border-border/50 bg-card/60 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Confirmed Shifts This Week</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{loading ? '...' : upcomingShifts.length}</p>
        </Card>

        <Card className="p-5 border border-border/50 bg-card/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Urgent Cover Shifts</span>
            <span className="text-xs text-foreground font-medium">
              {urgentCoverActive ? 'Available for emergency cover' : 'Off duty'}
            </span>
          </div>
          <button
            onClick={() => setUrgentCoverActive(!urgentCoverActive)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              urgentCoverActive ? 'bg-emerald-600' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                urgentCoverActive ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </Card>
      </div>

      {/* Weekly Availability Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Weekly Shift Availability</h2>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Close Form' : 'Add Time Slot'}
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Quick Presets:
          </span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs py-1 h-7"
            onClick={() => applyPreset('Monday', '16:00', '21:00')}
          >
            Mon After Class (4PM - 9PM)
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs py-1 h-7"
            onClick={() => applyPreset('Friday', '14:00', '22:00')}
          >
            Fri Evening (2PM - 10PM)
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs py-1 h-7"
            onClick={() => applyPreset('Saturday', '09:00', '17:00')}
          >
            Sat Full Day (9AM - 5PM)
          </Button>
        </div>

        {/* Add Slot Form Modal / Card */}
        {showAddForm && (
          <Card className="p-6 border border-primary/40 space-y-4 bg-muted/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold text-foreground text-lg">Define New Available Time Slot</h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Day of Week</label>
                  <select
                    className="w-full p-2.5 border border-input rounded-lg bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary"
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Available From</label>
                  <Input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Available Until</label>
                  <Input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Available Slot
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Calendar Grid View or List View */}
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading weekly calendar slots...</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-7">
            {daysOfWeek.map((day) => {
              const daySlots = availability.filter((s) => s.day === day)
              return (
                <Card
                  key={day}
                  className={`p-3 border space-y-3 min-h-[140px] flex flex-col justify-between ${
                    daySlots.length > 0
                      ? 'border-primary/40 bg-gradient-to-b from-primary/10 to-transparent'
                      : 'border-border/40 bg-muted/20 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground block border-b border-border/40 pb-1">
                      {day.substring(0, 3)}
                    </span>

                    {daySlots.length > 0 ? (
                      daySlots.map((slot, idx) => (
                        <div
                          key={slot.id || idx}
                          className="p-2 rounded bg-background border border-border/60 text-xs space-y-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between font-semibold text-primary">
                            <span>{slot.startTime}</span>
                            <span>{slot.endTime}</span>
                          </div>
                          {slot.id && (
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-[10px] text-destructive hover:underline block w-full text-right"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic block">Off Day</span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-[11px] h-6 py-0 text-muted-foreground hover:text-foreground"
                    onClick={() => applyPreset(day, '16:00', '21:00')}
                  >
                    + Add
                  </Button>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {availability.map((slot, index) => (
              <Card
                key={slot.id || index}
                className="p-4 border border-border/50 bg-gradient-to-br from-primary/5 to-primary/2 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{slot.day}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {slot.isRecurring ? 'Weekly' : 'Once'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>

                {slot.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDeleteSlot(slot.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Slot
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Upcoming Shifts Section */}
      <div className="space-y-4 border-t border-border/50 pt-6">
        <h2 className="text-2xl font-bold text-foreground">Confirmed MVGR Campus Shifts</h2>

        {upcomingShifts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingShifts.map((shift) => (
              <Card
                key={shift.id}
                className="p-5 border border-border/50 hover:border-primary/50 transition-all cursor-pointer space-y-4 hover:shadow-md"
                onClick={() => setSelectedShift(shift)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">{shift.jobTitle}</h3>
                    <p className="text-xs font-semibold text-muted-foreground">{shift.company}</p>
                  </div>

                  <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 capitalize">
                    {shift.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                    {shift.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {shift.startTime} - {shift.endTime}
                  </span>
                  {shift.hourlyRate && (
                    <span className="flex items-center gap-1 font-bold text-emerald-600">
                      <DollarSign className="h-3.5 w-3.5" />
                      {shift.hourlyRate}
                    </span>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedShift(shift)
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Inspect Shift Instructions
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground border border-border/50">
            No confirmed upcoming shifts scheduled yet.
          </Card>
        )}
      </div>

      {/* Interactive Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
          <Card className="relative w-full max-w-lg p-6 bg-card text-card-foreground border border-border space-y-6 shadow-2xl z-[10000]">
            <div className="flex items-start justify-between border-b border-border/60 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  MVGR Campus Shift Assignment
                </span>
                <h2 className="text-xl font-bold text-foreground mt-1">{selectedShift.jobTitle}</h2>
                <p className="text-sm text-muted-foreground">{selectedShift.company}</p>
              </div>
              <button
                onClick={() => setSelectedShift(null)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                <span className="text-xs text-muted-foreground block">Shift Date & Hours</span>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {selectedShift.date} ({selectedShift.startTime} - {selectedShift.endTime})
                </p>
              </div>

              {selectedShift.location && (
                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground block">Store / Campus Location</span>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {selectedShift.location}
                  </p>
                </div>
              )}

              {selectedShift.notes && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 space-y-1">
                  <span className="text-xs font-bold block flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Supervisor Instructions
                  </span>
                  <p className="text-xs leading-relaxed">{selectedShift.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end border-t border-border/60 pt-4">
              <Button variant="outline" onClick={() => setSelectedShift(null)}>
                Close
              </Button>
              <Button onClick={exportICS} className="gap-2">
                <Download className="h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
