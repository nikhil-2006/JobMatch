'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id || null
}

export async function getAvailableJobs() {
  try {
    const { data: jobList, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Supabase jobs error:', error)
      return []
    }

    const rawJobs = jobList || []
    const activeJobs = rawJobs.filter((j: any) => !j.status || j.status === 'active')

    return await Promise.all(
      activeJobs.map(async (j: any) => {
        let parsedSkills: string[] = []
        if (typeof j.skills === 'string') {
          try { parsedSkills = JSON.parse(j.skills) } catch {}
        } else if (Array.isArray(j.skills)) {
          parsedSkills = j.skills
        }

        // Fetch employer profile name
        let companyName = 'MVGR Campus Store Partner'
        if (j.userId) {
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('companyName, firstName')
            .eq('userId', j.userId)
            .limit(1)
          
          if (profile && profile[0]) {
            companyName = profile[0].companyName || (profile[0].firstName ? `${profile[0].firstName}'s Store` : companyName)
          }
        }

        return { ...j, company: companyName, skills: parsedSkills }
      })
    )
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return []
  }
}

export async function getJobById(jobId: string) {
  try {
    const { data: result } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .limit(1)

    if (!result || !result[0]) return null
    const j = result[0]
    let parsedSkills: string[] = []
    if (typeof j.skills === 'string') {
      try { parsedSkills = JSON.parse(j.skills) } catch {}
    } else if (Array.isArray(j.skills)) {
      parsedSkills = j.skills
    }
    return { ...j, skills: parsedSkills }
  } catch (error) {
    console.error('Error fetching job:', error)
    return null
  }
}

export async function applyToJob(jobId: string, coverLetter?: string) {
  const studentId = await getUserId()
  if (!studentId) return { success: false, message: 'Please sign in to apply for this job.' }

  try {
    const jobRecord = await getJobById(jobId)
    if (!jobRecord) return { success: false, message: 'Job not found.' }

    // Check if already applied
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('studentId', studentId)
      .eq('jobId', jobId)
      .limit(1)

    if (existing && existing.length > 0) {
      return { success: false, message: 'Already applied to this job' }
    }

    const applicationId = `app_${Date.now()}`
    const { error } = await supabaseAdmin.from('applications').insert({
      id: applicationId,
      studentId,
      jobId,
      employerId: jobRecord.userId,
      status: 'pending',
      coverLetter: coverLetter || '',
    })

    if (error) throw error

    // Increment applicant count
    await supabaseAdmin
      .from('jobs')
      .update({ applicantCount: (jobRecord.applicantCount || 0) + 1 })
      .eq('id', jobId)

    revalidatePath('/')
    return { success: true, applicationId }
  } catch (error) {
    console.error('Error applying to job:', error)
    return { success: false, message: 'Failed to submit application. Please try again.' }
  }
}

export async function getMyApplications() {
  const studentId = await getUserId()
  if (!studentId) return []

  try {
    const { data: userApps } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('studentId', studentId)
      .order('appliedAt', { ascending: false })

    if (!userApps || userApps.length === 0) return []

    const enriched = await Promise.all(
      userApps.map(async (app: any) => {
        const [{ data: jobRows }, { data: employerRows }] = await Promise.all([
          supabaseAdmin.from('jobs').select('title, location, hourlyRate').eq('id', app.jobId).limit(1),
          supabaseAdmin.from('user_profiles').select('companyName, firstName').eq('userId', app.employerId).limit(1),
        ])
        const job = jobRows?.[0]
        const employer = employerRows?.[0]
        return {
          id: app.id,
          jobTitle: job?.title || 'Position',
          company: employer?.companyName || (employer?.firstName ? `${employer.firstName}'s Shop` : 'MVGR Store Partner'),
          appliedDate: new Date(app.appliedAt).toLocaleDateString(),
          status: (app.status || 'pending') as 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn',
          salary: job?.hourlyRate ? `₹${job.hourlyRate}/hr` : '₹16/hr',
          location: job?.location || 'MVGR Campus Arcade',
        }
      })
    )
    return enriched
  } catch (error) {
    console.error('Error fetching applications:', error)
    return []
  }
}

export async function withdrawApplication(applicationId: string) {
  const studentId = await getUserId()
  if (!studentId) return { success: false, error: 'Unauthorized' }

  try {
    const { error } = await supabaseAdmin
      .from('applications')
      .update({ status: 'withdrawn', updatedAt: new Date().toISOString() })
      .eq('id', applicationId)
      .eq('studentId', studentId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error withdrawing application:', error)
    return { success: false, error: 'Failed to withdraw application.' }
  }
}
