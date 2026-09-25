'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Briefcase, Users, Clock, MapPin, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const features = [
    {
      icon: MapPin,
      title: 'Smart Location Matching',
      description: 'Find jobs near your campus or choose remote opportunities',
    },
    {
      icon: Clock,
      title: 'Schedule Flexibility',
      description: 'Set your availability and get matched with jobs that fit your timetable',
    },
    {
      icon: Users,
      title: 'Direct Employer Connections',
      description: 'Connect directly with employers and apply to opportunities instantly',
    },
    {
      icon: Star,
      title: 'Build Your Profile',
      description: 'Showcase your skills and experience to attract better opportunities',
    },
    {
      icon: Briefcase,
      title: 'Job Management',
      description: 'Track applications and manage your work schedule in one place',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Earn experience, collect reviews, and build your professional network',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-foreground">JobMatch</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <h1 className="text-balance bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-5xl font-bold text-transparent sm:text-6xl">
            Smart Part-Time Jobs for Students
          </h1>
          <p className="mt-6 text-balance text-lg text-muted-foreground">
            Find flexible job opportunities that match your schedule and location. Connect with employers, manage your work, and grow your career—all in one place.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto font-bold">
                Create Account
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Already a member? Sign in
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Why Choose JobMatch?</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to find and manage part-time work
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group relative overflow-hidden border border-border/50 bg-card/50 p-8 backdrop-blur transition-all hover:border-primary/50 hover:bg-card/80">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-12 text-center">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-foreground">Ready to start earning?</h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of students finding flexible opportunities that fit their lifestyle
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/sign-up">
                <Button size="lg" className="font-bold">Get Started Now</Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; 2024 JobMatch. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
