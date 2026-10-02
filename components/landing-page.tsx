'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Briefcase, Users, Clock, MapPin, Star, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import HeroMatchVisual from '@/components/hero-match-visual'
import HowItWorksSection from '@/components/how-it-works-section'
import JobCard from '@/components/job-card'

import { useEffect, useState } from 'react'
import { signOutUserAction } from '@/app/actions/users'
import { LogOut, LayoutDashboard } from 'lucide-react'

export default function LandingPage() {
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; name: string; role: string } | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('currentUser')
      if (saved) {
        setLoggedInUser(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const handleLogout = async () => {
    try {
      await signOutUserAction()
      localStorage.removeItem('currentUser')
      setLoggedInUser(null)
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const getDashboardHref = () => {
    if (!loggedInUser) return '/sign-in'
    if (loggedInUser.role === 'admin') return '/admin/dashboard'
    if (loggedInUser.role === 'employer') return '/employer/dashboard'
    return '/student/dashboard'
  }

  const features = [
    {
      icon: MapPin,
      title: 'Smart Location Matching',
      description: 'Find jobs near MVGR campus hostels or choose remote student opportunities',
    },
    {
      icon: Clock,
      title: 'Schedule Flexibility',
      description: 'Set your timetable availability and get matched with shifts that fit your classes',
    },
    {
      icon: Users,
      title: 'Direct Employer Connections',
      description: 'Connect directly with verified campus store partners and apply instantly',
    },
    {
      icon: Star,
      title: 'Build Your Profile',
      description: 'Showcase your skills, collect verified ratings, and attract top part-time roles',
    },
    {
      icon: Briefcase,
      title: 'Job Management',
      description: 'Track applications, manage your work shifts, and view store maps in one portal',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth & Certificates',
      description: 'Earn experience, receive employer certificates, and build your resume',
    },
  ]

  const featuredJobs = [
    {
      id: 'fj-1',
      title: 'MVGR Canteen Assistant',
      company: 'Campus Dining Services',
      location: 'MVGR Campus Main Arcade',
      distance: '0.2 km',
      hourlyRate: '180/hr',
      jobType: 'part-time' as const,
      skills: ['Communication', 'Customer Service', 'Food Service'],
      description: 'Assist with daily order processing, cashier operations, and student service during lunch shifts.',
      applicants: 12,
      rating: 4.8,
    },
    {
      id: 'fj-2',
      title: 'Xerox & Stationery Attendant',
      company: 'Tech Print Arcade',
      location: 'Academic Block 3',
      distance: '0.4 km',
      hourlyRate: '200/hr',
      jobType: 'part-time' as const,
      skills: ['Document Prep', 'Printing', 'Basic Hardware'],
      description: 'Manage printing requests, spiral binding, and stationery distribution for students and faculty.',
      applicants: 8,
      rating: 4.9,
    },
    {
      id: 'fj-3',
      title: 'Library Catalog Assistant',
      company: 'MVGR Central Library',
      location: 'Central Library Arcade',
      distance: '0.1 km',
      hourlyRate: '160/hr',
      jobType: 'contract' as const,
      skills: ['Organization', 'Data Entry', 'Python'],
      description: 'Help manage digital cataloging, book checkouts, and quiet study room scheduling.',
      applicants: 15,
      rating: 4.7,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-105">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground">
                Job<span className="text-primary">Match</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {loggedInUser ? (
                <>
                  <Link href={getDashboardHref()}>
                    <Button size="sm" className="font-bold gap-1.5 shadow-sm">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="font-semibold text-destructive gap-1.5 border-destructive/20 hover:bg-destructive/10">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm" className="font-semibold">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm" className="font-bold shadow-sm">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Signature Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Hero Content Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>MVGR Campus Student Career Portal</span>
            </div>

            <h1 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
              Smart Part-Time Jobs{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                Matched to You
              </span>
            </h1>

            <p className="text-balance text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              JobMatch connects MVGR students with verified campus stores and nearby part-time work. Match your skills, fit your timetable, and build your career resume.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {loggedInUser ? (
                <>
                  <Link href={getDashboardHref()} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto font-bold text-base gap-2 px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={handleLogout} className="w-full sm:w-auto text-base py-6 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto font-bold text-base gap-2 px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
                      <span>Get Started — It's Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base py-6 rounded-xl border-border/80">
                      Sign In to Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-black text-foreground">100+</div>
                <div className="text-xs text-muted-foreground font-medium">Active Jobs</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-black text-emerald-500">24h</div>
                <div className="text-xs text-muted-foreground font-medium">Avg Verification</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-black text-primary">100%</div>
                <div className="text-xs text-muted-foreground font-medium">Campus Verified</div>
              </div>
            </div>
          </motion.div>

          {/* Interactive SaaS Matching Visual Right */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-6"
          >
            <HeroMatchVisual />
          </motion.div>
        </div>
      </section>

      {/* How JobMatch Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Platform Features
          </span>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
            Why Choose JobMatch?
          </h2>
          <p className="text-muted-foreground text-base">
            Everything you need to discover, apply for, and manage campus part-time work.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group relative overflow-hidden border border-border/60 bg-card/60 p-8 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-card/90 hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3.5 border border-primary/20 text-primary transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Featured Jobs Preview Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Popular Campus Opportunities</h2>
            <p className="text-sm text-muted-foreground mt-1">Live vacancies registered by MVGR partner shops</p>
          </div>
          <Link href="/sign-in">
            <Button variant="outline" className="font-bold gap-2">
              <span>View All Campus Openings</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.map((job) => (
            <Link key={job.id} href="/sign-up">
              <JobCard {...job} />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-r from-primary/15 via-primary/5 to-emerald-500/10 p-10 sm:p-14 text-center rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Verified Campus Partnerships</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Ready to start earning on campus?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Join MVGR students finding flexible part-time jobs that match their skills and schedule.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link href="/sign-up">
                <Button size="lg" className="font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
                  Create Student Account
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg" className="text-base py-6 rounded-xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/60 py-8 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">JobMatch MVGR</span>
          </div>
          <p>&copy; {new Date().getFullYear()} JobMatch. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
