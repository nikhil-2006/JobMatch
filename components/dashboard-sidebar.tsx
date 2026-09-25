'use client'

import { Briefcase, Home, MessageSquare, Users, BarChart3, Settings, LogOut, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { signOutUserAction } from '@/app/actions/users'

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isStudent = pathname.includes('/student')
  const isEmployer = pathname.includes('/employer')
  const isAdmin = pathname.includes('/admin')

  const studentLinks = [
    {
      href: '/student/dashboard',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/student/dashboard',
    },
    {
      href: '/student/jobs',
      label: 'Browse Jobs',
      icon: Briefcase,
      active: pathname.includes('/student/jobs'),
    },
    {
      href: '/student/applications',
      label: 'My Applications',
      icon: Users,
      active: pathname.includes('/student/applications'),
    },
    {
      href: '/student/schedule',
      label: 'My Schedule',
      icon: Calendar,
      active: pathname.includes('/student/schedule'),
    },
    {
      href: '/student/messages',
      label: 'Messages',
      icon: MessageSquare,
      active: pathname.includes('/student/messages'),
    },
    {
      href: '/student/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname.includes('/student/settings'),
    },
  ]

  const employerLinks = [
    {
      href: '/employer/dashboard',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/employer/dashboard',
    },
    {
      href: '/employer/jobs',
      label: 'My Jobs',
      icon: Briefcase,
      active: pathname.includes('/employer/jobs'),
    },
    {
      href: '/employer/applicants',
      label: 'Applicants',
      icon: Users,
      active: pathname.includes('/employer/applicants'),
    },
    {
      href: '/employer/messages',
      label: 'Messages',
      icon: MessageSquare,
      active: pathname.includes('/employer/messages'),
    },
    {
      href: '/employer/analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: pathname.includes('/employer/analytics'),
    },
    {
      href: '/employer/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname.includes('/employer/settings'),
    },
  ]

  const adminLinks = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: Home,
      active: pathname === '/admin/dashboard',
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
      active: pathname.includes('/admin/users'),
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: pathname.includes('/admin/analytics'),
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname.includes('/admin/settings'),
    },
  ]

  const links = isAdmin ? adminLinks : isEmployer ? employerLinks : studentLinks

  const handleLogout = async () => {
    await signOutUserAction()
    localStorage.removeItem('currentUser')
    window.location.href = '/'
  }

  return (
    <aside className="hidden md:flex w-64 border-r border-border/40 bg-background/50 flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-border/40">
        <Briefcase className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">JobMatch</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-auto px-4 py-6">
        <div className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  link.active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-border/40 px-4 py-4 space-y-2">
        <button
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
