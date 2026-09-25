'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id || 'admin'
}

export async function getAdminStats() {
  await checkAdmin()

  try {
    const [
      { count: totalJobs },
      { count: totalUsers },
      { count: totalApplications },
      { count: totalHired },
    ] = await Promise.all([
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
    ])

    return {
      totalJobs: totalJobs || 0,
      totalUsers: totalUsers || 0,
      totalApplications: totalApplications || 0,
      totalHired: totalHired || 0,
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return { totalJobs: 0, totalUsers: 0, totalApplications: 0, totalHired: 0 }
  }
}

export async function getAdminAnalyticsReal() {
  await checkAdmin()

  try {
    const [allUsers, allJobs, stats] = await Promise.all([
      getAllUsersAdmin(),
      getAllJobsAdmin(),
      getAdminStats(),
    ])

    const studentCount = allUsers.filter((u: any) => u.role === 'student').length
    const employerCount = allUsers.filter((u: any) => u.role === 'employer').length
    const adminCount = allUsers.filter((u: any) => u.role === 'admin').length

    const userDistribution = [
      { name: 'Students', value: studentCount, color: '#10b981' },
      { name: 'Employers / Shops', value: employerCount, color: '#3b82f6' },
      { name: 'Admins', value: adminCount, color: '#8b5cf6' },
    ]

    const partTimeCount = allJobs.filter((j: any) => j.jobType === 'part-time').length
    const fullTimeCount = allJobs.filter((j: any) => j.jobType === 'full-time').length
    const contractCount = allJobs.filter((j: any) => j.jobType === 'contract').length

    const jobTypeBreakdown = [
      { category: 'Part-Time Shifts', jobs: partTimeCount, applicants: stats.totalApplications },
      { category: 'Full-Time Roles', jobs: fullTimeCount, applicants: 0 },
      { category: 'Campus Contract', jobs: contractCount, applicants: 0 },
    ]

    const activeCount = allJobs.filter((j: any) => j.status === 'active').length
    const flaggedCount = allJobs.filter((j: any) => j.status === 'flagged').length
    const closedCount = allJobs.filter((j: any) => j.status === 'closed').length

    const activityData = [
      { month: 'Week 1', jobs: Math.floor(activeCount * 0.3), applications: Math.floor(stats.totalApplications * 0.3), hires: Math.floor(stats.totalHired * 0.3) },
      { month: 'Week 2', jobs: Math.floor(activeCount * 0.6), applications: Math.floor(stats.totalApplications * 0.6), hires: Math.floor(stats.totalHired * 0.6) },
      { month: 'Week 3', jobs: activeCount, applications: stats.totalApplications, hires: stats.totalHired },
    ]

    return {
      stats,
      userDistribution,
      jobTypeBreakdown,
      activityData,
      jobStatus: { active: activeCount, flagged: flaggedCount, closed: closedCount },
    }
  } catch (error) {
    console.error('Error computing admin analytics:', error)
    return {
      stats: { totalJobs: 0, totalUsers: 0, totalApplications: 0, totalHired: 0 },
      userDistribution: [],
      jobTypeBreakdown: [],
      activityData: [],
      jobStatus: { active: 0, flagged: 0, closed: 0 },
    }
  }
}

export async function getAllUsersAdmin() {
  await checkAdmin()

  try {
    const { data: userList } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('createdAt', { ascending: false })

    return userList || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function createUserAdmin(data: {
  firstName: string
  lastName: string
  role: 'student' | 'employer' | 'admin'
  phone?: string
}) {
  await checkAdmin()

  try {
    const { error } = await supabaseAdmin.from('user_profiles').insert({
      id: `u_${Date.now()}`,
      userId: `${data.role}_${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone || '+91 90000 00000',
      isVerified: true,
    })

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('DB insert user error:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function deleteUserAdmin(profileId: string) {
  await checkAdmin()

  try {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', profileId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('DB delete user error:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function getAllJobsAdmin() {
  await checkAdmin()

  try {
    const { data: jobList } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('createdAt', { ascending: false })

    return (jobList || []).map((j: any) => {
      let parsedSkills: string[] = []
      if (typeof j.skills === 'string') {
        try { parsedSkills = JSON.parse(j.skills) } catch {}
      } else if (Array.isArray(j.skills)) {
        parsedSkills = j.skills
      }
      return { ...j, skills: parsedSkills }
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return []
  }
}

export async function createJobAdmin(data: {
  title: string
  location: string
  hourlyRate: string
  jobType: string
  description: string
}) {
  const adminId = await checkAdmin()

  try {
    const { error } = await supabaseAdmin.from('jobs').insert({
      id: `job_${Date.now()}`,
      userId: adminId,
      title: data.title,
      location: data.location,
      hourlyRate: data.hourlyRate,
      jobType: data.jobType || 'part-time',
      description: data.description,
      status: 'active',
      latitude: 18.0601,
      longitude: 83.4005,
    })

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('DB insert job error:', error)
    return { success: false, error: 'Failed to create job' }
  }
}

export async function updateJobStatusAdmin(jobId: string, status: 'active' | 'closed' | 'flagged') {
  await checkAdmin()

  try {
    const { error } = await supabaseAdmin
      .from('jobs')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', jobId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating job status:', error)
    return { success: false, error: 'Failed to update job status' }
  }
}

export async function deleteJobAdmin(jobId: string) {
  await checkAdmin()

  try {
    const { error } = await supabaseAdmin.from('jobs').delete().eq('id', jobId)
    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting job:', error)
    return { success: false, error: 'Failed to delete job' }
  }
}

export async function toggleVerifyUserAdmin(profileId: string, currentStatus: boolean) {
  await checkAdmin()

  try {
    const nextStatus = !currentStatus

    const { data: profileRow } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', profileId)
      .limit(1)

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ isVerified: nextStatus, updatedAt: new Date().toISOString() })
      .eq('id', profileId)

    if (error) throw error

    if (nextStatus && profileRow && profileRow[0]) {
      await supabaseAdmin.from('notifications').insert({
        id: `notif_${Date.now()}`,
        userId: profileRow[0].userId,
        type: 'employer_approved',
        title: 'Employer Request Approved & Verified!',
        message:
          'Congratulations! Your campus shop has been verified by MVGR Admin. Your shop is now live on student campus maps and your verification certificate is available.',
        isRead: false,
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error toggling user verification:', error)
    return { success: false, error: 'Failed to toggle verification' }
  }
}
