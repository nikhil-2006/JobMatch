'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Phone, Video, MoreVertical, FileText, Send, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export interface ThreadMessage {
  id: string
  sender: 'me' | 'them'
  text: string
  time: string
  read: boolean
  type?: 'text' | 'job-application' | 'interview'
}

export interface ConversationHeader {
  name: string
  company: string
  avatar: string
  status: 'online' | 'offline'
}

interface MessageThreadProps {
  header: ConversationHeader | null
  messages: ThreadMessage[]
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function MessageThread({
  header,
  messages,
  onSendMessage,
  isLoading = false,
}: MessageThreadProps) {
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput)
      setMessageInput('')
    }
  }

  const quickReplies = [
    'I am available for the shift!',
    'Can we discuss the timing?',
    'Thank you for confirming!',
  ]

  if (!header) {
    return (
      <Card className="flex flex-col flex-1 h-full border border-border/50 overflow-hidden items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
          <MessageCircle className="h-10 w-10" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No Chat Selected</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Select a conversation thread from the left menu to start messaging in real-time.
        </p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col flex-1 h-full border border-border/50 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {header.avatar}
            </div>
            {header.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">{header.name}</p>
            <p className="text-xs text-muted-foreground">{header.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" title="Call">
            <Phone className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" title="Video">
            <Video className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="ghost" title="More">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/10">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'interview' ? (
                <Card
                  className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-muted/50 bg-muted/40'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="p-2 rounded-xl bg-primary/20 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">Shift / Interview Invitation</p>
                      <p className="text-xs text-muted-foreground mt-1">{message.text}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div
                  className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    message.sender === 'me'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-foreground border border-border/50 rounded-bl-none'
                  }`}
                >
                  <p>{message.text}</p>
                  <span
                    className={`text-[10px] block text-right mt-1 font-medium ${
                      message.sender === 'me' ? 'text-primary-foreground/75' : 'text-muted-foreground'
                    }`}
                  >
                    {message.time}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-muted-foreground py-8">
            No messages in this thread yet. Send a message below to start chatting!
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Presets */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center gap-2 overflow-x-auto">
        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(reply)}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-background border border-border/60 hover:border-primary text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3.5 border-t border-border/50 bg-card flex items-center gap-2">
        <Input
          placeholder="Type your message..."
          className="bg-muted/40"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && messageInput.trim() && !isLoading) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={isLoading}
        />
        <Button
          size="icon"
          disabled={!messageInput.trim() || isLoading}
          onClick={handleSend}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
