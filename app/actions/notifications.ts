'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id || null
}

export async function getNotifications() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const { data: list } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    return (list || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      message: item.message || '',
      type: item.type,
      isRead: item.isRead ?? false,
      timestamp: new Date(item.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ isRead: true })
      .eq('id', notificationId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating notification:', error)
    return { success: false, error: 'Failed to update notification' }
  }
}

export async function markAllNotificationsAsRead() {
  const userId = await getUserId()
  if (!userId) return { success: false }

  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ isRead: true })
      .eq('userId', userId)

    if (error) throw error
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating notifications:', error)
    return { success: false, error: 'Failed to update notifications' }
  }
}
