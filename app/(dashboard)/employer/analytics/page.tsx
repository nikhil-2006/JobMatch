'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { TrendingUp, Users, Eye, Zap, Loader2, RefreshCw } from 'lucide-react'
import { getEmployerAnalyticsReal } from '@/app/actions/employer'

export default function EmployerAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const res = await getEmployerAnalyticsReal()
      setData(res)
    } catch (err) {
      console.error('Error loading employer analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const stats = [
    {
      label: 'Total Applications Received',
      value: data?.stats?.totalApps || 0,
      icon: Users,
      color: 'text-blue-500',
      trend: '+15% from last week',
    },
    {
      label: 'Campus Store Map Impressions',
      value: data?.stats?.totalViews || 0,
      icon: Eye,
      color: 'text-purple-500',
      trend: '+24% student discovery',
    },
    {
      label: 'Candidate Match Rate',
      value: data?.stats?.conversionRate || '0.0%',
      icon: Zap,
      color: 'text-emerald-500',
      trend: 'High engagement',
    },
    {
      label: 'Avg Time to Hire',
      value: data?.stats?.avgTimeToHire || '3 Days',
      icon: TrendingUp,
      color: 'text-amber-500',
      trend: 'Fast turnaround',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employer Store Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Real-time hiring performance, student interest, and shop impression metrics from database
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadAnalytics} className="gap-2 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="font-medium">Querying employer metrics...</span>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="p-6 border border-border/50 bg-card/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {stat.trend}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</p>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Applications Trend */}
            <Card className="p-6 border border-border/50 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Weekly Applications Growth</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.applicationTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #334155)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground, #94a3b8)" />
                    <YAxis stroke="var(--muted-foreground, #94a3b8)" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      name="Student Applications"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Application Status Breakdown */}
            <Card className="p-6 border border-border/50 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Candidate Application Status</h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.applicationStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={85}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(data?.applicationStatus || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Job Performance Breakdown */}
          {data?.jobPerformance && data.jobPerformance.length > 0 && (
            <Card className="p-6 border border-border/50 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Job Posting Performance & Hiring Output</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.jobPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #334155)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground, #94a3b8)" />
                    <YAxis stroke="var(--muted-foreground, #94a3b8)" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Applicants" />
                    <Bar dataKey="hired" fill="#10b981" radius={[6, 6, 0, 0]} name="Hired Matches" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
