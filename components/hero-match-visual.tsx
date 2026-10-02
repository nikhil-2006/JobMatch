'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Sparkles, User, MapPin, Briefcase, Zap, Star } from 'lucide-react'

interface JobSample {
  id: string
  title: string
  company: string
  pay: string
  jobType: string
  matchScore: string
  matchingSkills: string[]
  location: string
}

const JOBS_DATA: JobSample[] = [
  {
    id: 'job-1',
    title: 'Web Developer',
    company: 'MVGR Tech Arcade',
    pay: '₹250/hr',
    jobType: 'Part-Time',
    matchScore: '98%',
    matchingSkills: ['React', 'Web Development'],
    location: 'MVGR Main Gate',
  },
  {
    id: 'job-2',
    title: 'Frontend Intern',
    company: 'Campus Code Lab',
    pay: '₹300/hr',
    jobType: 'Internship',
    matchScore: '95%',
    matchingSkills: ['React', 'Java'],
    location: 'CS Block, Room 204',
  },
  {
    id: 'job-3',
    title: 'Data Entry Specialist',
    company: 'Academic Library',
    pay: '₹180/hr',
    jobType: 'Flexible',
    matchScore: '92%',
    matchingSkills: ['Python', 'Communication'],
    location: 'Central Library Arcade',
  },
  {
    id: 'job-4',
    title: 'Social Media Assistant',
    company: 'Student Council',
    pay: '₹200/hr',
    jobType: 'Part-Time',
    matchScore: '96%',
    matchingSkills: ['Communication', 'Web Development'],
    location: 'Student Activity Hub',
  },
  {
    id: 'job-5',
    title: 'Campus Store Assistant',
    company: 'MVGR Central Store',
    pay: '₹160/hr',
    jobType: 'Part-Time',
    matchScore: '94%',
    matchingSkills: ['Communication', 'Java'],
    location: 'Hostel Block Arcade',
  },
]

const SKILLS = [
  { name: 'React', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400', pos: 'top-2 left-2 sm:top-4 sm:left-4' },
  { name: 'Java', color: 'border-orange-500/40 bg-orange-500/10 text-orange-500 dark:text-orange-400', pos: 'bottom-16 left-0 sm:bottom-20 sm:left-2' },
  { name: 'Python', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400', pos: 'top-2 right-2 sm:top-4 sm:right-4' },
  { name: 'Communication', color: 'border-purple-500/40 bg-purple-500/10 text-purple-500 dark:text-purple-400', pos: 'bottom-16 right-0 sm:bottom-20 sm:right-2' },
  { name: 'Web Development', color: 'border-blue-500/40 bg-blue-500/10 text-blue-500 dark:text-blue-400', pos: 'bottom-2 left-1/2 -translate-x-1/2 sm:bottom-4' },
]

export default function HeroMatchVisual() {
  const shouldReduceMotion = useReducedMotion()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<'entering' | 'connecting' | 'matched'>('entering')

  useEffect(() => {
    if (shouldReduceMotion) return

    // Phase progression logic per job cycle (Total 4.5 seconds)
    const phase1Timer = setTimeout(() => setPhase('connecting'), 600)
    const phase2Timer = setTimeout(() => setPhase('matched'), 1800)

    const cycleTimer = setTimeout(() => {
      setPhase('entering')
      setCurrentIndex((prev) => (prev + 1) % JOBS_DATA.length)
    }, 4600)

    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearTimeout(cycleTimer)
    }
  }, [currentIndex, shouldReduceMotion])

  const currentJob = JOBS_DATA[currentIndex]

  return (
    <div className="relative w-full max-w-xl mx-auto h-[420px] sm:h-[460px] flex items-center justify-center p-4 select-none overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-card/80 via-card/40 to-background/60 backdrop-blur-xl shadow-2xl">
      {/* Background Decorative Grid Orbits */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full border border-primary/10 dark:border-primary/20 animate-[spin_60s_linear_infinite]" />
        <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full border border-primary/15 dark:border-primary/25 border-dashed animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent opacity-60 blur-2xl" />
      </div>

      {/* SVG Connecting Beam Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 500 450">
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {phase !== 'entering' && (
          <motion.path
            d="M 250 225 L 360 110"
            fill="none"
            stroke="url(#beamGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </svg>

      {/* Floating Skill Badges */}
      {SKILLS.map((skill, idx) => {
        const isMatching = currentJob.matchingSkills.includes(skill.name)
        return (
          <motion.div
            key={skill.name}
            className={`absolute z-20 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all duration-300 ${skill.pos} ${
              isMatching && phase !== 'entering'
                ? 'scale-110 shadow-lg shadow-primary/20 ring-2 ring-primary/50 font-bold'
                : 'opacity-70 grayscale-[30%]'
            } ${skill.color}`}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -6, 0],
                  }
            }
            transition={{
              duration: 3 + idx * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="flex items-center gap-1.5">
              {isMatching && phase !== 'entering' && (
                <Sparkles className="w-3 h-3 text-primary animate-pulse shrink-0" />
              )}
              {skill.name}
            </span>
          </motion.div>
        )
      })}

      {/* Central Student Profile Card */}
      <motion.div
        className="relative z-30 flex flex-col items-center justify-center p-5 rounded-2xl bg-card border border-border/80 shadow-xl backdrop-blur-xl w-[200px] sm:w-[220px]"
        animate={
          phase === 'matched' && !shouldReduceMotion
            ? { scale: [1, 1.04, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.4 }}
      >
        {/* Radar Pulse Effect on Match */}
        {phase === 'matched' && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-emerald-500/60 pointer-events-none"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}

        <div className="relative mb-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-primary/30 via-primary to-emerald-400 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        </div>

        <h4 className="text-sm font-bold text-foreground text-center line-clamp-1">
          Kiran Kumar
        </h4>
        <p className="text-[11px] text-muted-foreground text-center">
          MVGR B.Tech Student
        </p>

        <div className="mt-2.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary flex items-center gap-1">
          <Zap className="w-3 h-3 shrink-0" />
          <span>Available for Part-Time</span>
        </div>
      </motion.div>

      {/* Floating Job Opportunity Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentJob.id}
          className="absolute top-6 right-3 sm:top-8 sm:right-6 z-30 w-[220px] sm:w-[240px] p-4 rounded-2xl bg-card/95 border border-border/80 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Part-Time Vacancy
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-foreground line-clamp-1">
                {currentJob.title}
              </h4>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
              {currentJob.pay}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{currentJob.company}</span>
          </div>

          {/* Matched State Indicator */}
          {phase === 'matched' ? (
            <motion.div
              className="mt-3 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Matched! ({currentJob.matchScore})</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
            </motion.div>
          ) : (
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-primary" />
                {currentJob.jobType}
              </span>
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                Matching...
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
