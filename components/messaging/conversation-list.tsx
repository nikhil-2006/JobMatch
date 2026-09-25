'use client'

import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { useState } from 'react'

export interface ConversationItem {
  id: string
  name: string
  company: string
  avatar: string
  lastMessage: string
  time: string
  unread: boolean
  status: 'online' | 'offline'
}

interface ConversationListProps {
  conversations: ConversationItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  searchPlaceholder?: string
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchPlaceholder = 'Search conversations...',
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className="w-full md:w-80 border border-border/50 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border/50 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length > 0 ? (
          <div className="divide-y divide-border/50">
            {filtered.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={`w-full p-4 text-left transition-colors ${
                  selectedId === conversation.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold">
                      {conversation.avatar}
                    </div>
                    {conversation.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground truncate">
                        {conversation.name}
                      </p>
                      {conversation.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{conversation.company}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">{conversation.time}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">No conversations found</div>
        )}
      </div>
    </Card>
  )
}
