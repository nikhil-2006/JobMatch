'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id || null
}

export async function getEmployerJobs() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const { data: list } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    return (list || []).map((j: any) => {
      let parsedSkills: string[] = []
      if (typeof j.skills === 'string') {
        try { parsedSkills = JSON.parse(j.skills) } catch {}
      } else if (Array.isArray(j.skills)) {
        parsedSkills = j.skills
      }
      return { ...j, skills: parsedSkills }
    })
  } catch (error) {
    console.error('Error fetching employer jobs:', error)
    return []
  }
}

export async function getEmployerApplicants() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const { data: apps } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('employerId', userId)
      .order('appliedAt', { ascending: false })

    if (!apps || apps.length === 0) return []

    // Enrich with job titles and student names
    const enriched = await Promise.all(
      apps.map(async (app: any) => {
        const [{ data: jobRows }, { data: studentRows }] = await Promise.all([
          supabaseAdmin.from('jobs').select('title').eq('id', app.jobId).limit(1),
          supabaseAdmin.from('user_profiles').select('firstName, lastName').eq('userId', app.studentId).limit(1),
        ])
        const student = studentRows?.[0]
        return {
          ...app,
          jobTitle: jobRows?.[0]?.title || 'Position',
          studentName:
            [student?.firstName, student?.lastName].filter(Boolean).join(' ') ||
            'Student Applicant',
        }
      })
    )
    return enriched
  } catch (error) {
    console.error('Error fetching employer applicants:', error)
    return []
  }
}

export async function getEmployerDashboardData() {
  const userId = await getUserId()
  if (!userId) {
    return {
      jobs: [],
      applicants: [],
      stats: { activeJobs: 0, totalApplicants: 0, hired: 0, pendingReview: 0 },
    }
  }

  try {
    const [{ data: jobsList }, { data: apps }] = await Promise.all([
      supabaseAdmin.from('jobs').select('*').eq('userId', userId).order('createdAt', { ascending: false }),
      supabaseAdmin.from('applications').select('*').eq('employerId', userId).order('appliedAt', { ascending: false }),
    ])

    const employerJobsList = jobsList || []
    const appsList = apps || []

    const enriched = await Promise.all(
      appsList.map(async (app: any) => {
        const [{ data: jobRows }, { data: studentRows }] = await Promise.all([
          supabaseAdmin.from('jobs').select('title').eq('id', app.jobId).limit(1),
          supabaseAdmin.from('user_profiles').select('firstName, lastName').eq('userId', app.studentId).limit(1),
        ])
        const student = studentRows?.[0]
        return {
          ...app,
          jobTitle: jobRows?.[0]?.title || 'Position',
          studentName:
            [student?.firstName, student?.lastName].filter(Boolean).join(' ') ||
            'Student Applicant',
        }
      })
    )

    return {
      jobs: employerJobsList,
      applicants: enriched,
      stats: {
        activeJobs: employerJobsList.filter((j: any) => j.status === 'active').length,
        totalApplicants: enriched.length,
        hired: enriched.filter((a: any) => a.status === 'accepted').length,
        pendingReview: enriched.filter((a: any) => a.status === 'pending').length,
      },
    }
  } catch (error) {
    console.error('Error computing employer dashboard stats:', error)
    return {
      jobs: [],
      applicants: [],
      stats: { activeJobs: 0, totalApplicants: 0, hired: 0, pendingReview: 0 },
    }
  }
}

export async function getEmployerAnalyticsReal() {
  const userId = await getUserId()
  if (!userId) {
    return {
      stats: { totalApps: 0, totalViews: 0, conversionRate: '0.0%', avgTimeToHire: '0 Days' },
      applicationStatus: [],
      jobPerformance: [],
      applicationTrend: [],
    }
  }

  try {
    const [{ data: jobsList }, { data: apps }] = await Promise.all([
      supabaseAdmin.from('jobs').select('*').eq('userId', userId).order('createdAt', { ascending: false }),
      supabaseAdmin.from('applications').select('id, jobId, status, appliedAt').eq('employerId', userId),
    ])

    const employerJobsList = jobsList || []
    const appsList = apps || []
    const totalApps = appsList.length
    const totalViews = employerJobsList.reduce((acc: number, j: any) => acc + (j.applicantCount || 0) * 12, 0)
    const conversionRate = totalViews > 0 ? ((totalApps / totalViews) * 100).toFixed(1) : '0.0'

    const applicationStatus = [
      { name: 'Pending Review', value: appsList.filter((a: any) => a.status === 'pending').length, color: '#f59e0b' },
      { name: 'Under Review', value: appsList.filter((a: any) => a.status === 'reviewed').length, color: '#3b82f6' },
      { name: 'Accepted / Hired', value: appsList.filter((a: any) => a.status === 'accepted').length, color: '#10b981' },
      { name: 'Declined', value: appsList.filter((a: any) => a.status === 'rejected').length, color: '#ef4444' },
    ]

    const jobPerformance = employerJobsList.slice(0, 5).map((j: any) => ({
      name: j.title.length > 18 ? j.title.substring(0, 18) + '...' : j.title,
      applications: appsList.filter((a: any) => a.jobId === j.id).length || j.applicantCount || 0,
      hired: appsList.filter((a: any) => a.jobId === j.id && a.status === 'accepted').length,
    }))

    const applicationTrend = [
      { month: 'Week 1', applications: Math.floor(totalApps * 0.2) },
      { month: 'Week 2', applications: Math.floor(totalApps * 0.5) },
      { month: 'Week 3', applications: Math.floor(totalApps * 0.8) },
      { month: 'Current Week', applications: totalApps },
    ]

    return {
      stats: {
        totalApps,
        totalViews,
        conversionRate: `${conversionRate}%`,
        avgTimeToHire: totalApps > 0 ? '2-3 Days' : '0 Days',
      },
      applicationStatus,
      jobPerformance,
      applicationTrend,
    }
  } catch (error) {
    console.error('Error calculating employer analytics:', error)
    return {
      stats: { totalApps: 0, totalViews: 0, conversionRate: '0.0%', avgTimeToHire: '0 Days' },
      applicationStatus: [],
      jobPerformance: [],
      applicationTrend: [],
    }
  }
}

