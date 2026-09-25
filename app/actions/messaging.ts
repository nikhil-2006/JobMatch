'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id || null
}

export async function getConversations() {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const { data: userConvs } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .or(`participantOne.eq.${userId},participantTwo.eq.${userId}`)
      .order('lastMessageAt', { ascending: false })

    if (!userConvs || userConvs.length === 0) return []

    const results = await Promise.all(
      userConvs.map(async (conv: any) => {
        const otherUserId =
          conv.participantOne === userId ? conv.participantTwo : conv.participantOne

        const [{ data: profileRows }, { data: lastMsgRow }] = await Promise.all([
          supabaseAdmin
            .from('user_profiles')
            .select('firstName, lastName, companyName, role')
            .eq('userId', otherUserId)
            .limit(1),
          supabaseAdmin
            .from('messages')
            .select('content, createdAt')
            .eq('conversationId', conv.id)
            .order('createdAt', { ascending: false })
            .limit(1),
        ])

        const otherProfile = profileRows?.[0] || null
        const fullName =
          otherProfile
            ? [otherProfile.firstName, otherProfile.lastName].filter(Boolean).join(' ') ||
              otherUserId
            : otherUserId

        const avatarStr = fullName
          .split(' ')
          .slice(0, 2)
          .map((w: string) => w[0])
          .join('')
          .toUpperCase()

        return {
          id: conv.id,
          participantId: otherUserId,
          name: fullName,
          company:
            otherProfile?.companyName ||
            (otherProfile?.role === 'employer' ? 'Campus Employer' : 'Student Applicant'),
          avatar: avatarStr || '??',
          lastMessage: lastMsgRow?.[0]?.content || 'Tap to view chat',
          timestamp: conv.lastMessageAt
            ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Just now',
          unreadCount: 0,
        }
      })
    )

    return results
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
}

export async function getMessages(conversationId: string) {
  const userId = await getUserId()
  if (!userId) return []

  try {
    const { data: msgList } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversationId', conversationId)
      .order('createdAt', { ascending: true })

    return (msgList || []).map((msg: any) => ({
      id: msg.id,
      senderId: msg.senderId,
      text: msg.content,
      isMe: msg.senderId === userId,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(
  conversationId: string,
  recipientId: string,
  content: string
) {
  const currentUserId = await getUserId()
  if (!currentUserId) return { success: false, error: 'Unauthorized' }

  try {
    const { error: msgError } = await supabaseAdmin.from('messages').insert({
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      recipientId,
      content,
      isRead: false,
    })

    if (msgError) throw msgError

    await supabaseAdmin
      .from('conversations')
      .update({ lastMessageAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .eq('id', conversationId)

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error: 'Failed to send message.' }
  }
}

export async function startConversation(otherUserId: string) {
  const currentUserId = await getUserId()
  if (!currentUserId) return { success: false, error: 'Unauthorized' }

  try {
    // Check if conversation already exists (either direction)
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(
        `and(participantOne.eq.${currentUserId},participantTwo.eq.${otherUserId}),and(participantOne.eq.${otherUserId},participantTwo.eq.${currentUserId})`
      )
      .limit(1)

    if (existing && existing[0]) {
      return { success: true, conversationId: existing[0].id }
    }

    const convId = `conv_${Date.now()}`
    const { error } = await supabaseAdmin.from('conversations').insert({
      id: convId,
      participantOne: currentUserId,
      participantTwo: otherUserId,
      lastMessageAt: new Date().toISOString(),
    })

    if (error) throw error
    revalidatePath('/')
    return { success: true, conversationId: convId }
  } catch (error) {
    console.error('Error starting conversation:', error)
    return { success: false, error: 'Failed to start conversation.' }
  }
}
