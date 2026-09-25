'use client'

import { useEffect, useState } from 'react'
import ConversationList from '@/components/messaging/conversation-list'
import MessageThread from '@/components/messaging/message-thread'
import { getConversations, getMessages, sendMessage } from '@/app/actions/messaging'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function EmployerMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadConvs = async () => {
    try {
      const data = await getConversations()
      setConversations(data || [])
      if (data && data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id)
      }
    } catch (err) {
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Initial load + interval polling every 3 seconds
  useEffect(() => {
    loadConvs()
    const interval = setInterval(() => {
      loadConvs()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Poll messages when conversation selected
  useEffect(() => {
    if (!selectedConversationId) return

    async function loadMsgs() {
      try {
        const data = await getMessages(selectedConversationId!)
        setMessages(data || [])
      } catch (err) {
        console.error('Error loading messages:', err)
      }
    }

    loadMsgs()
    const interval = setInterval(() => {
      loadMsgs()
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedConversationId])

  const handleSend = async (content: string) => {
    if (!selectedConversationId) return
    const activeConv = conversations.find((c) => c.id === selectedConversationId)
    const recipientId = activeConv?.participantId
    if (!recipientId) return

    try {
      const res = await sendMessage(selectedConversationId, recipientId, content)
      if (res.success) {
        const updatedMsgs = await getMessages(selectedConversationId)
        setMessages(updatedMsgs)
        await loadConvs()
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  const activeConv = conversations.find((c) => c.id === selectedConversationId)

  const header = activeConv
    ? {
        name: activeConv.name,
        company: activeConv.company || 'MVGR Student Applicant',
        avatar: activeConv.avatar || activeConv.name.substring(0, 2).toUpperCase(),
        status: 'online' as const,
      }
    : null

  const formattedMessages = messages.map((m) => ({
    id: m.id,
    sender: m.isMe ? ('me' as const) : ('them' as const),
    text: m.text,
    time: m.timestamp,
    read: true,
  }))

  const convListItems = conversations.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company || 'Student Applicant',
    avatar: c.avatar || c.name.substring(0, 2).toUpperCase(),
    lastMessage: c.lastMessage,
    time: c.timestamp,
    unread: c.unreadCount > 0,
    status: 'online' as const,
  }))

  return (
    <div className="space-y-6 h-[calc(100vh-180px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employer Messages</h1>
          <p className="text-muted-foreground mt-1">
            Direct real-time chat with MVGR student candidates and applicants
          </p>
        </div>

        {selectedConversationId && (
          <Button
            variant="outline"
            size="sm"
            className="md:hidden gap-1"
            onClick={() => setSelectedConversationId(null)}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Chats
          </Button>
        )}
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden relative">
        <div className={`w-full md:w-80 h-full ${selectedConversationId ? 'hidden md:block' : 'block'}`}>
          <ConversationList
            conversations={convListItems}
            selectedId={selectedConversationId}
            onSelect={(id) => setSelectedConversationId(id)}
            searchPlaceholder="Search student candidates..."
          />
        </div>

        <div className={`flex-1 h-full ${!selectedConversationId ? 'hidden md:block' : 'block'}`}>
          <MessageThread
            header={header}
            messages={formattedMessages}
            onSendMessage={handleSend}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  )
}