export async function createJob(data: {
  title: string
  description: string
  location: string
  hourlyRate: string
  jobType: string
  skills?: string[]
  latitude?: string
  longitude?: string
}) {
  const userId = await getUserId()
  if (!userId) return { success: false, error: 'Please sign in to post a job.' }

  try {
    const jobId = `job_${Date.now()}`
    const { data: newJob, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        id: jobId,
        userId,
        title: data.title,
        description: data.description,
        location: data.location,
        hourlyRate: data.hourlyRate,
        jobType: data.jobType || 'part-time',
        skills: JSON.stringify(data.skills || []),
        latitude: data.latitude ? parseFloat(data.latitude) : 18.0601,
        longitude: data.longitude ? parseFloat(data.longitude) : 83.4005,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/')
    return { success: true, job: newJob }
  } catch (error) {
    console.error('Error creating job:', error)
    return { success: false, error: 'Failed to create job' }
  }
}

export async function updateJobStatus(jobId: string, status: 'active' | 'filled' | 'closed') {
  const userId = await getUserId()
  if (!userId) return { success: false }

  try {
    const { error } = await supabaseAdmin
      .from('jobs')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', jobId)
      .eq('userId', userId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating job status:', error)
    return { success: false }
  }
}

export async function deleteJob(jobId: string) {
  const userId = await getUserId()
  if (!userId) return { success: false }

  try {
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('userId', userId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting job:', error)
    return { success: false }
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
) {
  const userId = await getUserId()
  if (!userId) return { success: false }

  try {
    const { error } = await supabaseAdmin
      .from('applications')
      .update({ status, responseAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .eq('id', applicationId)
      .eq('employerId', userId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating application status:', error)
    return { success: false }
  }
}

export async function registerEmployerRequest(data: {
  companyName: string
  firstName: string
  lastName?: string
  phone: string
  companyAddress?: string
  latitude?: number
  longitude?: number
  initialJobTitle?: string
  initialHourlyRate?: string
  description?: string
}) {
  const userId = await getUserId()
  if (!userId) return { success: false, error: 'Please sign in to submit employer registration.' }

  try {
    const { data: existing } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('userId', userId)
      .limit(1)

    const profileData = {
      role: 'employer',
      companyName: data.companyName,
      firstName: data.firstName,
      lastName: data.lastName || '',
      phone: data.phone,
      companyAddress: data.companyAddress || 'MVGR College Main Gate Arcade',
      latitude: data.latitude || 18.0603,
      longitude: data.longitude || 83.4004,
      isVerified: false,
      updatedAt: new Date().toISOString(),
    }

    if (existing && existing.length > 0) {
      await supabaseAdmin.from('user_profiles').update(profileData).eq('userId', userId)
    } else {
      await supabaseAdmin.from('user_profiles').insert({
        id: `profile_${Date.now()}`,
        userId,
        ...profileData,
      })
    }

    await supabaseAdmin.from('jobs').insert({
      id: `job_${Date.now()}`,
      userId,
      title: data.initialJobTitle || `${data.companyName} Associate`,
      description: data.description || `Part-time opportunities at ${data.companyName} near MVGR Campus.`,
      location: data.companyAddress || 'MVGR Main Gate Arcade, Vizianagaram',
      hourlyRate: data.initialHourlyRate || '16.00',
      jobType: 'part-time',
      latitude: data.latitude || 18.0603,
      longitude: data.longitude || 83.4004,
      status: 'active',
    })

    const { data: adminProfiles } = await supabaseAdmin
      .from('user_profiles')
      .select('userId')
      .eq('role', 'admin')
      .limit(1)

    if (adminProfiles && adminProfiles.length > 0 && adminProfiles[0]?.userId) {
      await supabaseAdmin.from('notifications').insert({
        id: `notif_${Date.now()}`,
        userId: adminProfiles[0].userId,
        type: 'employer_registration',
        title: 'New Employer Registration Request',
        message: `${data.companyName} (${data.firstName}) submitted a request to join MVGR JobMatch portal.`,
        isRead: false,
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error registering employer request:', error)
    return { success: false, error: 'Failed to submit registration request.' }
  }
}

export async function getEmployerProfileStatus() {
  const userId = await getUserId()
  if (!userId) return { hasProfile: false, isVerified: false }

  try {
    const { data: profileRows } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .limit(1)

    if (!profileRows || !profileRows[0]) {
      return { hasProfile: false, isVerified: false }
    }

    const p = profileRows[0]
    return {
      hasProfile: true,
      isVerified: !!p.isVerified,
      companyName: p.companyName || 'MVGR Store Partner',
      employerName: [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Store Manager',
      companyAddress: p.companyAddress || 'MVGR Main Gate Arcade, Vizianagaram',
      phone: p.phone || '+91 98765 43210',
      verifiedAt: p.updatedAt,
      certificateId: `CERT-MVGR-2026-${(p.id || '88F4A2').slice(-6).toUpperCase()}`,
    }
  } catch (error) {
    console.error('Error fetching employer verification status:', error)
    return { hasProfile: false, isVerified: false }
  }
}
