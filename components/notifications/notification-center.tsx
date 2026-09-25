'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react'
import { getNotifications, markNotificationAsRead } from '@/app/actions/notifications'

export interface NotificationItem {
  id: string
  type: 'message' | 'interview' | 'application' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'message':
      return <MessageSquare className="h-5 w-5" />
    case 'interview':
      return <Clock className="h-5 w-5" />
    case 'application':
      return <FileText className="h-5 w-5" />
    default:
      return <AlertCircle className="h-5 w-5" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'message':
      return 'text-blue-500'
    case 'interview':
      return 'text-purple-500'
    case 'application':
      return 'text-green-500'
    default:
      return 'text-yellow-500'
  }
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const fetchNotes = async () => {
    try {
      const data = await getNotifications()
      setNotifications((data || []) as NotificationItem[])
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      fetchNotes()
    } catch (err) {
      console.error('Error marking read:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 border border-border/50 max-h-96 overflow-hidden flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              <div className="divide-y divide-border/50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex-shrink-0 ${getNotificationColor(notification.type)}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
