'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id || null
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export async function getUserAvailability() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const { data: slots } = await supabaseAdmin
      .from('availability')
      .select('*')
      .eq('userId', userId)

    return (slots || []).map((s: any) => ({
      id: s.id,
      day: dayNames[s.dayOfWeek] || 'Monday',
      startTime: s.startTime,
      endTime: s.endTime,
      isRecurring: s.recurring ?? true,
    }))
  } catch (error) {
    console.error('Error fetching availability:', error)
    return []
  }
}

export async function addAvailabilitySlot(slot: {
  day: string
  startTime: string
  endTime: string
  isRecurring: boolean
}) {
  const userId = await getUserId()
  if (!userId) return { success: false, error: 'Please sign in to set availability.' }

  const dayIndex = dayNames.indexOf(slot.day) >= 0 ? dayNames.indexOf(slot.day) : 0

  try {
    const { error } = await supabaseAdmin.from('availability').insert({
      id: `avail_${Date.now()}`,
      userId,
      dayOfWeek: dayIndex,
      startTime: slot.startTime,
      endTime: slot.endTime,
      recurring: slot.isRecurring,
    })

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error adding availability:', error)
    return { success: false, error: 'Failed to add availability slot.' }
  }
}

export async function deleteAvailabilitySlot(slotId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('availability')
      .delete()
      .eq('id', slotId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting availability:', error)
    return { success: false, error: 'Failed to delete availability slot.' }
  }
}

export async function getUserSchedules() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const { data: items } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .or(`studentId.eq.${userId},employerId.eq.${userId}`)
      .order('startDate', { ascending: false })

    if (!items || items.length === 0) return []

    const enriched = await Promise.all(
      items.map(async (sch: any) => {
        const [{ data: jobRows }, { data: employerRows }] = await Promise.all([
          supabaseAdmin.from('jobs').select('title, location, hourlyRate').eq('id', sch.jobId).limit(1),
          supabaseAdmin.from('user_profiles').select('companyName, firstName').eq('userId', sch.employerId).limit(1),
        ])
        const job = jobRows?.[0]
        const employer = employerRows?.[0]
        return {
          id: sch.id,
          jobTitle: job?.title || 'Shift Duty',
          company:
            employer?.companyName ||
            (employer?.firstName ? `${employer.firstName}'s Shop` : 'MVGR Store Partner'),
          location: job?.location || 'MVGR Campus',
          date: new Date(sch.startDate).toLocaleDateString(),
          startTime: new Date(sch.startDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          endTime: new Date(sch.endDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          hourlyRate: job?.hourlyRate ? `₹${job.hourlyRate}/hr` : '₹16.00/hr',
          status: sch.status || 'confirmed',
          notes: sch.notes || '',
        }
      })
    )
    return enriched
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return []
  }
}
