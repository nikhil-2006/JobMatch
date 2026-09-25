'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RoleSelectionPage from '@/components/role-selection-page'

export default function RoleSelectionRoute() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string | null; role: string } | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage (set during sign-in)
    const currentUser = localStorage.getItem('currentUser')

    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        setUser({
          id: userData.id,
          name: userData.name,
          role: userData.role,
        })
      } catch (error) {
        console.error('Failed to parse user data:', error)
        router.push('/')
      }
    } else {
      router.push('/')
    }

    setIsLoading(false)
  }, [router])

  if (isLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <RoleSelectionPage userId={user.id} userName={user.name || 'User'} />
}
