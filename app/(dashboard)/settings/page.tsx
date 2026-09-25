'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function SettingsRedirectPage() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.includes('/admin')) {
      router.replace('/admin/settings')
    } else if (pathname.includes('/employer')) {
      router.replace('/employer/settings')
    } else {
      router.replace('/student/settings')
    }
  }, [pathname, router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground text-sm">Redirecting to Settings...</p>
    </div>
  )
}
