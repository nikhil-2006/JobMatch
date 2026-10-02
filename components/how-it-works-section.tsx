'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, Send, Trophy, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

const STEPS = [
  {
    number: '01',
    title: 'Create Profile',
    description: 'Set your student skills, campus availability & preferred work locations.',
    icon: UserPlus,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    number: '02',
    title: 'Discover Jobs',
    description: 'Smart GPS matching connects you with verified stores & campus opportunities.',
    icon: Search,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    number: '03',
    title: 'Apply Instantly',
    description: 'Submit your profile with one click directly to store managers and admins.',
    icon: Send,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    number: '04',
    title: 'Get Hired & Earn',
    description: 'Work flexible part-time shifts, earn competitive hourly wages & build experience.',
    icon: Trophy,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
]

export default function HowItWorksSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Simple 4-Step Process
        </span>
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl tracking-tight">
          How JobMatch Works
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          From registration to your first paycheck — designed specifically for MVGR students.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative"
      >
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div key={step.number} variants={cardVariants} className="relative">
              <Card className="h-full p-6 border border-border/60 bg-card/60 backdrop-blur-md hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-muted-foreground/30 font-mono group-hover:text-primary/50 transition-colors">
                      {step.number}
                    </span>
                    <div className={`p-3 rounded-xl border ${step.color} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Progress Arrow indicator (Except last card) */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-muted-foreground/40">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
