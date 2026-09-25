'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Briefcase, Building2, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface RoleSelectionPageProps {
  userId: string
  userName: string
}

export default function RoleSelectionPage({ userId, userName }: RoleSelectionPageProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'employer' | 'admin' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const roles = [
    {
      id: 'student',
      icon: Briefcase,
      title: 'I&apos;m a Student',
      description: 'Find part-time opportunities and earn while studying',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'employer',
      icon: Building2,
      title: 'I&apos;m an Employer',
      description: 'Post jobs and find talented student candidates',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      id: 'admin',
      icon: Shield,
      title: 'I&apos;m an Admin',
      description: 'Manage the platform and review content',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  const handleSelectRole = (role: 'student' | 'employer' | 'admin') => {
    setSelectedRole(role)
    setIsLoading(true)

    // Simulate network delay
    setTimeout(() => {
      // Update localStorage with selected role
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        userData.role = role
        localStorage.setItem('currentUser', JSON.stringify(userData))
      }

      // Redirect based on role
      if (role === 'student') {
        router.push('/student/dashboard')
      } else if (role === 'employer') {
        router.push('/employer/dashboard')
      } else {
        router.push('/admin/dashboard')
      }
    }, 500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome, {userName}!</h1>
          <p className="text-lg text-muted-foreground">
            How would you like to use JobMatch?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id
            const isLoadingThisRole = isLoading && selectedRole === role.id

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={`group relative overflow-hidden p-8 cursor-pointer transition-all duration-300 border-2 ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => !isLoading && handleSelectRole(role.id as any)}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-5`} />
                  </div>

                  <div className="relative z-10">
                    <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-br ${role.color} bg-opacity-10 p-4`}>
                      <Icon className="h-8 w-8 text-primary" />
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">{role.title}</h3>
                    <p className="text-muted-foreground mb-8">{role.description}</p>

                    <Button
                      className="w-full"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectRole(role.id as any)
                      }}
                    >
                      {isLoadingThisRole ? 'Setting up...' : 'Choose'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          You can change your role anytime in your account settings
        </motion.p>
      </div>
    </main>
  )
}
